const fs = require("fs").promises;
const path = require("path");

let cachedContext = null;

/**
 * Load contextual markdown for the Creator Agent.
 * Includes financial education standards and lesson guidelines.
 *
 * @returns {Promise<{financialStandards: string, lessonGuidelines: string}>}
 */
async function loadCreatorContext() {
  if (cachedContext) {
    return cachedContext;
  }

  const docsDir = path.resolve(__dirname, "..", "docs");

  const [financialStandards, lessonGuidelines] = await Promise.all([
    fs.readFile(
      path.join(docsDir, "financial_standards.md"),
      "utf8",
    ),
    fs.readFile(
      path.join(docsDir, "lesson_guidelines.md"),
      "utf8",
    ),
  ]);

  cachedContext = {financialStandards, lessonGuidelines};
  return cachedContext;
}

/**
 * Build the Creator Agent prompt from the lesson request and context.
 *
 * @param {{
 *   request: any;
 *   requestId: string;
 *   attempt: number;
 *   lastComplianceReason?: string | null;
 * }} lessonRequest
 * @param {{financialStandards: string, lessonGuidelines: string}} context
 * @returns {string}
 */
function buildCreatorPrompt(lessonRequest, context) {
  const {request, requestId, attempt, lastComplianceReason} = lessonRequest;
  const {financialStandards, lessonGuidelines} = context;

  const style = request.learningStyle || "Conversational";

  const refinement =
    attempt > 1
      ? `
PREVIOUS COMPLIANCE FEEDBACK (attempt ${attempt - 1}):
${lastComplianceReason || "No detailed reasoning was provided."}

You MUST fix all issues highlighted above. Regenerate the entire lesson JSON from scratch, replacing the previous draft.`
      : "";

  const topic = request.userLessonRequest || request.lessonName || "";

  const systemHeader = `
You are the Creator Agent for 'Mulo', an autonomous UK financial education app.
Target Audience: 16–25 year olds in the UK.
Tone: Friendly, human, non-judgemental, UK English spelling, £ only.

Follow these documents exactly:
---
FINANCIAL EDUCATION STANDARDS (WHAT TO TEACH):
${financialStandards}
---
LESSON GENERATION GUIDELINES (HOW TO TEACH, MOBILE-FIRST):
${lessonGuidelines}
---

Your job is to draft ONE lesson as strict JSON matching the Firestore schema below.
Do NOT include any Markdown, commentary, or code fences.
Return ONLY a single JSON object.`;

  const schemaHint = `
REQUIRED OUTPUT SHAPE (STRICT):
{
  "lesson_metadata": {
    "goal": string,
    "goalOrder": number,
    "difficulty_level": "Beginner" | "Intermediate" | "Expert",
    "estimated_time": string
  },
  "screens": [
    {
      "screenType": "Standard" | "Question" | "Summary",
      "headline": string,
      "paragraph": string,
      "question": string,
      "optionA": string,
      "optionB": string,
      "optionC": string,
      "optionD": string,
      "questionAnswer": "A" | "B" | "C" | "D" | "",
      "feedbackCorrect": string,
      "feedbackIncorrect": string,
      "keyTakeaway1": string,
      "keyTakeaway2": string,
      "keyTakeaway3": string,
      "LottieSuggestion": string,
      "lottieURL": string
    }
  ]
}

SCREENS:
- Produce 8–11 screens total, following the required flow from lesson_guidelines.md.
- Respect all hard character limits for headline, body, questions, options, feedback, and takeaways.
- Ensure the content is strictly educational and does NOT give personalised financial advice.`;

  const userSection = `
LESSON REQUEST CONTEXT:
- requestId: ${requestId}
- category: ${request.category || "Custom"}
- moduleName: ${request.moduleName || ""}
- lessonName: ${request.lessonName || topic}
- requestedLevel: ${request.lessonLevel || ""}
- requestedTime: ${request.lessonTime || ""}
- learningStyle: ${style}

TOPIC TO TEACH (plain text description from user):
${topic}

Write the JSON lesson now.`;

  return [
    systemHeader.trim(),
    schemaHint.trim(),
    refinement.trim(),
    userSection.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Parse and normalise the Creator Agent JSON into { lessonMetadata, screens }.
 *
 * @param {string} text
 * @returns {{lessonMetadata: any, screens: any[]}}
 */
function parseCreatorResponse(text) {
  if (!text) {
    throw new Error("Empty Creator Agent response.");
  }

  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json/gi, "");
  cleaned = cleaned.replace(/```/g, "");
  cleaned = cleaned.trim();

  let raw;
  try {
    raw = JSON.parse(cleaned);
  } catch (error) {
    throw new Error(
      `Failed to parse Creator Agent JSON. Raw response: ${cleaned.slice(
        0,
        500,
      )}`,
    );
  }

  const rawLessonMeta = raw.lesson_metadata || raw.lessonMetadata || {};

  const lessonMetadata = {
    goal: rawLessonMeta.goal || null,
    goalOrder:
      rawLessonMeta.goalOrder ??
      rawLessonMeta.goal_order ??
      1,
    difficulty_level:
      rawLessonMeta.difficulty_level ||
      rawLessonMeta.difficultyLevel ||
      null,
    estimated_time:
      rawLessonMeta.estimated_time ||
      rawLessonMeta.estimatedTime ||
      null,
  };

  const screens =
    raw.screens ||
    raw.Screens ||
    [];

  if (!Array.isArray(screens) || screens.length === 0) {
    throw new Error(
      "Creator Agent JSON did not contain a non-empty 'screens' array.",
    );
  }

  return {lessonMetadata, screens};
}

module.exports = {
  loadCreatorContext,
  buildCreatorPrompt,
  parseCreatorResponse,
};

