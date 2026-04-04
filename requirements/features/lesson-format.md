> **AI Source Prompt:** Draft the Lesson Format (Interactive) feature spec. This defines the 5-question drill-down format with feedback banners and nested Learn More lightboxes. It covers the user flow, screen constraints, and database schema. The detailed JSON schema is in core-system-architecture.md. The agent guidelines are in functions/docs/lesson_guidelines.md.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Lesson Format: Interactive (5-Question Drill-Down)

## 1. Goal and Context

**Product Layer:** Learn (Lesson)
**Target Persona:** All five personas
**Core Objective:** Deliver a question-first learning experience where users discover what they know before being taught. Users answer 5 questions, receive immediate feedback, and optionally drill into a rich Learn More page for each question.

## 2. User Journey

* **Entry:** User taps a lesson from a programme view. The interactive flow loads.

### The Lesson Flow

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
| Lesson Guidelines | `functions/docs/lesson_guidelines.md` | Agent rulebook for lesson generation |
| Core System Architecture | `requirements/features/core-system-architecture.md` | Screen schema definition |

## 4. System Architecture

### Database Contract (Firestore)

Full schema is defined in `requirements/features/core-system-architecture.md` under the `screens` collection. Key collections:

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `core_lessons` / `user_lessons` | READ | `lessonId`, `lessonFormat` (must be `"v2_interactive"`), `programmeId`, `lessonName` |
| `screens` | READ | `lessonId`, `screenNumber`, `questionText`, `emoji`, `options`, `correctIndex`, `feedbackCorrect`, `feedbackIncorrect`, `learnMore` (nested map) |
| `lesson_history` | WRITE | `lessonId`, `userId`, `quizResults`, `completedAt` |

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Creator Agent | Generates 5 question documents with nested learnMore objects | Maker-Checker run for each `lesson_requests` document |
| Compliance Agent | Validates all content including nested learnMore traversal | Maker-Checker loop |
| Telemetry Agent | Tracks per-question analytics: Learn More open rate, lightbox engagement, carousel completion, scroll depth | Lesson interaction events |

## 5. Compliance Constraints

* All FCA constraints from `knowledge/fca-regulations.md` apply to every layer of the lesson format, including content nested inside the learnMore object.
* Story carousel characters must not give financial advice. Their stories are illustrative, not prescriptive.
* Breakdown cards must present educational comparisons, not product recommendations.
* Action links must only point to approved non-commercial sources.
* Apply to My Money (when implemented) must display the disclaimer: "Based on general UK guidelines. Not personalised financial advice."

## 6. Failure States

* **Missing learnMore:** If a screen document's `learnMore` field is missing or malformed, the "Learn more" button on the feedback banner should be hidden. The user can still proceed to the next question.
* **Incomplete Carousel:** If `storyCarousel` has fewer than 5 slides, display available slides with a note that content is being updated.
* **Agent Failure:** If the Creator Agent fails to generate valid JSON, the lesson is not published. Standard Maker-Checker failure handling applies.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| `functions/docs/lesson_guidelines.md` | Lesson agent rulebook |
| `functions/prompts/creator_agent.js` | Routes to lesson guidelines |
| `functions/prompts/compliance_agent.js` | Validates nested structures |
| `functions/src/maker_checker_loop.js` | Generates and validates lessons |

## 8. Notes

* Lessons do not use Lottie animations. The visual richness comes from the Learn More lightboxes instead.
* The Next Question button's scroll-gating behaviour (hidden until bottom is reached) is a deliberate UX choice to ensure users see all Learn More content before advancing. Once revealed, it stays visible permanently.
* Analytics events: lightbox opened/closed (which type, which question), story carousel completed/abandoned (which slide), action link clicked, scroll depth reached, Learn More vs Next choice on feedback banner.
