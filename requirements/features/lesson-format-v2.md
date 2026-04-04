> **AI Source Prompt:** Draft the Lesson Format V2 (Interactive) feature spec. This defines the 5-question drill-down format with feedback banners and nested Learn More lightboxes. It covers the user flow, screen constraints, database schema, and A/B testing relationship with Format V1 (swipe). The detailed JSON schema is in core-system-architecture.md (Shape B). The agent guidelines are in functions/docs/lesson_guidelines_v2.md.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Lesson Format V2: Interactive (5-Question Drill-Down)

## 1. Goal and Context

**Product Layer:** Learn (Lesson)
**Target Persona:** All five personas
**Core Objective:** Deliver a question-first learning experience where users discover what they know before being taught. Format V2 is one of two lesson formats being A/B tested alongside Format V1 (8-11 screen swipe). Users answer 5 questions, receive immediate feedback, and optionally drill into a rich Learn More page for each question.

## 2. User Journey

* **Entry:** User taps a lesson from a programme view. If `lessonFormat` = `"v2_interactive"`, the V2 flow loads.

### The V2 Lesson Flow

**Question 1 -> Feedback -> (optional Learn More) -> Question 2 -> ... -> Question 5 -> Lesson Complete**

Each question has three layers:

**Layer 1: Question Screen** (no scrolling)
- Lesson title and progress bar at top
- Topic emoji
- Question text (max 20 words, challenges a misconception)
- 4 answer options (all plausible, max 10 words each)
- "Confirm Answer" button

**Layer 2: Feedback Banner** (slides up from bottom)
- Green banner (correct) or pink banner (incorrect)
- 1-2 sentences of feedback (max 30 words)
- Two buttons: "Learn more" (dark) and "Next" (white)

**Layer 3: Learn More Page** (scrollable -- the core teaching experience)
- **Hero Card** -- purple card with strapline (3-5 words) and headline (8-15 words)
- **Quick Summary** -- 2 sentences with specific numbers
- **Deep-Dive Cards** -- 3 tappable lightbox cards:
  1. Real World Example: 5-slide story carousel with named UK character
  2. Breakdown: 2 visual cards (comparison, highlight, or timeline types)
  3. Trusted Tool: optional link to Gov.uk/MoneyHelper/etc.
- **Takeaways** -- 3 actionable bullets with specific numbers
- **Apply to My Money** -- (Day 2, optional) personalised financial insight card
- **Next Question Button** -- hidden until user scrolls to bottom, then slides up

**Lesson Complete Screen** (no scrolling)
- Score-adaptive emoji and message (5 tiers)
- Animated score ring
- XP earned (20 per correct, +50 for 5/5)
- Programme progress dots and next lesson card

* **Exit:** User taps "Next Lesson" or "Retry lesson" on completion screen.

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography, Lottie constraints |
| FCA Regulations | `knowledge/fca-regulations.md` | All content must be educational |
| V2 Lesson Guidelines | `functions/docs/lesson_guidelines_v2.md` | Agent rulebook for V2 generation |
| Core System Architecture | `requirements/features/core-system-architecture.md` | Shape B schema definition |
| V1 Lesson Guidelines | `functions/docs/lesson_guidelines.md` | V1 format for A/B comparison |

## 4. System Architecture

### A/B Testing Architecture

Each lesson exists in **both** formats in Firestore (`lessonFormat` on each `core_lessons` / `user_lessons` / `screens` document identifies the variant). The app chooses which document to open for a given session or experiment. The Maker-Checker pipeline runs Creator + Compliance **twice** per `lesson_requests` doc (v1 then v2). The Telemetry Agent tracks per-format metrics to inform which variant the product should surface by default.

### Database Contract (Firestore)

Full schema is defined in `requirements/features/core-system-architecture.md` under "Shape B: `v2_interactive`". Key collections:

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `core_lessons` / `user_lessons` | READ | `lessonId`, `lessonFormat` (must be `"v2_interactive"`), `programmeId`, `lessonName` |
| `screens` | READ | Common fields + V2 fields: `questionText`, `emoji`, `options`, `correctIndex`, `feedbackCorrect`, `feedbackIncorrect`, `learnMore` (nested map) |
| `lesson_history` | WRITE | `lessonId`, `userId`, `quizResults`, `completedAt` |

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Creator Agent | Generates 5 question documents with nested learnMore objects | Second Maker-Checker run for each `lesson_requests` (forced `v2_interactive`) |
| Compliance Agent | Validates all content including nested learnMore traversal | Maker-Checker loop |
| Telemetry Agent | Tracks per-question analytics: Learn More open rate, lightbox engagement, carousel completion, scroll depth | Lesson interaction events |

## 5. Compliance Constraints

* All FCA constraints from `knowledge/fca-regulations.md` apply to every layer of the V2 format, including content nested inside the learnMore object.
* Story carousel characters must not give financial advice. Their stories are illustrative, not prescriptive.
* Breakdown cards must present educational comparisons, not product recommendations.
* Action links must only point to approved non-commercial sources.
* Apply to My Money (when implemented) must display the disclaimer: "Based on general UK guidelines. Not personalised financial advice."

## 6. Failure States

* **Missing learnMore:** If a screen document's `learnMore` field is missing or malformed, the "Learn more" button on the feedback banner should be hidden. The user can still proceed to the next question.
* **Incomplete Carousel:** If `storyCarousel` has fewer than 5 slides, display available slides with a note that content is being updated.
* **Agent Failure:** If the Creator Agent fails to generate valid V2 JSON, the lesson is not published. Standard Maker-Checker failure handling applies.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| `functions/docs/lesson_guidelines_v2.md` | V2 agent rulebook |
| `functions/prompts/creator_agent.js` | Routes to V2 guidelines when `lessonFormat = "v2_interactive"` |
| `functions/prompts/compliance_agent.js` | Validates nested V2 structures |
| `functions/src/maker_checker_loop.js` | Generates and validates V2 lessons |

## 8. Notes

* V2 lessons do not use Lottie animations. The visual richness comes from the Learn More lightboxes instead.
* The Next Question button's scroll-gating behaviour (hidden until bottom is reached) is a deliberate UX choice to ensure users see all Learn More content before advancing. Once revealed, it stays visible permanently.
* Analytics events specific to V2: lightbox opened/closed (which type, which question), story carousel completed/abandoned (which slide), action link clicked, scroll depth reached, Learn More vs Next choice on feedback banner.
