> **AI Source Prompt:** Draft the User Onboarding feature spec. This is the entry point to the Mulo platform -- it captures key details about the user's financial situation, knowledge level, and goals so the platform can personalise their learning experience. Use the five personas from knowledge/personas.md as reference.
> **Generated:** 2026-03-29
> **Rule Used:** create-feature.mdc

# User Onboarding

## 1. Goal and Context

**Product Layer:** ALL (gateway to See / Learn / Act)
**Target Persona:** All five personas -- Sarah (First-Time Buyer), James (Clueless Professional), Aisha (Debt Trapped), Tom (Passive Pension), Chloe (Financially Curious)
**Core Objective:** Capture enough about a new user's financial situation, confidence level, and goals to personalise their learning journey from the very first session. The onboarding must feel quick, supportive, and non-judgemental -- users who feel interrogated will abandon the flow. The output is a saved user profile that feeds the Programme Recommendations engine and tailors lesson difficulty.

## 2. User Journey

* **Entry:** User opens the app for the first time. No account exists yet. The onboarding screen appears automatically.
* **Action:** The user completes 8 screens (target: under 60 seconds total). The flow should feel quick and conversational, not like a form.
  1. **Name** -- "What should we call you?" Free text input. Used for personalised greetings throughout the app.
  2. **Age** -- "How old are you?" Free text or age range selector. Used to tailor content relevance (e.g., pensions content less prominent for younger users, student loan content less relevant for older users).
  3. **Goal** -- "What's your main financial goal right now?" Single select from: Buy my first home, Build an emergency fund, Improve my credit score, Clear my debt, Build wealth, Retire comfortably, Understand my finances, Protect my finances. This is the most important question -- it determines the entire Home screen layout and recommended programmes.
  4. **Experience** -- "How would you describe your financial knowledge?" Single select: Complete beginner / Some knowledge / Fairly confident / Pretty savvy. Affects lesson difficulty recommendations and content depth.
  5. **Difficulty** -- "How do you like to learn?" Single select: Beginner friendly / Challenge me / Mix of both. Determines the ratio of Beginner to Intermediate lessons surfaced.
  6. **Pace** -- "How often do you want to learn?" Single select: 1 lesson per week / 2-3 per week / Daily / At my own pace. Sets nudge frequency and streak expectations.
  7. **Topics** -- "What interests you most?" Multi-select from available topics (Property, Saving & Budgeting, Investing, Debt & Credit, Pensions, Tax & Admin, Protection, Economics). Broadens recommendations beyond the goal-driven content.
  8. **Open Banking (optional)** -- "Want personalised insights based on your spending?" Explains the value proposition and gives the user the choice to connect or skip. Not mandatory -- users can always connect later from their Profile.
* **Exit:** Profile is saved to Firestore. User is redirected to their personalised dashboard showing recommended programmes based on their goals and onboarding answers.

## 3. Context Documents and Technical Boundaries

AI agents generating code or content for this feature MUST read the following documents first:

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography, word limits, Lottie constraints |
| FCA Regulations | `knowledge/fca-regulations.md` | Compliance boundaries -- onboarding must not collect regulated data |
| Personas | `knowledge/personas.md` | The five target personas whose needs drive the question design |
| Lesson Guidelines | `functions/docs/lesson_guidelines.md` | Mobile screen constraints and question format (word limits apply to onboarding screens too) |

**Prohibitions (quick reference):** NEVER use the `$` symbol, red alert text, complex background gradients, or brand logos in any onboarding screen. NEVER ask for account numbers, portfolio values, specific salary figures, or any data that would constitute regulated financial information.

## 4. System Architecture

### Involved AI Agents

| Agent | Role in This Feature | Trigger |
|-------|---------------------|---------|
| Telemetry Agent | Tracks onboarding completion rate, drop-off screen, and time-to-complete | Onboarding completion or abandonment event |

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `users` | WRITE | `userId`, `name` (string), `age` (string or number), `goal` (string -- primary goal), `experienceLevel` (string: Complete beginner / Some knowledge / Fairly confident / Pretty savvy), `learningDifficulty` (string: Beginner friendly / Challenge me / Mix of both), `learningPace` (string: 1 lesson per week / 2-3 per week / Daily / At my own pace), `topicsOfInterest` (array of strings), `openBankingConnected` (boolean, default false), `onboardingCompletedAt` (Timestamp), `created_at` (Timestamp) |
| `users` | READ | All fields above (consumed by Programme Recommendations and lesson difficulty calibration) |

## 5. Compliance Constraints

FCA-specific rules that apply to this feature:

* Onboarding questions MUST be educational-level only. Ask about confidence and broad categories ("Do you have savings?"), never about specific amounts, account details, or provider names.
* The onboarding MUST NOT collect data that could be used to construct a personal financial recommendation. The purpose is educational personalisation only.
* If a user's answers suggest financial distress (e.g., "I'm worried about debt" + "Not confident"), the platform must surface a supportive tone and ensure recommended programmes include debt education with links to free advice services (StepChange, Citizens Advice) -- not product comparisons.
* A disclaimer must be visible during onboarding: "This helps us personalise your learning. We never give financial advice."

## 6. Failure States

* **Data Failure:** If the Firestore write fails when saving the profile, show a friendly retry screen ("Something went wrong -- tap to try again"). Do not lose the user's answers; hold them in local state until the write succeeds.
* **Compliance Failure:** Not applicable at the onboarding stage (no AI-generated content passes through the Maker-Checker loop here). If the question set is changed in future, any new questions must be reviewed against FCA rules before deployment.
* **Abandonment:** If the user closes the app mid-onboarding, save partial progress locally. On next launch, resume from the last completed screen rather than restarting.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* The goal list presented in screen 3 should map directly to the `goals` Firestore collection (see Learning Journey feature spec). Available goals: Buy my first home, Build an emergency fund, Improve my credit score, Clear my debt, Build wealth, Retire comfortably, Understand my finances, Protect my finances. Each goal string must match a document ID in that collection so the Programme Recommendations engine can resolve it.
* All onboarding answers are stored in the user's Profile and can be changed at any time. Changes take immediate effect on recommended content, lesson difficulty, and personalised insights. This updates the `users` document and triggers a refresh of programme recommendations.
* The onboarding routing logic (how answers map to recommended programmes) is detailed in `knowledge/onboarding-routing.md`.
* Onboarding completion rate is a critical product metric. The Telemetry Agent should flag if drop-off exceeds 30% on any single screen.
