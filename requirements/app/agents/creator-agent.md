---
> **AI Source Prompt:** Reverse-engineer the Creator Agent specification from functions/prompts/creator_agent.js, functions/docs/financial_standards.md, and functions/docs/lesson_guidelines.md. Document the PISA pillars, mobile constraints, UK tone, and exact JSON output schema.
---

# Agent: Creator Agent

## Agent Persona

**Name:** Creator Agent
**Role:** Drafts structured micro-lessons as strict JSON, following PISA-aligned financial education standards and mobile-first writing constraints.
**Position in Pipeline:** Step 1 (Maker) -- the first agent in the Maker-Checker loop.

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `category` | API request body | Financial education category (e.g., Savings, Debt, Mortgage, Pension, Investing) |
| `moduleName` | API request body | Parent module/programme name |
| `lessonName` | API request body | Requested lesson title |
| `lessonLevel` | API request body | Difficulty: Beginner, Intermediate, or Expert |
| `lessonTime` | API request body | Estimated completion time |
| `learningStyle` | API request body | One of: Conversational, Direct & Factual, Question-Based, Storytelling, Analogy-Based |
| `userLessonRequest` | API request body | Plain-text topic description from the user |
| `lastComplianceReason` | Previous Compliance Agent output (retry only) | On attempt > 1, the Compliance Agent's FAIL reasoning from the prior draft |
| `requestId` | System-generated | Unique identifier for the generation request |
| `attempt` | System-generated | Current attempt number in the Maker-Checker loop |

## Context Documents

| Document | Path | Purpose |
|----------|------|---------|
| Financial Education Standards | `functions/docs/financial_standards.md` | Defines WHAT to teach: the 4 PISA-aligned content pillars and cognitive testing processes |
| Lesson Generation Guidelines | `functions/docs/lesson_guidelines.md` | Defines HOW to teach: mobile-first screen flow, hard word limits, visual queue rules |

### The 4 Content Pillars (PISA-Aligned)

Every lesson must anchor to one of these pillars:

1. **Money and Transactions** -- everyday payments, spending, value for money, bank cards, VAT
2. **Planning and Managing Finances** -- budgeting, compounding, saving, managing debt (student loans, credit cards)
3. **Risk and Reward** -- scams, phishing, variable interest rates, inflation, risk-return trade-offs
4. **Financial Landscape** -- consumer rights and responsibilities, UK financial system, objective advice sources, basic taxation

### Cognitive Processes (Quiz Question Design)

Quiz questions must test one of these processes:

- **Identify:** recognise financial terms or situations
- **Analyse:** compare options
- **Evaluate:** make a judgement based on financial information
- **Apply:** perform a calculation or choose the best course of action

## Strict Guardrails

The following constraints are non-negotiable. This agent must NEVER:

1. Provide personalised financial advice or tell the user to buy, sell, or hold any specific asset
2. Exceed the hard mobile writing limits (see table below)
3. Use non-UK English spelling or terminology
4. Use jargon without immediately defining it
5. Include busy dashboards, detailed scenes, or bespoke illustrations in visual suggestions
6. Produce fewer than 8 or more than 11 screens per lesson
7. Deviate from the required screen flow: Hook -> Learn -> Reflect -> Question -> Summary

### Hard Mobile Writing Limits

| Element | Maximum |
|---------|---------|
| Headline | 7 words |
| Body text | 25 words (max 2 sentences) |
| Question | 12 words |
| Options A-D | 12 words each |
| Feedback (correct/incorrect) | 25 words each |
| Summary takeaways | 15 words each (exactly 3 required) |

### Required Screen Flow (8-11 screens)

1. **Hook** (1-2 screens) -- grab attention
2. **Learn** (3-5 screens) -- core educational content
3. **Reflect** (2 screens) -- consolidation
4. **Question** (3-4 questions per lesson) -- interactive assessment
5. **Summary** (1 screen) -- exactly 3 key takeaways

### Learning Styles

Each lesson must specify one style:

- **Conversational** -- chatty, relatable, human
- **Direct & Factual** -- clear, concise, practical
- **Question-Based** -- fully interactive
- **Storytelling** -- realistic scenarios, narrative arc
- **Analogy-Based** -- everyday comparisons

## JSON Output Contract

The agent must return a single JSON object (no Markdown, no code fences, no commentary) matching this exact schema:

```json
{
  "lesson_metadata": {
    "goal": "string",
    "goalOrder": "number",
    "difficulty_level": "Beginner | Intermediate | Expert",
    "estimated_time": "string"
  },
  "screens": [
    {
      "screenType": "Standard | Question | Summary",
      "headline": "string (max 7 words)",
      "paragraph": "string (max 25 words)",
      "question": "string (max 12 words)",
      "optionA": "string (max 12 words)",
      "optionB": "string (max 12 words)",
      "optionC": "string (max 12 words)",
      "optionD": "string (max 12 words)",
      "questionAnswer": "A | B | C | D | empty string",
      "feedbackCorrect": "string (max 25 words)",
      "feedbackIncorrect": "string (max 25 words)",
      "keyTakeaway1": "string (max 15 words, Summary screen only)",
      "keyTakeaway2": "string (max 15 words, Summary screen only)",
      "keyTakeaway3": "string (max 15 words, Summary screen only)",
      "LottieSuggestion": "string (visual motif description)",
      "lottieURL": "string (empty, populated by Design Agent)"
    }
  ]
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lesson_metadata.goal` | string | Yes | Educational objective of this lesson |
| `lesson_metadata.goalOrder` | number | Yes | Sequence within the parent module (default: 1) |
| `lesson_metadata.difficulty_level` | string | Yes | `"Beginner"`, `"Intermediate"`, or `"Expert"` |
| `lesson_metadata.estimated_time` | string | Yes | Estimated completion time (e.g., `"60s"`) |
| `screens[].screenType` | string | Yes | `"Standard"`, `"Question"`, or `"Summary"` |
| `screens[].headline` | string | Yes | Max 7 words, one clear idea |
| `screens[].paragraph` | string | Yes | Max 25 words, conversational |
| `screens[].question` | string | Conditional | Required for Question screens, max 12 words |
| `screens[].optionA-D` | string | Conditional | Required for Question screens, max 12 words each, must be distinct |
| `screens[].questionAnswer` | string | Conditional | `"A"`, `"B"`, `"C"`, `"D"`, or empty string |
| `screens[].feedbackCorrect` | string | Conditional | Required for Question screens, max 25 words |
| `screens[].feedbackIncorrect` | string | Conditional | Required for Question screens, max 25 words |
| `screens[].keyTakeaway1-3` | string | Conditional | Required for Summary screen, max 15 words each |
| `screens[].LottieSuggestion` | string | Yes | Visual motif matching approved Lottie list |
| `screens[].lottieURL` | string | No | Empty at creation; populated by Design Agent |

## Response Parsing and Sanitisation

Source: `parseCreatorResponse()` in `functions/prompts/creator_agent.js`

The system applies the following sanitisation pipeline to the raw Gemini response before attempting to parse it as JSON:

### Step 1: Strip Markdown Code Fences

```
cleaned = text.trim()
cleaned = cleaned.replace(/```json/gi, "")
cleaned = cleaned.replace(/```/g, "")
cleaned = cleaned.trim()
```

### Step 2: JSON.parse

If parsing fails, the system throws an error with the raw response truncated to 500 characters:

> `"Failed to parse Creator Agent JSON. Raw response: ${cleaned.slice(0, 500)}"`

### Step 3: Field Normalisation (Flexible Key Acceptance)

The parser tolerates both snake_case and camelCase keys from the AI model:

| Expected Field | Also Accepts |
|----------------|-------------|
| `raw.lesson_metadata` | `raw.lessonMetadata` |
| `rawLessonMeta.goalOrder` | `rawLessonMeta.goal_order` |
| `rawLessonMeta.difficulty_level` | `rawLessonMeta.difficultyLevel` |
| `rawLessonMeta.estimated_time` | `rawLessonMeta.estimatedTime` |
| `raw.screens` | `raw.Screens` |

### Step 4: Validation

- `goalOrder` defaults to `1` if not provided (using nullish coalescing `??`)
- If the `screens` array is empty or missing, the parser throws:

> `"Creator Agent JSON did not contain a non-empty 'screens' array."`

### Output Shape

The parser returns a normalised object:

```json
{
  "lessonMetadata": {
    "goal": "string | null",
    "goalOrder": "number (default: 1)",
    "difficulty_level": "string | null",
    "estimated_time": "string | null"
  },
  "screens": [ ... ]
}
```

## Retry Handling (Compliance Feedback Injection)

Source: `buildCreatorPrompt()` in `functions/prompts/creator_agent.js`

On retry attempts (attempt > 1), the following block is injected into the prompt between the schema hint and the user section:

```
PREVIOUS COMPLIANCE FEEDBACK (attempt {N}):
{lastComplianceReason}

You MUST fix all issues highlighted above. Regenerate the entire lesson JSON
from scratch, replacing the previous draft.
```

If `lastComplianceReason` is null or undefined, the fallback text is: "No detailed reasoning was provided."

The default learning style (when none is specified in the request) is `"Conversational"`.

## Error Handling

- If the response is empty, the parser throws: `"Empty Creator Agent response."`
- If the response cannot be parsed as valid JSON after sanitisation, the system throws with the raw response truncated to 500 characters.
- If the screens array is empty, the system throws.
- On any throw, the Maker-Checker loop in `maker_checker_loop.js` catches the error and the `for` loop continues to the next attempt (up to `MAX_ATTEMPTS = 3`).
- All failed outputs are logged to the `agent_logs` Firestore collection with a timestamp and the full draft payload.

## Notes

- Source implementation: `functions/prompts/creator_agent.js`
- The Creator Agent uses a caching mechanism (`cachedContext`) to avoid re-reading `financial_standards.md` and `lesson_guidelines.md` on subsequent calls within the same function invocation.
- Both context documents are loaded in parallel via `Promise.all()` on first invocation.
- UK-centric contexts only: first jobs, university, renting, starting to invest, avoiding modern digital scams. Use strictly UK terminology (ISA, PAYE, HMRC).
- Target audience: 16-25 year olds in the UK.
- Tone: Friendly, human, non-judgemental, UK English spelling only.
