const fs = require("fs").promises;
const path = require("path");

let cachedComplianceRules = null;

/**
 * Load compliance rules (FCA Consumer Duty) for the Compliance Agent.
 *
 * @returns {Promise<string>}
 */
async function loadComplianceRules() {
  if (cachedComplianceRules) {
    return cachedComplianceRules;
  }

  const docsDir = path.resolve(__dirname, "..", "docs");
  const rules = await fs.readFile(
    path.join(docsDir, "compliance_rules.md"),
    "utf8",
  );

  cachedComplianceRules = rules;
  return cachedComplianceRules;
}

/**
 * Build the Compliance Agent prompt.
 * For v2_interactive, explicitly instructs the agent to traverse nested learnMore.
 *
 * @param {{lessonMetadata?: any, screens?: any[]}} lessonDraft
 * @param {{request: any, requestId: string, attempt: number}} requestContext
 * @param {string} complianceRules
 * @returns {string}
 */
function buildCompliancePrompt(lessonDraft, requestContext, complianceRules) {
  const {request, requestId, attempt} = requestContext;
  const lessonFormat = request.lessonFormat || "v1_swipe";

  const draftPayload = {
    lesson_metadata: lessonDraft.lessonMetadata || {},
    screens: Array.isArray(lessonDraft.screens) ? lessonDraft.screens : [],
  };

  const draftJson = JSON.stringify(draftPayload, null, 2);

  const formatSpecificRules =
    lessonFormat === "v2_interactive"
      ? `
ADDITIONAL V2 INTERACTIVE RULES:
- Each screen contains a nested "learnMore" object. You MUST traverse and validate ALL nested content.
- Validate: hero.strapline, hero.headline, quickSummary, every storyCarousel slide, every breakdownCard, all takeaways, applyToMyMoney (if present), and actionLink (if present).
- storyCarousel characters must NOT give financial advice. Their stories are illustrative only.
- breakdownCards must present educational comparisons, not product recommendations.
- actionLink URLs must point to approved non-commercial sources (Gov.uk, MoneyHelper, HMRC, etc.).
- applyToMyMoney disclaimer must state: "Based on general UK guidelines. Not personalised financial advice."
- Validate word limits: questionText <= 20 words, options <= 10 words each, feedback <= 30 words, quickSummary <= 2 sentences, takeaways <= 15 words each.`
      : "";

  const header = `
You are the Compliance Agent for 'Mulo', an autonomous UK financial education app.
You enforce FCA Consumer Duty and the strict bans defined below.
Lesson Format: ${lessonFormat}

COMPLIANCE RULES (READ CAREFULLY, DO NOT REPEAT VERBATIM IN OUTPUT):
${complianceRules}
${formatSpecificRules}

Your job is to REVIEW the following drafted lesson and decide whether it is compliant.
You MUST be extremely strict about:
- No personalised financial advice.
- No promotion of specific financial products or "get rich quick" schemes.
- Age-appropriate, clear, supportive language for 16-25 year olds.
- Staying on-topic: UK financial education only.`;

  const contextSection = `
REQUEST CONTEXT:
- requestId: ${requestId}
- lessonFormat: ${lessonFormat}
- attempt: ${attempt}
- category: ${request.category || "Custom"}
- moduleName: ${request.moduleName || ""}
- lessonName: ${request.lessonName || request.userLessonRequest || ""}
- requestedLevel: ${request.lessonLevel || ""}
- requestedTime: ${request.lessonTime || ""}
- learningStyle: ${request.learningStyle || ""}

DRAFT LESSON TO REVIEW (JSON):
${draftJson}
`;

  const instructions = `
REQUIRED OUTPUT FORMAT (STRICT JSON ONLY):
Return ONE JSON object with this shape:
{
  "status": "PASS" | "FAIL",
  "reasoning": string
}

Rules:
- If ANY part of the draft violates the compliance rules, set "status" to "FAIL".
- In "reasoning", explain clearly (for humans) which rules are violated and why.
- Do NOT include Markdown, backticks, or any extra commentary.
- Do NOT include the draft JSON in your response. Only return the small JSON object.`;

  return [
    header.trim(),
    contextSection.trim(),
    instructions.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Parse and normalise the Compliance Agent response.
 * Defaults to FAIL on malformed output while preserving reasoning where possible.
 *
 * @param {string} text
 * @returns {{status: "PASS" | "FAIL", reasoning: string}}
 */
function parseComplianceResponse(text) {
  if (!text) {
    return {
      status: "FAIL",
      reasoning: "Compliance Agent returned an empty response.",
    };
  }

  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json/gi, "");
  cleaned = cleaned.replace(/```/g, "");
  cleaned = cleaned.trim();

  try {
    const obj = JSON.parse(cleaned);

    let status =
      typeof obj.status === "string"
        ? obj.status.toUpperCase()
        : "FAIL";
    if (status !== "PASS" && status !== "FAIL") {
      status = "FAIL";
    }

    const reasoning =
      typeof obj.reasoning === "string" && obj.reasoning.trim().length > 0
        ? obj.reasoning
        : `Compliance Agent did not provide a reasoning field. Raw response: ${cleaned.slice(
            0,
            500,
          )}`;

    return {status, reasoning};
  } catch (error) {
    return {
      status: "FAIL",
      reasoning: `Could not parse Compliance Agent JSON. Raw response: ${cleaned.slice(
        0,
        500,
      )}`,
    };
  }
}

module.exports = {
  loadComplianceRules,
  buildCompliancePrompt,
  parseComplianceResponse,
};

