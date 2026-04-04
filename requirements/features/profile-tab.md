> **AI Source Prompt:** Draft the Profile Tab feature spec. This contains all user data that drives the personalised learning experience. Every field is editable and changes take immediate effect on recommended content, lesson difficulty, and personalised insights. Includes About You, Learning Preferences, Connections & Privacy, Data Trust, and Account Actions.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Profile Tab

## 1. Goal and Context

**Product Layer:** ALL -- settings that influence See / Learn / Act
**Target Persona:** All five personas
**Core Objective:** Give users full control over the data that drives their personalised experience. Every field set during onboarding is editable here. Changes take immediate effect on recommended content, lesson difficulty, and personalised insights. The Profile must feel transparent and trustworthy -- users should understand exactly what their data is used for.

## 2. User Journey

* **Entry:** User taps the Profile tab from the bottom navigation.
* **Sections:**

### 2.1 About You

* **Name** -- editable, used for personalised greetings.
* **Age** -- editable, influences content relevance.

### 2.2 Learning Preferences

All initially set during onboarding, editable at any time:

* **Financial goal** -- primary goal (single select from available goals). Drives recommended content. Changes immediately update goal badges and Home screen layout.
* **Experience level** -- Complete beginner / Some knowledge / Fairly confident / Pretty savvy. Affects lesson difficulty recommendations.
* **Learning difficulty** -- Beginner friendly / Challenge me / Mix of both. Controls Beginner vs Intermediate lesson ratio.
* **Learning pace** -- 1 lesson per week / 2-3 per week / Daily / At my own pace. Sets nudge frequency and streak expectations.
* **Topics of interest** -- multi-select from available topics. Broadens recommendations beyond goal-driven content.

### 2.3 Connections & Privacy

* **Open Banking** -- toggle to connect/disconnect. When connected, financial data personalises Apply to My Money sections and influences programme recommendations. (Day 2 feature.)
* **Learning reminders** -- toggle to enable/disable push notifications and nudges.

### 2.4 Data Trust

Visible statement: "We use your profile to personalise lessons -- not to sell products or give financial advice. You can change or delete your data at any time." Reinforces Mulo's position as an education platform and supports FCA compliance.

### 2.5 Account Actions

* **Export my data** -- allows users to download all data held about them (GDPR right of access).
* **Delete my account** -- permanently removes the user's account and all associated data (GDPR right to erasure).

* **Exit:** Changes are saved to Firestore immediately on edit. User navigates to another tab.

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography |
| FCA Regulations | `knowledge/fca-regulations.md` | Data trust statement wording, compliance |
| User Onboarding | `requirements/features/user-onboarding.md` | Fields initially set during onboarding |

**Prohibitions:** NEVER collect account numbers, portfolio values, specific salary figures, or any regulated financial data through the Profile screen.

## 4. System Architecture

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `users` | READ/WRITE | All profile fields: `name`, `age`, `goal`, `experienceLevel`, `learningDifficulty`, `learningPace`, `topicsOfInterest`, `openBankingConnected`, `learningRemindersEnabled` |

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Telemetry Agent | Tracks which profile fields are changed and how often, goal change events (from/to) | Profile edit events |

## 5. Compliance Constraints

* The data trust statement must always be visible on the Profile screen.
* Data export must include all data held about the user (lesson history, profile, derived signals if Open Banking connected).
* Account deletion must be permanent and irreversible. All associated data must be purged from Firestore, including `lesson_history`, `users`, and any derived Open Banking signals.
* Open Banking connection/disconnection must follow PSD2 consent requirements.

## 6. Failure States

* **Data Failure:** If a profile update fails to write to Firestore, show inline error on the affected field with retry. Do not revert the UI -- keep the user's intended value visible.
* **Export Failure:** If data export fails, show "Export failed -- please try again" with retry button.
* **Delete Failure:** If account deletion fails, show "We couldn't delete your account right now. Please try again or contact support."

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* Profile changes trigger an immediate refresh of programme recommendations on the Home screen. No page reload required -- the recommendation engine re-evaluates on next Home screen visit.
* Goal change events are a critical analytics signal. The Telemetry Agent should track what goal was changed from/to and when.
* The "At my own pace" learning pace option reduces nudge frequency to weekly recap only.
