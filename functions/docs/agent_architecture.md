# Mulo: Agentic Enterprise Architecture

## 1. System Overview
Mulo is an autonomous, AI-driven educational application targeting young adults (ages 16-25) in the UK. The platform generates, validates, and publishes educational content entirely through a Multi-Agent System (MAS). 

The company operates on a **GitOps Architecture**. This repository is the single source of truth.
* **Hosting:** All Google Cloud Functions must be deployed to `europe-west2` (London).
* **Language:** Strict UK English spelling and grammar (e.g., ISA, programme, behaviour).
* **Tone:** Conversational, engaging, and non-judgemental.

## 2. Cursor AI Developer Instructions
When acting as the Lead Engineer for Mulo, Cursor AI must adhere to the following architectural rules:
1. **Context First:** Always refer to the specific `.md` files in the `docs/` folder for agent rules.
2. **The Maker-Checker Rule:** Content generation MUST always happen in a `while` loop alongside a Compliance Agent. Content can only be saved to Firestore if the Compliance Agent returns a `"status": "PASS"`.
3. **Audit Trails:** Every database write to the `lessons` collection must include a `compliance_audit` field containing the Compliance Agent's reasoning, and a timestamp. Failed drafts must be logged to the `agent_logs` collection.
4. **Batch Writes:** Lessons are split across two collections. Use a Firestore Batch Write to save the parent document to `lessons` and the individual screens to the `screens` subcollection/collection.

## 3. Database Schema (Firestore)
Cursor must hardcode the Gemini prompt and Cloud Function logic to output JSON matching this exact structure:

**Collection: `lessons`**
Fields: `category`, `moduleName`, `lessonName`, `lessonLevel`, `lessonTime`, `goal`, `goalOrder`, `requestID`, `userID`, `compliance_audit`, `human_approved` (boolean, default: false), `version` (integer, default: 1), `rewrite_reason` (string, nullable)

**Collection: `screens` (Linked to a Lesson)**
Fields: `lessonName`, `learningStyle`, `screenNumber`, `screenType`, `headline`, `paragraph`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `questionAnswer`, `feedbackCorrect`, `feedbackIncorrect`, `keyTakeaway1`, `keyTakeaway2`, `keyTakeaway3`, `LottieSuggestion`, `lottieURL`

**Collection: `lesson_history` (Subcollection of `lessons` - Used for Telemetry Rewrites)**
Fields: Contains the exact `screens` data from previous versions, plus a `timestamp` and `replaced_reason`.

**Collection: `image_library` (Used by Design Agent)**
Fields: `Keywords`, `LottieSuggestion` (Description), `lottieURL`, `human_approved` (boolean, default: false)

## 4. Agent Roster & Context Documents

### Phase 1: The Product Engine 
* **Creator Agent (`prompts/creator_agent.js`)**
  * *Context:* Read `docs/financial_standards.md` (PISA framework) and `docs/lesson_guidelines.md`.
  * *Role:* Drafts JSON lessons based on the schema above.
* **Compliance Agent (`prompts/compliance_agent.js`)**
  * *Context:* Read `docs/compliance_rules.md` (FCA Consumer Duty).
  * *Role:* Evaluates the Creator's draft. Enforces strict UK compliance (NO financial advice). Returns PASS/FAIL with reasoning.
* **Design Agent (`prompts/design_agent.js`)**
  * *Context:* Read `docs/design_guidelines.md` (Flat vector, transparent backgrounds).
  * *Role:* Triggered by a "PASS". First, checks the `image_library` collection to see if a matching image already exists based on keywords. If not, generates a new image via Nano Banana, saves it to Firebase Storage, updates the `screens` document, and saves the new image data to `image_library` for future reuse.

### Phase 4: Self-Improving Loop
* **Telemetry Agent (`prompts/telemetry_agent.js`)**
  * *Context:* Read `docs/telemetry_rules.md`.
  * *Role:* Analyzes user feedback, quiz drop-offs, and market data to suggest curriculum improvements.