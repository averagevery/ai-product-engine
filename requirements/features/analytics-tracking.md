> **AI Source Prompt:** Draft the Analytics & Tracking feature spec. Covers app-level analytics events beyond the in-lesson telemetry already defined. Includes tab navigation, programme card interactions, goal changes, profile edits, open banking events, onboarding metrics, notification engagement, and streak data.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Analytics & Tracking

## 1. Goal and Context

**Product Layer:** ALL -- cross-cutting analytics
**Target Persona:** N/A (internal tool)
**Core Objective:** Track user behaviour across the app to inform product decisions, content strategy, and recommendation tuning. In-lesson analytics (question answered, Learn More opened, carousel engagement) are defined in the Lesson Format specs. This spec covers app-level events.

## 2. App-Level Events

### 2.1 Navigation

| Event | Data Captured |
|-------|--------------|
| Tab visited | Which tab (Home / Growth / Profile / Explore), timestamp, time spent |
| Tab sequence | Order of tab visits within a session |

### 2.2 Programme Discovery

| Event | Data Captured |
|-------|--------------|
| Programme card tapped | Programme ID, source section (Continue / Recommended / Trending / Browse by Topic), position in list |
| Topic View opened | Which topic, programmes viewed within |
| See All tapped | Which section (Continue / Recommended) |

### 2.3 Goal & Profile

| Event | Data Captured |
|-------|--------------|
| Goal changed | Previous goal, new goal, timestamp |
| Profile field edited | Which field, old value, new value, timestamp |
| Open Banking connected | Timestamp |
| Open Banking disconnected | Timestamp |

### 2.4 Onboarding

| Event | Data Captured |
|-------|--------------|
| Onboarding started | Timestamp |
| Onboarding screen completed | Screen number (1-8), time spent on screen |
| Onboarding completed | Total time, all answers |
| Onboarding abandoned | Drop-off screen number, time spent |

### 2.5 Engagement

| Event | Data Captured |
|-------|--------------|
| Notification received | Nudge type, timestamp |
| Notification tapped | Nudge type, time from receipt to tap |
| Notification ignored | Nudge type, consecutive ignore count |
| Streak started | Date |
| Streak broken | Length at break, day missed |
| Streak milestone | Length (7, 14, 30, etc.) |

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| Telemetry Rules | `functions/docs/telemetry_rules.md` | In-lesson telemetry agent rules |
| All feature specs | `requirements/features/*.md` | Each spec notes which analytics events it generates |

## 4. System Architecture

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `analytics` | WRITE | `userId`, `eventType`, `eventData` (map), `timestamp`, `sessionId` |
| `users` | READ | `userId` (for attribution) |

App-level events write to a single `analytics` collection with flexible `eventData` maps. The Telemetry Agent reads from this collection during its weekly analysis cycle.

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Telemetry Agent | Analyses weekly aggregates from `analytics` to suggest curriculum changes, recommendation weight adjustments, and nudge strategy refinements | Weekly Cloud Scheduler |

## 5. Compliance Constraints

* Analytics data must not contain personally identifiable financial information. User IDs are anonymous or pseudonymous.
* Open Banking connect/disconnect events must be logged for PSD2 audit compliance.
* Users who delete their account must have all `analytics` records purged (GDPR right to erasure).

## 6. Failure States

* **Write Failure:** Analytics writes must never block the user experience. If a write fails, discard the event. Analytics data loss is acceptable; user-facing disruption is not.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* Firebase Analytics could handle most of these events natively. The `analytics` Firestore collection is for events the Telemetry Agent needs to process (not all events need a Firestore record).
* Session ID can be generated client-side per app launch.
* Onboarding drop-off rate is a critical product metric. The Telemetry Agent should alert if any single screen exceeds 30% drop-off.
