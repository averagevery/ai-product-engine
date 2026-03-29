> **AI Source Prompt:** Draft the Programme Recommendations feature spec. When a user selects a financial goal, the system recommends relevant programmes based on that goal and their onboarding answers (confidence level, financial situation). Recommendations are educational, never financial product recommendations. This feature connects the Onboarding output to the Learning Journey input.
> **Generated:** 2026-03-29
> **Rule Used:** create-feature.mdc

# Programme Recommendations

## 1. Goal and Context

**Product Layer:** Learn (Lesson)
**Target Persona:** All five personas -- Sarah (First-Time Buyer), James (Clueless Professional), Aisha (Debt Trapped), Tom (Passive Pension), Chloe (Financially Curious)
**Core Objective:** When a user selects a financial goal, present a ranked list of programmes tailored to their situation. A first-time buyer with low confidence should see beginner mortgage programmes first. A financially curious user who already feels somewhat confident should see intermediate investment programmes higher. The ranking uses the user's onboarding data (goals, situation answers, confidence level) to order programmes by relevance, ensuring every user gets a personalised starting point without the platform ever making a financial product recommendation.

## 2. User Journey

* **Entry:** User taps a goal on their dashboard (after onboarding) or returns to a goal they previously selected. The goal view loads and triggers the recommendation logic.
* **Action:**
  1. The system reads the user's profile from `users` (goals, situation, confidence level).
  2. The system reads all programmes linked to the selected goal from `programmes`.
  3. Programmes are ranked by relevance:
     - **Difficulty match:** If the user's confidence is "Not confident", beginner programmes rank first. If "Confident", intermediate and expert programmes rank higher.
     - **Situation match:** If the user indicated debt concerns during onboarding, debt-focused programmes within the goal are boosted. If the user indicated they have savings, savings-optimisation programmes are boosted.
     - **Completion status:** Programmes already completed are moved to a "Completed" section at the bottom. In-progress programmes are pinned to the top.
  4. The ranked list is displayed as programme cards. Each card shows: name, brief description, difficulty badge (Beginner / Intermediate / Expert), number of lessons, estimated time, and a "Recommended for you" tag on the top-ranked programme.
* **Exit:** User taps a programme card and enters the programme view (see Learning Journey feature). The recommendation ranking is not persisted -- it is computed on each visit so it reflects updated progress and any profile changes.

## 3. Context Documents and Technical Boundaries

AI agents generating code or content for this feature MUST read the following documents first:

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography, word limits, Lottie constraints |
| FCA Regulations | `knowledge/fca-regulations.md` | Recommendations must be educational, not financial |
| Personas | `knowledge/personas.md` | Persona profiles define the situations and goals that drive ranking |
| User Onboarding | `requirements/features/user-onboarding.md` | Defines the data captured during onboarding that feeds this engine |
| Learning Journey | `requirements/features/learning-journey.md` | Defines the goal/programme/lesson hierarchy this feature ranks |

**Prohibitions (quick reference):** NEVER use the `$` symbol, red alert text, complex background gradients, or brand logos. NEVER use language that implies a financial product recommendation (e.g., "We recommend this ISA programme" -- instead: "Based on your goals, start here").

## 4. System Architecture

### Involved AI Agents

| Agent | Role in This Feature | Trigger |
|-------|---------------------|---------|
| Telemetry Agent | Monitors recommendation click-through rates and programme start rates per goal. Flags if a recommended programme has low engagement (< 20% start rate). | Weekly analysis cycle |

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `users` | READ | `goals`, `situation`, `confidenceLevel` |
| `goals` | READ | `goalId`, `name`, `programmeIds` |
| `programmes` | READ | `programmeId`, `goalId`, `name`, `description`, `difficulty`, `lessonCount`, `estimatedTime`, `tags` (array -- e.g., "debt", "savings", "investing", "pension") |
| `lesson_history` | READ | `lessonId`, `userId`, `completedAt` (used to compute programme completion status) |

### Recommendation Logic (Client-Side)

The ranking is computed on the client, not by a backend agent. The algorithm is deterministic:

1. Fetch all programmes for the selected goal.
2. For each programme, compute a relevance score:
   - **Difficulty score:** +3 if programme difficulty matches user's confidence level, +1 if adjacent, 0 if opposite extreme.
   - **Tag score:** +2 for each programme tag that matches a user situation flag (e.g., user has debt concern + programme tagged "debt" = +2).
   - **Progress score:** +5 if in-progress (always surface first), -10 if completed (push to bottom).
3. Sort descending by total score. Ties broken by programme `order` field.

This logic runs on-device with no server round-trip beyond the Firestore reads. If the team later wants AI-powered recommendations (e.g., a Recommendation Agent), the scoring can be moved server-side without changing the UI contract.

## 5. Compliance Constraints

FCA-specific rules that apply to this feature:

* Programme recommendations are **educational pathway suggestions**, not financial product recommendations. The language must reflect this: "Start here" or "Recommended based on your goals", never "We recommend this financial product".
* The recommendation engine MUST NOT prioritise programmes that lead directly to Act-layer product comparisons. The Learn layer must be genuinely educational, not a funnel to revenue-generating actions.
* If all programmes for a goal are debt-related and the user's situation flags indicate financial distress, the top recommendation must include a programme that surfaces free debt advice services (StepChange, Citizens Advice) within its lessons.
* A small disclaimer must appear on the goal view: "Programmes are suggested based on your learning goals. This is not financial advice."

## 6. Failure States

* **Data Failure:** If the Firestore read for programmes or user profile fails, show the programme list in default order (by `order` field) without personalisation. Do not block the user from browsing -- degrade gracefully to an unranked list.
* **Empty Goal:** If a goal has zero published programmes, show a "Coming soon" state with the goal description and an option to explore other goals.
* **Missing Onboarding Data:** If a user somehow reaches this screen without completing onboarding (e.g., data corruption, profile reset), fall back to default ordering and surface a gentle prompt: "Complete your profile to get personalised recommendations."

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* The `programmes` collection needs a `tags` field (array of strings) to enable situation-based matching. Tags should be drawn from a controlled vocabulary (e.g., "debt", "savings", "investing", "pension", "budgeting", "first-home", "credit") to ensure consistent matching against onboarding situation flags.
* The scoring weights (3, 2, 5, -10) are initial values. The Telemetry Agent should track whether users are starting the top-recommended programme. If click-through on the top recommendation drops below 30%, the weights should be reviewed.
* This feature is intentionally client-side to keep latency low (no server call beyond Firestore reads). If the product later introduces collaborative filtering ("Users like you also completed..."), that would require a server-side Recommendation Agent and a new feature spec.
* The "Recommended for you" tag should only appear on the single highest-scored programme. Showing it on multiple programmes dilutes the signal.
