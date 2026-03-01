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

/**
 * Core Maker-Checker loop.
 * Runs Creator and Compliance agents until PASS or hard failure.
 *
 * @param {import("firebase-admin/firestore").QueryDocumentSnapshot} snap
 * @param {{requestId: string}} context
 */
async function runMakerChecker(snap, context) {
  const data = snap.data() || {};
  const requestId = context.requestId || snap.id;

  const ownerID = data.userID || "public";

  const [creatorContext, complianceRules] = await Promise.all([
    loadCreatorContext(),
    loadComplianceRules(),
  ]);

  let lastComplianceReason = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // ---- Creator Agent ----
    const creatorPrompt = buildCreatorPrompt(
      {
        request: data,
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
    const lessonDraft = parseCreatorResponse(creatorText);

    // ---- Compliance Agent ----
    const compliancePrompt = buildCompliancePrompt(
      lessonDraft,
      {
        request: data,
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
      await commitPassBatch({
        requestId,
        ownerID,
        requestData: data,
        lessonDraft,
        reasoning,
        attempt,
      });
      return;
    }

    // ---- FAIL path for this attempt ----
    await logAgentAttempt({
      requestId,
      status: "FAIL",
      attempt,
      lessonDraft,
      reasoning,
    });

    if (attempt === MAX_ATTEMPTS) {
      // Hard failure after 3 failed compliance checks.
      await logFinalFailure({
        requestId,
        totalAttempts: attempt,
        lastComplianceReason: reasoning,
      });

      await db.collection("lesson_requests").doc(requestId).update({
        status: "failed_compliance",
        attempts: attempt,
        lastComplianceReason: reasoning,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return;
    }
  }
}

/**
 * Commit a PASS batch: lessons + screens + lesson_requests update.
 *
 * @param {{
 *  requestId: string;
 *  ownerID: string;
 *  requestData: any;
 *  lessonDraft: {lessonMetadata?: any; screens?: any[]};
 *  reasoning: string;
 *  attempt: number;
 * }} params
 */
async function commitPassBatch(params) {
  const {
    requestId,
    ownerID,
    requestData,
    lessonDraft,
    reasoning,
    attempt,
  } = params;

  const batch = db.batch();

  const lessonRef = db.collection("lessons").doc();
  const lessonMetadata = lessonDraft.lessonMetadata || {};
  const screens = Array.isArray(lessonDraft.screens)
    ? lessonDraft.screens
    : [];

  if (screens.length === 0) {
    throw new Error("Creator Agent returned no screens.");
  }

  const lessonName =
    requestData.lessonName || requestData.userLessonRequest || null;

  batch.set(lessonRef, {
    userID: ownerID,
    category: requestData.category || "Custom",
    moduleName: requestData.moduleName || null,
    lessonName,
    lessonLevel:
      lessonMetadata.difficulty_level || requestData.lessonLevel || null,
    lessonTime:
      lessonMetadata.estimated_time || requestData.lessonTime || null,
    learningStyle: requestData.learningStyle || null,
    requestID: requestId,
    goal: lessonMetadata.goal || null,
    goalOrder: lessonMetadata.goalOrder || 1,
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

    batch.set(screenRef, {
      userID: ownerID,
      lessonId: lessonRef.id,
      lessonName,
      requestID: requestId,
      learningStyle: requestData.learningStyle || null,
      screenNumber: index + 1,
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
    });
  });

  batch.update(db.collection("lesson_requests").doc(requestId), {
    status: "completed",
    lessonId: lessonRef.id,
    attempts: attempt,
    compliance_summary: {
      status: "PASS",
      reasoning,
      checkedAt: FieldValue.serverTimestamp(),
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Log a single Maker-Checker attempt to agent_logs.
 *
 * @param {{
 *  requestId: string;
 *  status: string;
 *  attempt: number;
 *  lessonDraft: {lessonMetadata?: any; screens?: any[]};
 *  reasoning: string;
 * }} params
 */
async function logAgentAttempt(params) {
  const {requestId, status, attempt, lessonDraft, reasoning} = params;

  await db.collection("agent_logs").add({
    requestId,
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
 *
 * @param {{
 *  requestId: string;
 *  totalAttempts: number;
 *  lastComplianceReason: string;
 * }} params
 */
async function logFinalFailure(params) {
  const {requestId, totalAttempts, lastComplianceReason} = params;

  await db.collection("agent_logs").add({
    requestId,
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
    timeoutSeconds: 120,
    memory: "512MiB",
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
      // Unrecoverable error path: log and mark request as error.
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

