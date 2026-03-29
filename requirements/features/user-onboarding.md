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
* **Action:** The user completes a short series of screens (target: 4-6 screens, under 90 seconds total):
  1. **Welcome screen** -- sets the tone ("No judgement. Just learning.").
  2. **Goal selection** -- user picks one or more financial goals from a curated list (e.g., "Save for a house deposit", "Get out of debt", "Start investing", "Understand my pension", "Learn the basics").
  3. **Situation snapshot** -- 2-3 light-touch questions about their current situation (e.g., "Do you have any savings?", "Do you have any debt you're worried about?"). Answers are multiple-choice, not free-text.
  4. **Confidence check** -- a single self-assessment ("How confident do you feel managing your money?" on a 3-point scale: Not confident / Somewhat confident / Confident).
  5. **Summary screen** -- reflects back what the user shared and confirms: "We'll build your learning plan around this."
* **Exit:** Profile is saved to Firestore. User is redirected to their personalised dashboard showing recommended programmes based on their goals and onboarding answers.

## 3. Context Documents and Technical Boundaries

AI agents generating code or content for this feature MUST read the following documents first:

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography, word limits, Lottie constraints |
| FCA Regulations | `knowledge/fca-regulations.md` | Compliance boundaries -- onboarding must not collect regulated data |
| Personas | `knowledge/personas.md` | The five target personas whose needs drive the question design |
| Lesson Guidelines | `functions/docs/lesson_guidelines.md` | Mobile screen constraints (word limits apply to onboarding screens too) |

**Prohibitions (quick reference):** NEVER use the `$` symbol, red alert text, complex background gradients, or brand logos in any onboarding screen. NEVER ask for account numbers, portfolio values, specific salary figures, or any data that would constitute regulated financial information.

## 4. System Architecture

### Involved AI Agents

| Agent | Role in This Feature | Trigger |
|-------|---------------------|---------|
| Telemetry Agent | Tracks onboarding completion rate, drop-off screen, and time-to-complete | Onboarding completion or abandonment event |

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `users` | WRITE | `userId`, `goals` (array of strings), `situation` (object -- answers to snapshot questions), `confidenceLevel` (string), `onboardingCompletedAt` (Timestamp), `created_at` (Timestamp) |
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

* The goal list presented in step 2 should map directly to the `goals` Firestore collection (see Learning Journey feature spec). Each goal string must match a document ID in that collection so the Programme Recommendations engine can resolve it.
* The onboarding flow is designed to be revisitable -- users should be able to update their goals and situation from a settings screen after initial completion. This updates the `users` document and triggers a refresh of programme recommendations.
* Onboarding completion rate is a critical product metric. The Telemetry Agent should flag if drop-off exceeds 30% on any single screen.
