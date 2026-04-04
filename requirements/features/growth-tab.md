> **AI Source Prompt:** Draft the Growth Tab feature spec. This is the user's progress and stats hub. It contains Goal Reminder, Learning Streak, Strongest Areas, Worth Revisiting, Topic Coverage, and Weekly Stats. Data here may also be used for nudges and marketing content.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Growth Tab

## 1. Goal and Context

**Product Layer:** Learn (Lesson) -- progress tracking
**Target Persona:** All five personas
**Core Objective:** Encourage continued learning, help users understand their strengths and gaps, and provide a sense of achievement. The Growth tab answers: "How am I doing?", "What am I good at?", and "What should I review?".

## 2. User Journey

* **Entry:** User taps the Growth tab from the bottom navigation.
* **Sections (top to bottom, fixed order):**

### 2.1 Goal Reminder

Compact card showing the user's financial goal with savings progress. Smaller than the Home screen version but always present as a north star reminder.

### 2.2 Learning Streak

Weekly view (Mon-Sun) showing which days the user completed at least one lesson. Streak counter shows the current consecutive day count. Resets if the user misses a day. Tone is encouraging ("1 lesson a day keeps the gaps away"), never guilt-inducing.

### 2.3 Strongest Areas

Horizontal scroll cards highlighting programmes where the user has scored an average of 4/5 or above. Each card shows programme emoji, name, and average score. Reinforces what the user knows well and builds confidence. Only appears when the user has completed at least one programme with a qualifying score.

### 2.4 Worth Revisiting

Cards showing specific lessons where the user scored 2/5 or below. Each card shows lesson title, programme name, score, and a "Review" prompt. Tapping takes the user back into the lesson. Framing is always positive -- "worth revisiting" rather than "you failed". Only appears when there are low-scoring completed lessons.

### 2.5 Topic Coverage

Breakdown of all topics showing percentage completion, lesson counts, and average scores where available. Colour-coded progress bars give an instant visual of coverage across all areas. This is the broadest progress view in the app.

### 2.6 This Week (Weekly Stats)

Summary of the user's activity in the current week: programmes started, lessons completed, questions answered, average score, and time spent learning. Resets every Monday. Provides a regular sense of momentum.

* **Exit:** User taps a Worth Revisiting card (enters lesson) or navigates to another tab.

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography |
| Goals System | `requirements/features/goals-system.md` | Goal reminder card |
| Learning Journey | `requirements/features/learning-journey.md` | Lesson/programme completion data |

**Prohibitions:** NEVER use the `$` symbol, red alert text, or anxiety-inducing language about gaps in learning.

## 4. System Architecture

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `users` | READ | `goal`, `userId` |
| `lesson_history` | READ | `lessonId`, `userId`, `completedAt`, `quizResults` (to compute scores and streaks) |
| `programmes` | READ | `programmeId`, `name`, `emoji`, `topic`, `lessonCount` |
| `core_lessons` / `user_lessons` | READ | `lessonId`, `programmeId`, `lessonName` |

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Telemetry Agent | Tracks streak length distribution, break points, Worth Revisiting tap rates | Weekly analysis cycle |

## 5. Compliance Constraints

* Worth Revisiting messaging must never be punitive or shame-inducing. Use positive framing only.
* No financial data is displayed on the Growth tab -- it shows learning progress only.

## 6. Failure States

* **Data Failure:** Show skeleton loading with retry.
* **No Data:** If the user has not completed any lessons, show an encouraging empty state: "Complete your first lesson to start tracking your progress."
* **Empty Sections:** Strongest Areas and Worth Revisiting only appear when relevant data exists. Topic Coverage shows 0% for all topics if no lessons completed.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* Streak data is computed from `lesson_history` timestamps grouped by day. No separate streak collection is needed.
* "Strongest Areas" threshold (4/5+) and "Worth Revisiting" threshold (2/5-) are initial values. The Telemetry Agent may recommend adjustments based on user engagement data.
* Weekly stats reset every Monday at 00:00 UTC.
