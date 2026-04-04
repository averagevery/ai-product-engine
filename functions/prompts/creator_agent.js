const fs = require("fs").promises;
const path = require("path");

let cachedContext = null;

/**
 * Load contextual markdown for the Creator Agent.
 * Always loads lesson_guidelines.md (v2_interactive format).
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

  cachedContext = { financialStandards, lessonGuidelines };
  return cachedContext;
}

/**
 * Build the Creator Agent prompt from the lesson request and context.
 */
function buildCreatorPrompt(lessonRequest, context) {
  const { request, requestId, attempt, lastComplianceReason } = lessonRequest;
  const { financialStandards, lessonGuidelines } = context;

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
Lesson Format: v2_interactive

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

  const schemaHint = buildSchemaHint();

  const userSection = `
LESSON REQUEST CONTEXT:
- requestId: ${requestId}
- lessonFormat: v2_interactive
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
 * @returns {string} Schema hint for v2_interactive (5-question drill-down).
 */
function buildSchemaHint() {
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
          // Exactly 2 cards; each card MUST use a different type. Include "caption" on every card.
          // comparison type: { "type": "comparison", "caption": string, "leftLabel": string, "leftItems": [string, string, string], "rightLabel": string, "rightItems": [string, string, string] }
          // highlight type:  { "type": "highlight",  "caption": string, "heroNumber": string, "subtitle": string, "detail": string }
          // timeline type:   { "type": "timeline",   "caption": string, "steps": [{ "step": 1, "description": string }, { "step": 2, "description": string }, { "step": 3, "description": string }] }
        ],
        "takeaways": [string, string, string],
        "applyToMyMoney": null,
        "actionLink": { "label": string, "description": string, "url": string } | null
      }
    }
  ]
}

SCREENS:
- Produce exactly 5 question screens, following the structure from lesson_guidelines.md.
- Each screen MUST include questionText, emoji, options (4), correctIndex, feedbackCorrect, feedbackIncorrect, and a full learnMore object.
- storyCarousel must have exactly 5 slides; breakdownCards must have exactly 2 cards using different types.
- Every breakdownCard MUST have a "caption" field (one explanatory sentence) PLUS its type-specific fields.
- takeaways must have exactly 3 actionable strings with specific numbers.
- Set applyToMyMoney to null (Day 1 MVP -- omit this section entirely).
- actionLink is optional -- set to null if no approved external tool applies. When included, use "description" (not "source").
- Approved actionLink sources only: MoneyHelper, Gov.uk, ClearScore, Credit Karma, HMRC, Turn2us, NHS.
- Respect all hard word/character limits from lesson_guidelines.md.
- Ensure the content is strictly educational and does NOT give personalised financial advice.`;
}

/**
 * Parse and normalise the Creator Agent JSON into { lessonMetadata, screens }.
 * Validates exactly 5 question screens.
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

  if (screens.length !== 5) {
    throw new Error(
      `v2_interactive requires exactly 5 question screens, got ${screens.length}.`,
    );
  }

  return { lessonMetadata, screens };
}

module.exports = {
  loadCreatorContext,
  buildCreatorPrompt,
  parseCreatorResponse,
};
