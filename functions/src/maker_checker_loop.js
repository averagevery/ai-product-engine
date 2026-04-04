const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CREATOR_MODEL_NAME = process.env.CREATOR_MODEL_NAME || "gemini-1.5-flash";
const COMPLIANCE_MODEL_NAME = process.env.COMPLIANCE_MODEL_NAME || "gemini-1.5-flash";

const creatorModel = genAI.getGenerativeModel({ model: CREATOR_MODEL_NAME });
const complianceModel = genAI.getGenerativeModel({ model: COMPLIANCE_MODEL_NAME });

const MAX_ATTEMPTS = 3;

/**
 * Core Maker-Checker loop. Generates a single v2_interactive lesson:
 * Creator Agent drafts → Compliance Agent validates → retry up to MAX_ATTEMPTS.
 */
async function runMakerChecker(snap, context) {
  const data = snap.data() || {};
  const requestId = context.requestId || snap.id;
  const ownerID = data.userID || "public";

  const creatorContext = await loadCreatorContext();
  const complianceRules = await loadComplianceRules();

  let lastComplianceReason = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
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
    const { status, reasoning } = parseComplianceResponse(complianceText);
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
      });

      await db.collection("lesson_requests").doc(requestId).update({
        status: "completed",
        lessonId,
        attempts: attempt,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return;
    }

    await logAgentAttempt({
      requestId,
      status: "FAIL",
      attempt,
      lessonDraft,
      reasoning,
    });

    if (attempt === MAX_ATTEMPTS) {
      await logFinalFailure({
        requestId,
        totalAttempts: attempt,
        lastComplianceReason: reasoning,
      });

      await db.collection("lesson_requests").doc(requestId).update({
        status: "failed_compliance",
        lessonId: null,
        attempts: attempt,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
}

/**
 * Commit a PASS batch: user_lessons + screens (v2_interactive shape).
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
  } = params;

  const batch = db.batch();

  const lessonRef = db.collection("user_lessons").doc();
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
    lessonFormat: "v2_interactive",
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
    batch.set(screenRef, {
      userID: ownerID,
      lessonId: lessonRef.id,
      lessonType: "user",
      lessonFormat: "v2_interactive",
      lessonName,
      requestID: requestId,
      learningStyle: requestData.learningStyle || null,
      screenNumber: index + 1,
      questionText: screen.questionText || "",
      emoji: screen.emoji || "",
      options: Array.isArray(screen.options) ? screen.options : [],
      correctIndex:
        typeof screen.correctIndex === "number" ? screen.correctIndex : 0,
      feedbackCorrect: screen.feedbackCorrect || "",
      feedbackIncorrect: screen.feedbackIncorrect || "",
      learnMore: screen.learnMore || null,
    });
  });

  await batch.commit();
  return lessonRef.id;
}

async function logAgentAttempt(params) {
  const { requestId, status, attempt, lessonDraft, reasoning } = params;

  await db.collection("agent_logs").add({
    requestId,
    lessonFormat: "v2_interactive",
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

async function logFinalFailure(params) {
  const { requestId, totalAttempts, lastComplianceReason } = params;

  await db.collection("agent_logs").add({
    requestId,
    lessonFormat: "v2_interactive",
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
      await runMakerChecker(snap, { requestId });
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
