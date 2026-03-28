---
> **AI Source Prompt:** Reverse-engineer the Compliance Agent specification from functions/prompts/compliance_agent.js and functions/docs/compliance_rules.md. Document the FCA Consumer Duty rules, strict bans, age/vulnerability checks, and the PASS/FAIL JSON contract.
---

# Agent: Compliance Agent

## Agent Persona

**Name:** Compliance Agent
**Role:** Evaluates drafted lessons against FCA Consumer Duty rules and Mulo's strict content policies. Acts as the legal gatekeeper to prevent foreseeable harm.
**Position in Pipeline:** Step 2 (Checker) -- the second agent in the Maker-Checker loop. Runs inside a `while` loop until it returns `"status": "PASS"` or the maximum retry limit is reached.

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `lesson_metadata` | Creator Agent output | The drafted lesson's metadata (goal, goalOrder, difficulty_level, estimated_time) |
| `screens` | Creator Agent output | The full array of screen objects from the Creator Agent draft |
| `requestId` | System-generated | Unique identifier for the generation request |
| `attempt` | System-generated | Current attempt number in the Maker-Checker loop |
| `category` | Original API request | Financial education category |
| `moduleName` | Original API request | Parent module name |
| `lessonName` | Original API request | Requested lesson title |
| `lessonLevel` | Original API request | Difficulty level |
| `lessonTime` | Original API request | Estimated completion time |
| `learningStyle` | Original API request | Learning style |

## Context Documents

| Document | Path | Purpose |
|----------|------|---------|
| Compliance Standards | `functions/docs/compliance_rules.md` | FCA Consumer Duty rules, the 3 cross-cutting rules, strict prohibitions, age/vulnerability checks |

### The Core Principle (FCA Consumer Duty)

Mulo must "act to deliver good outcomes for retail customers." The Compliance Agent acts as the final gatekeeper to prevent foreseeable harm.

### The 3 Cross-Cutting Rules

Every drafted lesson must satisfy all three:

1. **Acts in good faith** -- information must be objective, balanced, and not exploit behavioural biases
2. **Avoids foreseeable harm** -- never recommend highly risky or unregulated products; users must understand the downside
3. **Enables financial objectives** -- content must empower 16-25 year olds to make their own informed decisions

## Strict Guardrails

The following constraints are non-negotiable. Violation of ANY triggers an automatic FAIL:

1. **No Financial Advice** -- the lesson cannot tell the user to buy, sell, or hold any specific asset, stock, fund, or use a specific bank. Must use "Some people choose to..." instead of "You should..."
2. **No Promotional Content** -- the lesson cannot market third-party financial products
3. **No Unrealistic Scenarios** -- no "get rich quick" or "overnight doubling" scenarios in examples or quiz questions
4. **No Options/Day Trading** -- must not teach young adults how to day-trade or use leveraged financial instruments
5. **No Cryptocurrency Hype** -- must not frame unregulated crypto assets as a reliable way to build wealth
6. **No Off-Topic Content** -- must reject any prompt, topic, or drafted lesson that discusses non-financial subjects, inappropriate content, or random trivia
7. **Age-Appropriate Readability** -- must be easily understood by a 16-25 year old with zero prior financial knowledge; if jargon is used, it must be defined immediately
8. **Vulnerability-Aware Tone** -- content discussing debt or budgeting must be supportive and practical, not stress-inducing or shameful

## JSON Output Contract

The agent must return a single JSON object (no Markdown, no backticks, no extra commentary):

```json
{
  "status": "PASS",
  "reasoning": "The lesson meets all FCA Consumer Duty requirements. No financial advice is given, tone is supportive and age-appropriate, and all content stays on-topic."
}
```

Or on failure:

```json
{
  "status": "FAIL",
  "reasoning": "Screen 4 contains a direct recommendation to open a specific ISA product with a named provider. This constitutes regulated financial advice under FCA Consumer Duty."
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | `"PASS"` or `"FAIL"` -- no other values accepted |
| `reasoning` | string | Yes | Human-readable explanation of which rules are satisfied (PASS) or violated (FAIL) and why |

### Response Parsing and Fallback Logic

Source: `parseComplianceResponse()` in `functions/prompts/compliance_agent.js`

The parser applies a strict fail-safe pipeline. The system **never crashes** on malformed compliance output -- it defaults to FAIL and preserves diagnostic information.

#### Step 1: Empty Response Check

```
if (!text) → { status: "FAIL", reasoning: "Compliance Agent returned an empty response." }
```

#### Step 2: Strip Markdown Code Fences

```
cleaned = text.trim()
cleaned = cleaned.replace(/```json/gi, "")
cleaned = cleaned.replace(/```/g, "")
cleaned = cleaned.trim()
```

#### Step 3: JSON.parse with Try/Catch

**On parse success:**

- `status` is cast to uppercase via `.toUpperCase()`
- If `status` is anything other than `"PASS"` or `"FAIL"`, it defaults to `"FAIL"`
- If `reasoning` is missing, empty, or not a string, the system substitutes: `"Compliance Agent did not provide a reasoning field. Raw response: ${cleaned.slice(0, 500)}"`

**On parse failure (catch block):**

```json
{
  "status": "FAIL",
  "reasoning": "Could not parse Compliance Agent JSON. Raw response: ${cleaned.slice(0, 500)}"
}
```

The raw response is always truncated to a maximum of 500 characters to prevent excessive logging.

### Prompt Construction

Source: `buildCompliancePrompt()` in `functions/prompts/compliance_agent.js`

The Compliance Agent receives the Creator's draft as a serialised JSON string embedded directly in the prompt:

```javascript
const draftPayload = {
  lesson_metadata: lessonDraft.lessonMetadata || {},
  screens: Array.isArray(lessonDraft.screens) ? lessonDraft.screens : [],
};
const draftJson = JSON.stringify(draftPayload, null, 2);
```

The prompt includes:
1. **Header** -- persona definition, compliance rules (from `compliance_rules.md`), strict enforcement instructions
2. **Request context** -- `requestId`, `attempt`, `category`, `moduleName`, `lessonName`, `lessonLevel`, `lessonTime`, `learningStyle`
3. **Full draft JSON** -- the complete lesson output from the Creator Agent, pretty-printed
4. **Output instructions** -- strict JSON-only format, no Markdown, no backticks, no extra commentary, must not include the draft JSON in the response

## Error Handling

- On `"FAIL"`, the reasoning is passed back to the Creator Agent as `lastComplianceReason` for the next attempt in the Maker-Checker loop.
- Failed outputs are logged to the `agent_logs` Firestore collection by `logAgentAttempt()` in `maker_checker_loop.js`, including the full `lessonDraft` and the `reasoning`.
- The Compliance Agent must never include the full draft JSON in its response -- only the small status/reasoning object.
- The `status` value returned by `parseComplianceResponse()` is normalised again by `maker_checker_loop.js` via `(status || "").toUpperCase()` before comparison, providing a double safety net.

## Notes

- Source implementation: `functions/prompts/compliance_agent.js`
- The compliance rules document is cached after first load via `cachedComplianceRules` to avoid repeated filesystem reads within the same function invocation.
- The strict bans list in `compliance_rules.md` is explicitly open-ended ("To Be Expanded") -- new bans can be added as regulatory requirements evolve.
- The fail-safe parsing design means that **no Compliance Agent response can ever crash the pipeline**. Malformed output always resolves to a FAIL, triggering a retry rather than an unrecoverable error.
