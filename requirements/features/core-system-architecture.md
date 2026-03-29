---
> **AI Source Prompt:** Document the full hybrid architecture (FlutterFlow + Firebase + Cursor GitOps), the core_lessons/user_lessons database split, the Maker-Checker pipeline, and the curriculum sync flow.
---

# Feature: Core System Architecture

## Product Layer

**ALL** -- this feature underpins the entire See / Learn / Act infrastructure. It is not user-facing; it defines the backend pipeline and data architecture that powers every lesson in the platform.

## The Hybrid Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Cursor Monorepo (GitOps)                       │
│                                                                      │
│  requirements/content/programmes/**/*.md   Hand-crafted core lessons │
│  functions/docs/*.md                       Agent behavioural rules   │
│  functions/prompts/*.js                    Gemini prompt definitions  │
│  functions/src/*.js                        Cloud Function logic       │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
  npm run sync-curriculum   firebase deploy --only functions
        │                     │
        ▼                     ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        Firebase Backend                               │
│                                                                       │
│  Firestore Collections:                                               │
│    core_lessons  ◄── synced from Cursor markdown (read-only in app)   │
│    user_lessons  ◄── written by Maker-Checker AI (read/write in app)  │
│    screens       ◄── flat collection, linked by lessonId              │
│    lesson_requests, agent_logs, lesson_history, image_library         │
│                                                                       │
│  Cloud Functions:                                                     │
│    makerCheckerProductEngine (onDocumentCreated)                       │
└──────────────────┬────────────────────────────────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      FlutterFlow App (Frontend)                       │
│                                                                       │
│  Reads from both core_lessons and user_lessons via Firestore queries  │
│  Displays screens filtered by lessonId                                │
│  Read-only for core content, read/write for user-generated content    │
└───────────────────────────────────────────────────────────────────────┘
```

### Two Lesson Paths

| Path | Collection | Source | Mutability in App |
|------|-----------|--------|-------------------|
| Hand-crafted curriculum | `core_lessons` | Written in Cursor as markdown, pushed via `npm run sync-curriculum` | Read-only |
| AI-generated lessons | `user_lessons` | Created by the Maker-Checker pipeline on user request | Read/write |

Both paths write screens to the single flat `screens` collection, distinguished by a `lessonType` field (`"core"` or `"user"`).

---

## The Maker-Checker Pipeline (AI-Generated Lessons)

```
API Request (lesson_requests/{requestId})
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
   │  ┌──────────────────────────────────────┐
   │  │ Firestore Batch Write                 │
   │  │  → user_lessons/{id}                  │
   │  │  → screens/{id} (lessonType: "user")  │
   │  │  → lesson_requests/{id} update        │
   │  └──────────────────────────────────────┘
   │
   ▼
┌────────────────────────────────┐
│ Retry Loop (MAX_ATTEMPTS = 3)  │
│ Creator receives FAIL          │
│ reasoning and redrafts         │
└────────────────────────────────┘
```

### Loop Rules

1. Triggered by a Firestore `onDocumentCreated` event on `lesson_requests/{requestId}`
2. The Creator Agent (Maker) drafts a lesson as structured JSON
3. The Compliance Agent (Checker) validates against FCA Consumer Duty rules
4. If `"status": "FAIL"`, the reasoning is stored as `lastComplianceReason` and fed back to the Creator Agent
5. If `"status": "PASS"`, the draft proceeds to `commitPassBatch()` for atomic Firestore writes
6. Hard ceiling of `MAX_ATTEMPTS = 3` prevents infinite loops
7. **Every** lesson document includes a `compliance_audit` field recording the final PASS reasoning, attempt number, and timestamp
8. All failed attempts are logged to `agent_logs`

### Failure Paths

| Scenario | Status Written to `lesson_requests` | Logged to `agent_logs` |
|----------|--------------------------------------|------------------------|
| Compliance FAIL (attempt < 3) | No update yet (loop continues) | Yes: `status: "FAIL"`, full `lessonDraft`, `reasoning` |
| Compliance FAIL (attempt = 3) | `status: "failed_compliance"`, `attempts`, `lastComplianceReason` | Yes: `status: "failed_compliance"`, `totalAttempts`, `lastComplianceReason` |
| Unrecoverable JS error | `status: "error"`, `error_message` | Yes: `status: "error"`, `errorMessage` |
| Compliance PASS | `status: "completed"`, `lessonId`, `attempts`, `compliance_summary` | No (success writes to `user_lessons` + `screens` directly) |

---

## The Curriculum Sync Flow (Hand-Crafted Lessons)

```
requirements/content/programmes/
  lisa-savings/
    programme.md                    ◄── Programme metadata (YAML frontmatter)
    lisa-penalty-rules.md           ◄── Lesson file (frontmatter + ## screen headings)
    lisa-bonus-explained.md
  debt-foundations/
    programme.md
    understanding-credit-scores.md
        │
        │  npm run sync-curriculum
        ▼
  Firestore:
    core_lessons/{lesson-slug}      ◄── Lesson metadata + syncedAt + syncedFrom
    screens/{auto-id}               ◄── One per ## heading, lessonType: "core"
```

The sync script (`scripts/sync_curriculum.js`) parses YAML frontmatter for lesson metadata and `## Screen N:` markdown headings for individual screen content, then performs a Firestore batch write per lesson.

---

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

---

## Database Schema (Firestore)

### Collection: `core_lessons`

Hand-crafted lessons synced from the Cursor monorepo. Read-only in the app.

| Field | Type | Description |
|-------|------|-------------|
| `programmeId` | string | Parent programme folder name (e.g., `"lisa-savings"`) |
| `category` | string | Financial education category |
| `lessonName` | string | Display name |
| `lessonLevel` | string | Beginner / Intermediate / Expert |
| `lessonTime` | string | Estimated completion time |
| `persona` | string | Target persona name |
| `screenCount` | number | Total number of screens in this lesson |
| `syncedAt` | Timestamp | When this lesson was last synced |
| `syncedFrom` | string | Relative file path in the monorepo |

### Collection: `user_lessons`

AI-generated lessons created by the Maker-Checker pipeline. Read/write in the app.

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

Individual screens belonging to a lesson. Stored as a **flat top-level collection** with auto-generated doc IDs, linked to the parent via `lessonId`. Contains screens for both core and user lessons, distinguished by `lessonType`.

| Field | Type | Description |
|-------|------|-------------|
| `lessonId` | string | ID of the parent `core_lessons` or `user_lessons` document |
| `lessonType` | string | `"core"` (synced from markdown) or `"user"` (AI-generated) |
| `userID` | string | Owner ID (for user lessons; `null` for core lessons) |
| `lessonName` | string | Display name (mirrors parent lesson) |
| `requestID` | string | Generation request ID (user lessons only; `null` for core) |
| `learningStyle` | string | Mirrors parent lesson (user lessons only; `null` for core) |
| `screenNumber` | number | Display order within the lesson (1-indexed) |
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

The trigger collection that initiates the Maker-Checker pipeline.

| Field | Type | Description |
|-------|------|-------------|
| *(user-submitted fields)* | various | `category`, `moduleName`, `lessonName`, `lessonLevel`, `lessonTime`, `learningStyle`, `userLessonRequest`, `userID` |
| `status` | string | Set by pipeline: `"completed"`, `"failed_compliance"`, or `"error"` |
| `lessonId` | string | Set on PASS: auto-generated ID of the created `user_lessons` document |
| `attempts` | number | Total attempts used before resolution |
| `compliance_summary` | object | Set on PASS: `{ status: "PASS", reasoning: string, checkedAt: Timestamp }` |
| `lastComplianceReason` | string | Set on hard failure: final FAIL reasoning |
| `error_message` | string | Set on unrecoverable error: JS error message |
| `updatedAt` | Timestamp | `FieldValue.serverTimestamp()` |

### Collection: `lesson_history`

User interaction records for telemetry and the self-improving loop.

| Field | Type | Description |
|-------|------|-------------|
| `lessonId` | string | Reference to the lesson (core or user) |
| `lessonType` | string | `"core"` or `"user"` -- which collection the lesson belongs to |
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

Audit trail for all agent failures and Maker-Checker loop iterations.

**Per-attempt FAIL log:**

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Generation request ID |
| `status` | string | `"FAIL"` |
| `attemptNumber` | number | Which attempt produced this failure |
| `lessonDraft` | object | `{ lessonMetadata: {}, screens: [] }` -- the full draft that failed |
| `reasoning` | string | Compliance Agent's FAIL reasoning |
| `createdAt` | Timestamp | `FieldValue.serverTimestamp()` |
| `agent` | string | `"maker_checker_product_engine"` |

**Hard failure log (after 3 failed attempts):**

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Generation request ID |
| `status` | string | `"failed_compliance"` |
| `totalAttempts` | number | Always `3` (MAX_ATTEMPTS reached) |
| `lastComplianceReason` | string | Final FAIL reasoning from attempt 3 |
| `createdAt` | Timestamp | `FieldValue.serverTimestamp()` |
| `agent` | string | `"maker_checker_product_engine"` |

**Unrecoverable error log:**

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Generation request ID |
| `status` | string | `"error"` |
| `errorMessage` | string | `error.message` or stringified error |
| `createdAt` | Timestamp | `FieldValue.serverTimestamp()` |
| `agent` | string | `"maker_checker_product_engine"` |

---

## The Batch Write Sequence

### AI-generated lessons (`commitPassBatch()`)

Uses a single Firestore `batch` to atomically write:

1. **One `user_lessons` document** -- auto-generated ID via `db.collection("user_lessons").doc()`
2. **N `screens` documents** -- one per screen, each with `lessonType: "user"` and `lessonId` linking to the parent
3. **One `lesson_requests` update** -- sets `status: "completed"`, `lessonId`, `attempts`, and `compliance_summary`

If any operation fails, the entire batch rolls back.

### Core lessons (`sync_curriculum.js`)

Uses a Firestore batch per lesson file:

1. **One `core_lessons` document** -- keyed by the lesson filename (e.g., `lisa-penalty-rules`)
2. **N `screens` documents** -- one per `## Screen` heading, each with `lessonType: "core"` and `lessonId` linking to the parent

---

## Infrastructure Requirements

| Requirement | Value |
|-------------|-------|
| Cloud Provider | Google Cloud (Firebase) |
| Region | `europe-west2` (London) |
| Runtime | Node.js (Cloud Functions for Firebase) |
| Database | Firestore (Native mode) |
| Storage | Firebase Storage (for generated images) |
| AI Model | Google Gemini (via Generative AI SDK) |
| Deployment | Firebase CLI (`firebase deploy --only functions`) |
| Curriculum Sync | `npm run sync-curriculum` (root package.json script) |

## Notes

- Source code: `functions/index.js`, `functions/src/maker_checker_loop.js`
- Source documentation: `functions/docs/agent_architecture.md`
- Sync script: `scripts/sync_curriculum.js`
- The architecture supports a 9-agent pipeline. Currently implemented: Creator Agent, Compliance Agent. Remaining agents are specified but not yet coded.
- The `compliance_audit` field proves that every live AI-generated lesson passed FCA validation.
- Both AI models default to `gemini-1.5-flash` but can be overridden via environment variables.
- The `GEMINI_API_KEY` is stored as a Firebase Secret.
