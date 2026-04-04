const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // <--- Fixed this
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const {
  loadCreatorContext,
  buildCreatorPrompt,
  parseCreatorResponse,
} = require("../prompts/creator_agent");
const {
  loadComplianceRules,
  buildCompliancePrompt,
  parseComplianceResponse,
} = require("../prompts/compliance_agent");

initializeApp();
const db = getFirestore();

// Initialize the API client using the Secret we set in Firebase
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

const CREATOR_MODEL_NAME = process.env.CREATOR_MODEL_NAME || "gemini-1.5-flash";
const COMPLIANCE_MODEL_NAME = process.env.COMPLIANCE_MODEL_NAME || "gemini-1.5-flash";

// Get the model instances
const creatorModel = genAI.getGenerativeModel({ model: CREATOR_MODEL_NAME });
const complianceModel = genAI.getGenerativeModel({ model: COMPLIANCE_MODEL_NAME });

const MAX_ATTEMPTS = 3;
// v2_interactive is listed first -- it is the primary format. Both always run
// in parallel so an error in v1 can never prevent v2 from completing.
const BOTH_FORMATS = ["v2_interactive", "v1_swipe"];

/**
 * Run the Maker-Checker loop for a single format.
 * Returns { lessonId, attempts, status, reasoning } or null on hard failure.
 */
async function runSingleFormat(data, requestId, ownerID, lessonFormat, complianceRules) {
  const creatorContext = await loadCreatorContext(lessonFormat);
  const requestWithFormat = {...data, lessonFormat};

  let lastComplianceReason = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const creatorPrompt = buildCreatorPrompt(
      {
        request: requestWithFormat,
        requestId,
        attempt,
        lastComplianceReason,
      },
      creatorContext,
    );

    const result = await creatorModel.generateContent(creatorPrompt);
    const creatorResponse = await result.response;

    const creatorText =
      typeof creatorResponse.text === "function"
        ? creatorResponse.text()
        : creatorResponse.text || "";
    const lessonDraft = parseCreatorResponse(creatorText, lessonFormat);

    const compliancePrompt = buildCompliancePrompt(
      lessonDraft,
      {
        request: requestWithFormat,
        requestId,
        attempt,
      },
      complianceRules,
    );

    const compResult = await complianceModel.generateContent(compliancePrompt);
    const complianceResponse = await compResult.response;

    const complianceText =
      typeof complianceResponse.text === "function"
        ? complianceResponse.text()
        : complianceResponse.text || "";
    const {status, reasoning} = parseComplianceResponse(complianceText);
    lastComplianceReason = reasoning;

    const normalisedStatus = (status || "").toUpperCase();

    if (normalisedStatus === "PASS") {
      const lessonId = await commitPassBatch({
        requestId,
        ownerID,
        requestData: data,
        lessonDraft,
        reasoning,
        attempt,
        lessonFormat,
      });
      return {lessonId, attempts: attempt, status: "PASS", reasoning};
    }

    await logAgentAttempt({
      requestId,
      lessonFormat,
      status: "FAIL",
      attempt,
      lessonDraft,
      reasoning,
    });

    if (attempt === MAX_ATTEMPTS) {
      await logFinalFailure({
        requestId,
        lessonFormat,
        totalAttempts: attempt,
        lastComplianceReason: reasoning,
      });
      return {lessonId: null, attempts: attempt, status: "FAIL", reasoning};
    }
  }

  return {lessonId: null, attempts: MAX_ATTEMPTS, status: "FAIL", reasoning: lastComplianceReason};
}

/**
 * Core Maker-Checker loop -- always generates BOTH v2_interactive (primary)
 * and v1_swipe. Both run in parallel via Promise.allSettled so a JS error or
 * compliance failure in one format can NEVER block the other from completing.
 * v2_interactive is the priority format; v1_swipe is the fallback.
 */
async function runMakerChecker(snap, context) {
  const data = snap.data() || {};
  const requestId = context.requestId || snap.id;
  const ownerID = data.userID || "public";

  const complianceRules = await loadComplianceRules();

  // Run both formats fully in parallel. allSettled guarantees both always
  // attempt even if one throws an unhandled error.
  const [v2Result, v1Result] = await Promise.allSettled([
    runSingleFormat(data, requestId, ownerID, "v2_interactive", complianceRules),
    runSingleFormat(data, requestId, ownerID, "v1_swipe", complianceRules),
  ]);

  // Unwrap settled results. A "rejected" settlement means an unexpected JS
  // error (not a compliance FAIL) -- treat that format as FAIL with 0 attempts.
  const v2 = v2Result.status === "fulfilled"
    ? v2Result.value
    : {lessonId: null, attempts: 0, status: "FAIL", reasoning: v2Result.reason?.message || "Unhandled error"};

  const v1 = v1Result.status === "fulfilled"
    ? v1Result.value
    : {lessonId: null, attempts: 0, status: "FAIL", reasoning: v1Result.reason?.message || "Unhandled error"};

  const bothPassed = v2.status === "PASS" && v1.status === "PASS";
  const anyPassed  = v2.status === "PASS" || v1.status === "PASS";

  let overallStatus;
  if (bothPassed) {
    overallStatus = "completed";
  } else if (anyPassed) {
    overallStatus = "partial";
  } else {
    overallStatus = "failed_compliance";
  }

  await db.collection("lesson_requests").doc(requestId).update({
    status: overallStatus,
    v2_lessonId: v2.lessonId || null,
    v2_status: v2.status,
    attempts_v2: v2.attempts,
    v1_lessonId: v1.lessonId || null,
    v1_status: v1.status,
    attempts_v1: v1.attempts,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Commit a PASS batch for a single format: user_lessons + screens.
 * Returns the auto-generated lesson document ID.
 */
async function commitPassBatch(params) {
  const {
    requestId,
    ownerID,
    requestData,
    lessonDraft,
    reasoning,
    attempt,
    lessonFormat,
  } = params;

  const batch = db.batch();

  const lessonRef = db.collection("user_lessons").doc();
  const lessonMetadata = lessonDraft.lessonMetadata || {};
  const screens = Array.isArray(lessonDraft.screens)
    ? lessonDraft.screens
    : [];

  if (screens.length === 0) {
    throw new Error(`Creator Agent (${lessonFormat}) returned no screens.`);
  }

  const lessonName =
    requestData.lessonName || requestData.userLessonRequest || null;

  batch.set(lessonRef, {
    userID: ownerID,
    category: requestData.category || "Custom",
    moduleName: requestData.moduleName || null,
    lessonName,
    lessonFormat,
    lessonLevel:
      lessonMetadata.difficulty_level || requestData.lessonLevel || null,
    lessonTime:
      lessonMetadata.estimated_time || requestData.lessonTime || null,
    learningStyle: requestData.learningStyle || null,
    requestID: requestId,
    goal: lessonMetadata.goal || null,
    goalOrder: lessonMetadata.goalOrder || 1,
    lessonType: "user",
    compliance_audit: {
      status: "PASS",
      reasoning,
      attemptNumber: attempt,
      checkedAt: FieldValue.serverTimestamp(),
    },
    human_approved: false,
    version: 1,
    created_at: FieldValue.serverTimestamp(),
  });

  screens.forEach((screen, index) => {
    const screenRef = db.collection("screens").doc();

    const commonFields = {
      userID: ownerID,
      lessonId: lessonRef.id,
      lessonType: "user",
      lessonFormat,
      lessonName,
      requestID: requestId,
      learningStyle: requestData.learningStyle || null,
      screenNumber: index + 1,
    };

    const shapeFields =
      lessonFormat === "v2_interactive"
        ? {
            questionText: screen.questionText || "",
            emoji: screen.emoji || "",
            options: Array.isArray(screen.options) ? screen.options : [],
            correctIndex:
              typeof screen.correctIndex === "number" ? screen.correctIndex : 0,
            feedbackCorrect: screen.feedbackCorrect || "",
            feedbackIncorrect: screen.feedbackIncorrect || "",
            learnMore: screen.learnMore || null,
          }
        : {
            screenType: screen.screenType || null,
            headline: screen.headline || "",
            paragraph: screen.paragraph || "",
            question: screen.question || "",
            optionA: screen.optionA || "",
            optionB: screen.optionB || "",
            optionC: screen.optionC || "",
            optionD: screen.optionD || "",
            questionAnswer: screen.questionAnswer || "",
            feedbackCorrect: screen.feedbackCorrect || "",
            feedbackIncorrect: screen.feedbackIncorrect || "",
            keyTakeaway1: screen.keyTakeaway1 || "",
            keyTakeaway2: screen.keyTakeaway2 || "",
            keyTakeaway3: screen.keyTakeaway3 || "",
            LottieSuggestion: screen.LottieSuggestion || "",
            lottieURL: screen.lottieURL || "",
          };

    batch.set(screenRef, {...commonFields, ...shapeFields});
  });

  await batch.commit();
  return lessonRef.id;
}

/**
 * Log a single Maker-Checker attempt to agent_logs.
 */
async function logAgentAttempt(params) {
  const {requestId, lessonFormat, status, attempt, lessonDraft, reasoning} = params;

  await db.collection("agent_logs").add({
    requestId,
    lessonFormat,
    status,
    attemptNumber: attempt,
    lessonDraft: {
      lessonMetadata: lessonDraft.lessonMetadata || {},
      screens: Array.isArray(lessonDraft.screens)
        ? lessonDraft.screens
        : [],
    },
    reasoning,
    createdAt: FieldValue.serverTimestamp(),
    agent: "maker_checker_product_engine",
  });
}

/**
 * Log the final failed_compliance state to agent_logs.
 */
async function logFinalFailure(params) {
  const {requestId, lessonFormat, totalAttempts, lastComplianceReason} = params;

  await db.collection("agent_logs").add({
    requestId,
    lessonFormat,
    status: "failed_compliance",
    totalAttempts,
    lastComplianceReason,
    createdAt: FieldValue.serverTimestamp(),
    agent: "maker_checker_product_engine",
  });
}

exports.makerCheckerProductEngine = onDocumentCreated(
  {
    document: "lesson_requests/{requestId}",
    region: "europe-west2",
    timeoutSeconds: 240,
    memory: "1GiB",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      return;
    }

    const requestId = event.params.requestId;

    try {
      await runMakerChecker(snap, {requestId});
    } catch (error) {
      await db.collection("agent_logs").add({
        requestId,
        status: "error",
        errorMessage: error.message || String(error),
        createdAt: FieldValue.serverTimestamp(),
        agent: "maker_checker_product_engine",
      });

      await db.collection("lesson_requests").doc(requestId).update({
        status: "error",
        error_message: error.message || String(error),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  },
);

exports.runMakerChecker = runMakerChecker;

