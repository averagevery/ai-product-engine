> **AI Source Prompt:** Draft the XP & Rewards System feature spec. XP (experience points) rewards learning activity and encourages consistency. XP is earned by answering questions, with correct answers earning more. Bonus XP for perfect scores. The system should always feel rewarding, never punitive.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# XP & Rewards System

## 1. Goal and Context

**Product Layer:** Learn (Lesson) -- gamification layer
**Target Persona:** All five personas
**Core Objective:** Reward learning activity and encourage consistency through a visible, accumulating XP system. Correct answers earn more, but incorrect answers still earn some XP to encourage participation. The system must always feel rewarding, never punitive.

## 2. User Journey

* **Entry:** XP is earned automatically as users answer questions within lessons.
* **How XP is Earned:**

| Action | XP Awarded |
|--------|-----------|
| Correct answer | 20 XP |
| Incorrect answer | Minimal XP (encourages participation) |
| Perfect lesson score (5/5) | +50 XP bonus |

* **Where XP is Visible:**
  - Lesson Complete screen: shows XP earned for that lesson, with gold shimmer animation.
  - Growth tab: cumulative XP total (future consideration).

* **Principles:**
  - XP should always feel rewarding, never punitive.
  - Incorrect answers still earn some XP to encourage continuous participation.
  - The system may be refined over time to weight XP toward suggested lessons, encouraging users to follow the recommended learning path.
  - Streak bonuses (completing at least one lesson per day) may carry an XP multiplier in future iterations.

### Future: Prizes & Competitions

Users with the most XP may be eligible for prizes or rewards in future. The mechanics are yet to be decided, but the XP system is designed to support leaderboard-style features, seasonal competitions, or milestone rewards.

* **Exit:** XP accumulates persistently in the user's profile.

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Gold shimmer animation, score ring |
| Learning Journey | `requirements/features/learning-journey.md` | Lesson completion triggers XP award |

## 4. System Architecture

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `users` | READ/WRITE | `totalXP` (number, cumulative), `userId` |
| `lesson_history` | WRITE | `xpEarned` (number, per lesson session) |

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Telemetry Agent | Tracks XP distribution, identifies if weighted XP toward suggested lessons improves follow-through | Weekly analysis cycle |

## 5. Compliance Constraints

* XP is a learning engagement metric, not a financial reward. Never frame XP as having monetary value.
* Prize/competition features (future) must not constitute gambling or create financial pressure to participate.

## 6. Failure States

* **XP Write Failure:** If `lesson_history` or `users` XP update fails, retry silently. Show the earned XP on the Lesson Complete screen from local calculation. Sync to Firestore on next successful write.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* XP values (20 per correct, +50 bonus) are initial values. The Telemetry Agent should track whether these values maintain engagement over time.
* The `totalXP` field on `users` is a denormalised running total for fast display. It can be recalculated from `lesson_history` if data integrity is in question.
