> **AI Source Prompt:** Draft the Notifications & Nudge Strategy feature spec. Notifications encourage learning consistency and re-engage dropped-off users. Tone is warm and encouraging, never guilt-inducing. Covers 6 nudge types and strict frequency rules. Users can disable all notifications from their Profile.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Notifications & Nudge Strategy

## 1. Goal and Context

**Product Layer:** Learn (Lesson) -- engagement and retention
**Target Persona:** All five personas
**Core Objective:** Encourage learning consistency and re-engage users who have dropped off. Notifications must always feel warm, encouraging, and never guilt-inducing. Users can disable all notifications from their Profile.

## 2. User Journey

### 2.1 Nudge Types

| Nudge | Trigger | Example |
|-------|---------|---------|
| **Streak reminder** | Evening, if user hasn't completed a lesson that day and has an active streak | "You're on a 4-day streak -- keep it alive with a 2-minute lesson." |
| **Continue prompt** | In-progress programme not returned to in 2+ days | "You were halfway through Understanding Mortgages -- pick up where you left off." |
| **New content** | New Trending Now programme published, relevant to user's goal/interests | "New: What the Bank of England rate change means for your mortgage." |
| **Weekly recap** | Monday mornings | "Last week you completed 3 lessons and answered 15 questions. Here's what's next." |
| **Milestone celebration** | User hits a meaningful milestone | "You've completed 10 lessons -- your Property knowledge is growing fast." |
| **Worth revisiting** | Periodic, when user has low-scoring lessons not yet reviewed | "A quick review of What Lenders Actually Check could sharpen your score -- 2 minutes." |

### 2.2 Frequency Rules

* Maximum 1 push notification per day.
* Streak reminders take priority over other nudge types.
* If the user has set their pace to "At my own pace", reduce nudge frequency to weekly recap only.
* No notifications in the first 24 hours after signup (let the user explore organically).
* If a user hasn't opened the app in 7+ days, send a re-engagement nudge, then pause for 7 days before trying again.
* After 3 consecutive ignored notifications, stop sending until the user returns organically.

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| Profile Tab | `requirements/features/profile-tab.md` | Learning reminders toggle, learning pace setting |
| Growth Tab | `requirements/features/growth-tab.md` | Streak data, Worth Revisiting data |

## 4. System Architecture

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `users` | READ | `learningPace`, `learningRemindersEnabled`, `goal`, `topicsOfInterest` |
| `notifications` | WRITE | `userId`, `type` (nudge type), `sentAt` (Timestamp), `tappedAt` (Timestamp or null), `content` (notification text) |
| `lesson_history` | READ | `userId`, `completedAt` (for streak calculation and last activity) |

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Telemetry Agent | Tracks notification tap-through rates by nudge type, streak break patterns | Notification sent/tapped events |

## 5. Compliance Constraints

* Notifications must never contain financial advice, product recommendations, or urgency-inducing language ("Act now!", "Don't miss out!").
* Re-engagement nudges must not create guilt or anxiety about falling behind.

## 6. Failure States

* **Delivery Failure:** If a push notification fails to deliver, do not retry immediately. Log the failure and include the user in the next scheduled nudge cycle.
* **Disabled Notifications:** If `learningRemindersEnabled` is false, send no notifications. Weekly recap is also suppressed.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* Notification scheduling logic will likely be a Cloud Function triggered by a Cloud Scheduler (cron). The exact implementation is TBD.
* The 3-consecutive-ignored rule requires tracking `tappedAt` on each notification. If 3 sequential notifications have `tappedAt: null`, suppress further sends.
