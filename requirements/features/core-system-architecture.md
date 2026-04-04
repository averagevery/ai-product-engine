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

Each path produces one lesson document per logical lesson in the `v2_interactive` format. Screens are stored in one flat `screens` collection, distinguished by `lessonType`.

| Path | Collection | Source | Mutability in App |
|------|-----------|--------|-------------------|
| Hand-crafted curriculum | `core_lessons` | Markdown in Cursor (`{slug}.md`), synced via `npm run sync-curriculum`. Firestore doc id: `{slug}`. | Read-only |
| AI-generated lessons | `user_lessons` | Maker-Checker pipeline runs once per `lesson_requests` doc; one auto ID + one screen set | Read/write |

Both paths write screens to the single flat `screens` collection, distinguished by `lessonType` (`"core"` or `"user"`).

---

## The Maker-Checker Pipeline (AI-Generated Lessons)

Each `lesson_requests` document triggers a single Maker-Checker run in the `v2_interactive` format. The run has its own Creator + Compliance retry loop (MAX_ATTEMPTS = 3) and a `commitPassBatch()` (one `user_lessons` doc + N `screens` docs). When the run finishes, `lesson_requests` is updated with the outcome.

```
API Request (lesson_requests/{requestId})
    │
    ▼
 Maker-Checker: v2_interactive
 Creator → Compliance
 (retry up to 3)
    │
    ▼
 user_lessons/{id}
 screens/*
    │
    ▼
 lesson_requests update
 (completed | failed_compliance)
```

### Loop Rules

1. Triggered by a Firestore `onDocumentCreated` event on `lesson_requests/{requestId}`
2. The Creator Agent (Maker) drafts a lesson as structured JSON using the `v2_interactive` guideline file
3. The Compliance Agent (Checker) validates against FCA Consumer Duty rules
4. If `"status": "FAIL"`, the reasoning is fed back to the Creator Agent
5. If `"status": "PASS"`, the draft proceeds to `commitPassBatch()`
6. Hard ceiling of `MAX_ATTEMPTS = 3` prevents infinite loops
7. **Every** written `user_lessons` document includes a `compliance_audit` field recording the final PASS reasoning, attempt number, and timestamp
8. Failed attempts are logged to `agent_logs`

### Failure Paths

| Scenario | Status Written to `lesson_requests` | Logged to `agent_logs` |
|----------|--------------------------------------|------------------------|
| Compliance FAIL (attempt < 3) | No update yet (loop continues) | Yes: `status: "FAIL"`, full `lessonDraft`, `reasoning` |
| Compliance FAIL (attempt = 3) | `status: "failed_compliance"` | Yes: `status: "failed_compliance"`, `totalAttempts`, `lastComplianceReason` |
| Compliance PASS | `status: "completed"`, `lessonId` set | No FAIL logs for that request |
| Unrecoverable JS error | `status: "error"`, `error_message` | Yes: `status: "error"`, `errorMessage` |

---

## The Curriculum Sync Flow (Hand-Crafted Lessons)

```
requirements/content/programmes/
  lisa-savings/
    programme.md                    ◄── Programme metadata (YAML frontmatter)
    lisa-penalty-rules.md           ◄── Lesson (frontmatter + ## Question headings)
    lisa-bonus-explained.md
  debt-foundations/
    programme.md
    understanding-credit-scores.md
        │
        │  npm run sync-curriculum
        ▼
  Firestore:
    programmes/{programme-folder}        ◄── Programme metadata (from programme.md YAML)
    core_lessons/{lesson-slug}           ◄── Metadata (lessonFormat: v2_interactive, lessonOrder from programme.md)
    screens/{auto-id}                    ◄── Linked by lessonId; lessonType: "core"
```

The sync script (`scripts/sync_curriculum.js`) processes each programme folder in two phases: first it parses `programme.md` YAML frontmatter (programme metadata + ordered `lessons` array) and syncs the `programmes/{id}` document; then it parses each lesson file's YAML frontmatter and content. Lesson files use `## Question N:` headings plus nested `learnMore`. It **validates** each parsed lesson before writing (5 questions, `learnMore` carousel/cards/takeaways, `correctIndex`, etc.). Each lesson's `lessonOrder` is set from the `lessons` array in `programme.md`. Run `npm run validate-curriculum` for the same checks without Firestore.

**Idempotency and repo as source of truth:** For each programme and lesson file, the script stores `sourceSha256` (hash of the raw markdown on disk). If Firestore already has the same `sourceSha256` and (for lessons) the number of `screens` rows with `lessonType: "core"` matches the parsed screen count, that document is **skipped** (no delete/re-write). If the lesson was removed in the Firebase console, the next sync **recreates** it from the repo. After all programmes are processed, any `core_lessons` document whose `programmeId` matches a programme folder but whose document id is **not** present in that folder’s expected lesson set is **pruned** (document deleted and its core `screens` removed). Any `programmes` document whose id does not match a folder in `requirements/content/programmes/` is also pruned (along with its `core_lessons` and `screens`). Use `--no-prune` to disable pruning, or `--force` to always re-write regardless of hash.

---

## Cloud Function Configuration

Source: `functions/index.js` and `functions/src/maker_checker_loop.js`

| Setting | Value | Source |
|---------|-------|--------|
| Global max instances | `10` | `setGlobalOptions({ maxInstances: 10 })` in `index.js` |
| Trigger | `onDocumentCreated("lesson_requests/{requestId}")` | `maker_checker_loop.js` exports |
| Region | `europe-west2` | Function options |
| Timeout | `240` seconds | Function options |
| Memory | `1GiB` | Function options |
| Creator model | `gemini-1.5-flash` (env override: `CREATOR_MODEL_NAME`) | `maker_checker_loop.js` |
| Compliance model | `gemini-1.5-flash` (env override: `COMPLIANCE_MODEL_NAME`) | `maker_checker_loop.js` |
| API key | `process.env.GEMINI_API_KEY` (Firebase Secret) | `maker_checker_loop.js` |

---

## Database Schema (Firestore)

### Collection: `programmes`

Programme metadata synced from `programme.md` YAML frontmatter. Read-only in the app. Doc ID = programme folder name (e.g. `buying-your-first-home`).

| Field | Type | Description |
|-------|------|-------------|
| `programmeName` | string | Display name (e.g. "Buying your first home") |
| `category` | string | Financial education category |
| `persona` | string | Target persona name |
| `estimatedTime` | string | Total estimated time for the programme |
| `lessonCount` | number | Number of lessons listed in the frontmatter |
| `lessons` | array | Ordered array of `{ slug: string, order: number }`. Source of truth for lesson display order. `slug` matches the lesson filename stem (without `.md`). |
| `sourceSha256` | string | SHA-256 (hex) of the raw `programme.md` file; used to skip re-writes when unchanged |
| `syncedAt` | Timestamp | When this programme was last synced |
| `syncedFrom` | string | Relative file path in the monorepo |

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
| `lessonFormat` | string | Always `"v2_interactive"`. |
| `lessonOrder` | number | Display order within the programme (1-indexed). Set from the `lessons` array in `programme.md` YAML frontmatter. FlutterFlow queries `core_lessons` filtered by `programmeId` and ordered by `lessonOrder`. |
| `screenCount` | number | Total number of screens in this lesson (5 for v2_interactive) |
| `sourceSha256` | string | SHA-256 (hex) of the raw markdown file at last successful sync; used to skip re-writes when unchanged |
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
| `lessonFormat` | string | Always `"v2_interactive"`. |
| `requestID` | string | Unique generation request ID |
| `goal` | string | From `lessonMetadata.goal` |
| `goalOrder` | number | From `lessonMetadata.goalOrder` (defaults to `1`) |
| `compliance_audit` | object | `{ status: "PASS", reasoning: string, attemptNumber: number, checkedAt: Timestamp }` |
| `human_approved` | boolean | Always `false` on creation -- requires manual review |
| `version` | number | Always `1` on creation |
| `created_at` | Timestamp | `FieldValue.serverTimestamp()` |

### Collection: `screens`

Individual screens belonging to a lesson. Stored as a **flat top-level collection** with auto-generated doc IDs, linked to the parent via `lessonId`. Contains screens for both core and user lessons, distinguished by `lessonType`.

#### Common Fields

| Field | Type | Description |
|-------|------|-------------|
| `lessonId` | string | ID of the parent `core_lessons` or `user_lessons` document |
| `lessonType` | string | `"core"` (synced from markdown) or `"user"` (AI-generated) |
| `lessonFormat` | string | Always `"v2_interactive"` |
| `userID` | string | Owner ID (for user lessons; `null` for core lessons) |
| `lessonName` | string | Display name (mirrors parent lesson) |
| `requestID` | string | Generation request ID (user lessons only; `null` for core) |
| `screenNumber` | number | Display order within the lesson (1-indexed) |

#### Screen Fields: `v2_interactive` (5-Question Drill-Down)

Each lesson produces exactly 5 screen documents. Each document represents one question with a feedback banner and an embedded Learn More drill-down. The entire question screen must fit on one mobile viewport (no scrolling); the Learn More page is the only scrollable surface.

| Field | Type | Description |
|-------|------|-------------|
| `questionText` | string | The question (max 20 words, challenges a common misconception) |
| `emoji` | string | Topic-related emoji |
| `options` | array | Array of exactly 4 option strings (max 10 words each, all plausible) |
| `correctIndex` | number | Index of the correct option (0-3). Position must vary across the 5 questions. |
| `feedbackCorrect` | string | Affirm the user + one extra insight (max 30 words) |
| `feedbackIncorrect` | string | Non-condescending reframe of the correct answer (max 30 words) |
| `learnMore` | map | Nested Learn More content (structure below) |

**`learnMore` sub-fields:**

| Field | Type | Description |
|-------|------|-------------|
| `hero` | map | `{ strapline: string (3-5 words in a pill badge), headline: string (8-15 words, clear statement, not a question) }` |
| `quickSummary` | string | Exactly 2 sentences with at least one specific number or £ amount. No jargon without immediate plain-English explanation. |
| `storyCarousel` | array | Array of exactly 5 story slide objects (see below) |
| `breakdownCards` | array | Array of exactly 2 visual card objects (see below). Must teach information NOT already covered in the story. |
| `takeaways` | array | Array of exactly 3 actionable strings. Include specific numbers in at least 2 of the 3. |
| `applyToMyMoney` | map | **OPTIONAL for Day 1 MVP.** Personalised financial insight card powered by Open Banking data (see below). |
| `actionLink` | map | Optional. `{ label: string, description: string, url: string }`. Links to trusted non-commercial sources only (MoneyHelper, Gov.uk, ClearScore, Credit Karma, HMRC, Turn2us). |

**`storyCarousel` item structure** (exactly 5 items, following a narrative arc using a named UK character):

| Field | Type | Description |
|-------|------|-------------|
| `emoji` | string | Slide emoji |
| `title` | string | 2-3 word slide title |
| `text` | string | 1-2 sentences, max 30 words. Must include a specific £ amount. |

Narrative arc: 1. Setup -> 2. Situation -> 3. Complication -> 4. Consequence -> 5. Resolution.

**`breakdownCards` item structure** (exactly 2 cards, each must use a different type):

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | One of: `"comparison"`, `"highlight"`, or `"timeline"` |
| `caption` | string | One sentence explaining the visual in plain English |

Additional fields per type:

- **`comparison`**: `leftLabel` (string), `leftItems` (array of 3 strings), `rightLabel` (string), `rightItems` (array of 3 strings). Use when contrasting two choices.
- **`highlight`**: `heroNumber` (string, e.g. "£600k"), `subtitle` (string), `detail` (string). Use for standout facts.
- **`timeline`**: `steps` (array of 3 objects: `{ step: number, description: string }`). Use for progressions or year-by-year scenarios.

**`applyToMyMoney` sub-fields** (Day 2 -- OPTIONAL for Day 1 MVP):

| Field | Type | Description |
|-------|------|-------------|
| `headline` | string | Must reference at least 2 of the 3 input values |
| `inputLabels` | array | Array of 3 short labels (max 12 characters each). Must be topic-specific per question -- not the same generic set every time. |
| `insights` | array | Array of 3 insight statement objects: `{ text: string, isPrimary: boolean }`. First insight should be primary (gets green left border). Each starts with a bold lead-in referencing a user number. |

The Apply to My Money card always ends with the disclaimer: "Based on general UK guidelines. Not personalised financial advice."

### Collection: `lesson_requests`

The trigger collection that initiates the Maker-Checker pipeline.

| Field | Type | Description |
|-------|------|-------------|
| *(user-submitted fields)* | various | `category`, `moduleName`, `lessonName`, `lessonLevel`, `lessonTime`, `learningStyle`, `userLessonRequest`, `userID` |
| `status` | string | `"completed"` (PASS), `"failed_compliance"` (all attempts exhausted), or `"error"` (unrecoverable JS error) |
| `lessonId` | string \| null | Auto ID of the `user_lessons` document if the run passed; otherwise `null` |
| `attempts` | number | Attempt count used before the run resolved |
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

A successful run uses one Firestore `batch` to atomically write:

1. **One `user_lessons` document** -- auto-generated ID
2. **N `screens` documents** -- one per question, each with `lessonType: "user"`, `lessonFormat: "v2_interactive"`, and `lessonId` linking to the parent

The `lesson_requests` document is **not** updated inside this batch; it is updated after the run completes (see `lesson_requests` schema above).

### Core lessons (`sync_curriculum.js`)

Uses a Firestore batch per **file**:

1. **One `core_lessons` document** -- keyed by lesson slug (e.g. `lisa-penalty-rules`)
2. **N `screens` documents** -- one per `## Question`, each with `lessonType: "core"`, `lessonFormat: "v2_interactive"`, and `lessonId` linking to the parent

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
