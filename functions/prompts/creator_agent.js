const fs = require("fs").promises;
const path = require("path");

const cachedContextByFormat = {};

/**
 * Load contextual markdown for the Creator Agent.
 * Routes to the correct lesson guideline file based on lessonFormat.
 *
 * @param {"v1_swipe" | "v2_interactive"} [lessonFormat="v1_swipe"]
 * @returns {Promise<{financialStandards: string, lessonGuidelines: string}>}
 */
async function loadCreatorContext(lessonFormat = "v1_swipe") {
  if (cachedContextByFormat[lessonFormat]) {
    return cachedContextByFormat[lessonFormat];
  }

  const docsDir = path.resolve(__dirname, "..", "docs");

  const guidelinesFile =
    lessonFormat === "v2_interactive"
      ? "lesson_guidelines_v2.md"
      : "lesson_guidelines.md";

  const [financialStandards, lessonGuidelines] = await Promise.all([
    fs.readFile(
      path.join(docsDir, "financial_standards.md"),
      "utf8",
    ),
    fs.readFile(
      path.join(docsDir, guidelinesFile),
      "utf8",
    ),
  ]);

  cachedContextByFormat[lessonFormat] = {financialStandards, lessonGuidelines};
  return cachedContextByFormat[lessonFormat];
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

  const lessonFormat = request.lessonFormat || "v1_swipe";
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
Lesson Format: ${lessonFormat}

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

  const schemaHint =
    lessonFormat === "v2_interactive"
      ? buildV2SchemaHint()
      : buildV1SchemaHint();

  const userSection = `
LESSON REQUEST CONTEXT:
- requestId: ${requestId}
- lessonFormat: ${lessonFormat}
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
 * @returns {string} Schema hint for v1_swipe (8-11 screen sequential).
 */
function buildV1SchemaHint() {
  return `
REQUIRED OUTPUT SHAPE (STRICT -- v1_swipe):
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
- Produce 8-11 screens total, following the required flow from lesson_guidelines.md.
- Respect all hard character limits for headline, body, questions, options, feedback, and takeaways.
- Ensure the content is strictly educational and does NOT give personalised financial advice.`;
}

/**
 * @returns {string} Schema hint for v2_interactive (5-question drill-down).
 */
function buildV2SchemaHint() {
  return `
REQUIRED OUTPUT SHAPE (STRICT -- v2_interactive):
{
  "lesson_metadata": {
    "goal": string,
    "goalOrder": number,
    "difficulty_level": "Beginner" | "Intermediate" | "Expert",
    "estimated_time": string
  },
  "screens": [
    {
      "questionText": string,
      "emoji": string,
      "options": [string, string, string, string],
      "correctIndex": 0 | 1 | 2 | 3,
      "feedbackCorrect": string,
      "feedbackIncorrect": string,
      "learnMore": {
        "hero": { "strapline": string, "headline": string },
        "quickSummary": string,
        "storyCarousel": [
          { "emoji": string, "title": string, "text": string }
        ],
        "breakdownCards": [
          { "type": "comparison" | "highlight" | "timeline", "title": string, "content": string }
        ],
        "takeaways": [string, string, string],
        "applyToMyMoney": {
          "headline": string,
          "inputLabels": [string],
          "resultTemplate": string,
          "disclaimer": string
        },
        "actionLink": { "label": string, "url": string, "source": string }
      }
    }
  ]
}

SCREENS:
- Produce exactly 5 question screens, following the structure from lesson_guidelines_v2.md.
- Each screen MUST include questionText, emoji, options (4), correctIndex, feedbackCorrect, feedbackIncorrect, and a full learnMore object.
- storyCarousel must have exactly 5 slides; breakdownCards must have exactly 2 cards.
- takeaways must have exactly 3 actionable strings with specific numbers.
- applyToMyMoney is optional (set to null if not applicable).
- actionLink is optional (set to null if no approved external tool applies).
- Respect all hard word/character limits from lesson_guidelines_v2.md.
- Ensure the content is strictly educational and does NOT give personalised financial advice.`;
}

/**
 * Parse and normalise the Creator Agent JSON into { lessonMetadata, screens }.
 * Validates screen count based on lessonFormat.
 *
 * @param {string} text
 * @param {"v1_swipe" | "v2_interactive"} [lessonFormat="v1_swipe"]
 * @returns {{lessonMetadata: any, screens: any[]}}
 */
function parseCreatorResponse(text, lessonFormat = "v1_swipe") {
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

  if (lessonFormat === "v2_interactive" && screens.length !== 5) {
    throw new Error(
      `v2_interactive requires exactly 5 question screens, got ${screens.length}.`,
    );
  }

  if (lessonFormat === "v1_swipe" && (screens.length < 8 || screens.length > 11)) {
    throw new Error(
      `v1_swipe requires 8-11 screens, got ${screens.length}.`,
    );
  }

  return {lessonMetadata, screens};
}

module.exports = {
  loadCreatorContext,
  buildCreatorPrompt,
  parseCreatorResponse,
};

