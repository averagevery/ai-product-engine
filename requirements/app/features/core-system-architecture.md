---
> **AI Source Prompt:** Reverse-engineer the core system architecture feature specification from functions/docs/agent_architecture.md. Document the GitOps infrastructure, the Maker-Checker loop mandate, and the exact Firestore database schema for lessons, screens, lesson_history, and image_library collections.
---

# Feature: Core System Architecture

## Product Layer

**ALL** -- this feature underpins the entire See / Learn / Act infrastructure. It is not user-facing; it defines the backend pipeline that powers every lesson in the platform.

## UX Flow

This is not a user-facing feature. The UX flow describes the backend pipeline:

```
API Request
    │
    ▼
┌──────────────┐
│ Creator Agent │ ◄── Step 1 (Maker): Drafts lesson JSON
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Compliance Agent  │ ◄── Step 2 (Checker): FCA validation
└──────┬───────────┘
       │
   ┌───┴───┐
   │ PASS? │
   └───┬───┘
   No  │  Yes
   │   │
   │   ▼
   │  ┌──────────────┐
   │  │ Design Agent  │ ◄── Step 3: Generate/reuse visuals
   │  └──────┬───────┘
   │         │
   │         ▼
   │  ┌──────────────────┐
   │  │ Firestore Write   │ ◄── Batch write: lessons + screens
   │  └──────────────────┘
   │
   ▼
┌────────────────────────────┐
│ Retry Loop (max attempts)  │
│ Creator receives FAIL      │
│ reasoning and redrafts     │
└────────────────────────────┘
```

### The Maker-Checker Loop Mandate

Source: `functions/src/maker_checker_loop.js`

1. The loop is triggered by a Firestore `onDocumentCreated` event on the `lesson_requests/{requestId}` collection
2. The Creator Agent (Maker) drafts a lesson as structured JSON
3. The Compliance Agent (Checker) validates against FCA Consumer Duty rules
4. If `"status": "FAIL"`, the reasoning is stored as `lastComplianceReason` and fed back to the Creator Agent for the next iteration
5. If `"status": "PASS"`, the draft proceeds to `commitPassBatch()` for atomic Firestore writes
6. The loop uses a `for` loop with a hard ceiling of `MAX_ATTEMPTS = 3`
7. **Every** lesson document MUST include a `compliance_audit` field recording the final PASS reasoning, attempt number, and timestamp
8. All failed attempts are logged to `agent_logs` with full draft payload and reasoning

### Failure Paths (from `maker_checker_loop.js`)

| Scenario | Status Written to `lesson_requests` | Logged to `agent_logs` |
|----------|--------------------------------------|------------------------|
| Compliance returns FAIL (attempt < 3) | No update yet (loop continues) | Yes: `status: "FAIL"`, full `lessonDraft`, `reasoning` |
| Compliance returns FAIL (attempt = 3) | `status: "failed_compliance"`, `attempts`, `lastComplianceReason` | Yes: `status: "failed_compliance"`, `totalAttempts`, `lastComplianceReason` |
| Unrecoverable JS error (any attempt) | `status: "error"`, `error_message` | Yes: `status: "error"`, `errorMessage` |
| Compliance returns PASS | `status: "completed"`, `lessonId`, `attempts`, `compliance_summary` | No (success path writes to `lessons` + `screens` directly) |

## Cloud Function Configuration

Source: `functions/index.js` and `functions/src/maker_checker_loop.js`

| Setting | Value | Source |
|---------|-------|--------|
| Global max instances | `10` | `setGlobalOptions({ maxInstances: 10 })` in `index.js` |
| Trigger | `onDocumentCreated("lesson_requests/{requestId}")` | `maker_checker_loop.js` exports |
| Region | `europe-west2` | Function options |
| Timeout | `120` seconds | Function options |
| Memory | `512MiB` | Function options |
| Creator model | `gemini-1.5-flash` (env override: `CREATOR_MODEL_NAME`) | `maker_checker_loop.js` |
| Compliance model | `gemini-1.5-flash` (env override: `COMPLIANCE_MODEL_NAME`) | `maker_checker_loop.js` |
| API key | `process.env.GEMINI_API_KEY` (Firebase Secret) | `maker_checker_loop.js` |

## UI Layout Constraints

Not applicable -- this is a backend-only feature. UI constraints are enforced at the agent level (see Creator Agent spec).

## Database Schema (Firestore)

### Collection: `lessons`

The master record for each generated lesson. Written by `commitPassBatch()` in `maker_checker_loop.js`.

| Field | Type | Description |
|-------|------|-------------|
| `userID` | string | Owner ID (from request `userID` field, defaults to `"public"`) |
| `category` | string | Financial education category (defaults to `"Custom"`) |
| `moduleName` | string | Parent module/programme name |
| `lessonName` | string | Display name (falls back to `userLessonRequest`) |
| `lessonLevel` | string | From `lessonMetadata.difficulty_level` or original request |
| `lessonTime` | string | From `lessonMetadata.estimated_time` or original request |
| `learningStyle` | string | One of: Conversational, Direct & Factual, Question-Based, Storytelling, Analogy-Based |
| `requestID` | string | Unique generation request ID |
| `goal` | string | From `lessonMetadata.goal` |
| `goalOrder` | number | From `lessonMetadata.goalOrder` (defaults to `1`) |
| `compliance_audit` | object | `{ status: "PASS", reasoning: string, attemptNumber: number, checkedAt: Timestamp }` |
| `human_approved` | boolean | Always `false` on creation -- requires manual review |
| `version` | number | Always `1` on creation |
| `created_at` | Timestamp | `FieldValue.serverTimestamp()` |

### Collection: `screens`

Individual screens belonging to a lesson. Stored as a **flat top-level collection** keyed by auto-generated doc IDs, linked to the parent via `lessonId`. Written by `commitPassBatch()`.

| Field | Type | Description |
|-------|------|-------------|
| `userID` | string | Owner ID (mirrors parent lesson) |
| `lessonId` | string | Auto-generated ID of the parent `lessons` document |
| `lessonName` | string | Display name (mirrors parent lesson) |
| `requestID` | string | Generation request ID |
| `learningStyle` | string | Mirrors parent lesson |
| `screenNumber` | number | Display order within the lesson (1-indexed, from `index + 1`) |
| `screenType` | string | `"Standard"`, `"Question"`, or `"Summary"` |
| `headline` | string | Max 7 words (defaults to `""`) |
| `paragraph` | string | Max 25 words (defaults to `""`) |
| `question` | string | Max 12 words (defaults to `""`) |
| `optionA` | string | Max 12 words (defaults to `""`) |
| `optionB` | string | Max 12 words (defaults to `""`) |
| `optionC` | string | Max 12 words (defaults to `""`) |
| `optionD` | string | Max 12 words (defaults to `""`) |
| `questionAnswer` | string | `"A"`, `"B"`, `"C"`, `"D"`, or `""` |
| `feedbackCorrect` | string | Max 25 words (defaults to `""`) |
| `feedbackIncorrect` | string | Max 25 words (defaults to `""`) |
| `keyTakeaway1` | string | Max 15 words (defaults to `""`) |
| `keyTakeaway2` | string | Max 15 words (defaults to `""`) |
| `keyTakeaway3` | string | Max 15 words (defaults to `""`) |
| `LottieSuggestion` | string | Visual motif description (defaults to `""`) |
| `lottieURL` | string | Firebase Storage URL (defaults to `""`, populated by Design Agent) |

### Collection: `lesson_requests`

The trigger collection that initiates the Maker-Checker pipeline. Updated by the loop on completion or failure.

| Field | Type | Description |
|-------|------|-------------|
| *(user-submitted fields)* | various | `category`, `moduleName`, `lessonName`, `lessonLevel`, `lessonTime`, `learningStyle`, `userLessonRequest`, `userID` |
| `status` | string | Set by pipeline: `"completed"`, `"failed_compliance"`, or `"error"` |
| `lessonId` | string | Set on PASS: auto-generated ID of the created `lessons` document |
| `attempts` | number | Total attempts used before resolution |
| `compliance_summary` | object | Set on PASS: `{ status: "PASS", reasoning: string, checkedAt: Timestamp }` |
| `lastComplianceReason` | string | Set on hard failure: final FAIL reasoning |
| `error_message` | string | Set on unrecoverable error: JS error message |
| `updatedAt` | Timestamp | `FieldValue.serverTimestamp()` |

### Collection: `lesson_history`

User interaction records for telemetry and the self-improving loop.

| Field | Type | Description |
|-------|------|-------------|
| `lessonId` | string | Reference to the lesson |
| `userId` | string | Anonymous or authenticated user ID |
| `completedAt` | Timestamp | When the user finished (or abandoned) the lesson |
| `screenProgress` | array | Array of screen IDs the user viewed, in order |
| `quizResults` | array | Array of `{ questionIndex, selectedAnswer, correct: boolean }` |
| `thumbsUp` | boolean | User satisfaction signal (true = positive) |
| `dropOffScreen` | number | Screen index where the user stopped (null if completed) |

### Collection: `image_library`

Reusable visual assets managed by the Design Agent.

| Field | Type | Description |
|-------|------|-------------|
| `Keywords` | string | Comma-separated topic keywords for matching |
| `LottieSuggestion` | string | Description of the visual motif |
| `lottieURL` | string | Firebase Storage URL |
| `human_approved` | boolean | `true` = approved for reuse; `false` = pending review |
| `createdAt` | Timestamp | When the image was first generated |
| `usedInLessons` | array | List of lesson IDs where this image appears |

### Collection: `agent_logs`

Audit trail for all agent failures and Maker-Checker loop iterations. Written by `logAgentAttempt()`, `logFinalFailure()`, and the top-level error handler in `maker_checker_loop.js`.

**Per-attempt FAIL log** (from `logAgentAttempt()`):

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Generation request ID |
| `status` | string | `"FAIL"` |
| `attemptNumber` | number | Which attempt produced this failure |
| `lessonDraft` | object | `{ lessonMetadata: {}, screens: [] }` -- the full draft that failed |
| `reasoning` | string | Compliance Agent's FAIL reasoning |
| `createdAt` | Timestamp | `FieldValue.serverTimestamp()` |
| `agent` | string | `"maker_checker_product_engine"` |

**Hard failure log** (from `logFinalFailure()`, after 3 failed attempts):

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Generation request ID |
| `status` | string | `"failed_compliance"` |
| `totalAttempts` | number | Always `3` (MAX_ATTEMPTS reached) |
| `lastComplianceReason` | string | Final FAIL reasoning from attempt 3 |
| `createdAt` | Timestamp | `FieldValue.serverTimestamp()` |
| `agent` | string | `"maker_checker_product_engine"` |

**Unrecoverable error log** (from top-level try/catch):

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Generation request ID |
| `status` | string | `"error"` |
| `errorMessage` | string | `error.message` or stringified error |
| `createdAt` | Timestamp | `FieldValue.serverTimestamp()` |
| `agent` | string | `"maker_checker_product_engine"` |

## Infrastructure Requirements

| Requirement | Value |
|-------------|-------|
| Cloud Provider | Google Cloud (Firebase) |
| Region | `europe-west2` (London) |
| Runtime | Node.js (Cloud Functions for Firebase) |
| Database | Firestore (Native mode) |
| Storage | Firebase Storage (for generated images) |
| AI Model | Google Gemini (via Vertex AI or Generative AI SDK) |
| Deployment | Firebase CLI (`firebase deploy --only functions`) |

### The Batch Write Sequence (from `commitPassBatch()`)

The `commitPassBatch()` function in `maker_checker_loop.js` uses a single Firestore `batch` to atomically write:

1. **One `lessons` document** -- auto-generated ID via `db.collection("lessons").doc()`
2. **N `screens` documents** -- one per screen, each with an auto-generated ID, linked by `lessonId: lessonRef.id`
3. **One `lesson_requests` update** -- sets `status: "completed"`, `lessonId`, `attempts`, and `compliance_summary`

If any of the three operations fail, the entire batch rolls back. This prevents orphan screens without a parent lesson, or a `lesson_requests` document marked "completed" with no actual lesson.

The batch throws an error if the Creator Agent returned zero screens (`screens.length === 0`).

## Acceptance Criteria

- [ ] 100% of lesson documents include a `compliance_audit` field with `status: "PASS"`, a non-empty `reasoning` string, `attemptNumber`, and `checkedAt` timestamp
- [ ] All Cloud Functions deploy to `europe-west2` with no fallback to other regions
- [ ] The global `maxInstances` is set to `10` via `setGlobalOptions()` in `index.js`
- [ ] The function timeout is `120` seconds and memory is `512MiB`
- [ ] Failed drafts are logged to `agent_logs` with `requestId`, `attemptNumber`, `agent`, `status`, `reasoning`, and full `lessonDraft`
- [ ] Hard failures (3 consecutive FAILs) update `lesson_requests` to `status: "failed_compliance"` and log to `agent_logs`
- [ ] Unrecoverable JS errors update `lesson_requests` to `status: "error"` and log to `agent_logs`
- [ ] Lesson + screen + lesson_requests writes use a single Firestore Batch Write for atomicity
- [ ] The Maker-Checker loop enforces `MAX_ATTEMPTS = 3` to prevent infinite loops
- [ ] All lessons are created with `human_approved: false` and `version: 1`
- [ ] The Design Agent queries `image_library` before every image generation call
- [ ] New images are saved to `image_library` with `human_approved: false`
- [ ] All collections conform to the schema defined above

## Notes

- Source code: `functions/index.js`, `functions/src/maker_checker_loop.js`
- Source documentation: `functions/docs/agent_architecture.md`
- The architecture is designed for a 9-agent pipeline. Currently implemented: Creator Agent (`prompts/creator_agent.js`), Compliance Agent (`prompts/compliance_agent.js`). Remaining agents (Design, Telemetry, and 5 others) are specified but not yet coded.
- The Batch Write pattern is critical: if either the lesson, its screens, or the `lesson_requests` update fail, none persist. This prevents orphan records.
- The `compliance_audit` field is the single most important piece of audit infrastructure. It proves that every live lesson passed FCA validation.
- Both AI models default to `gemini-1.5-flash` but can be overridden via `CREATOR_MODEL_NAME` and `COMPLIANCE_MODEL_NAME` environment variables.
- The `GEMINI_API_KEY` is stored as a Firebase Secret and accessed via `process.env.GEMINI_API_KEY`.
