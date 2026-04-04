> **AI Source Prompt:** Draft the Home Screen feature spec. This is the primary interface for accessing learning. It contains a Goal Card, Continue carousel, Recommended for You, Trending Now, and Browse by Topic. Content is driven by the user's goal, onboarding answers, and open banking data. Reference the App Functionality doc for section order and card designs.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Home Screen

## 1. Goal and Context

**Product Layer:** Learn (Lesson) -- primary entry point
**Target Persona:** All five personas
**Core Objective:** Serve as the single starting point for all learning activity. The Home screen must answer three questions instantly: "What's my goal?", "Where did I leave off?", and "What should I learn next?". Every section is goal-driven -- content feels personally curated, not like a generic catalogue.

## 2. User Journey

* **Entry:** User opens the app (returning or post-onboarding). Home tab is the default landing screen.
* **Sections (top to bottom, fixed order):**

### 2.1 Goal Card

Sits at the very top. Shows the user's financial goal, savings progress bar (if applicable), amount saved vs target, and percentage complete. Includes an Edit Goal button and a + button to add additional goals in future. When a user changes their goal in their Profile, the card updates immediately.

### 2.2 Continue

Programmes the user has started but not finished. Horizontal carousel with a "See All" link. Each card shows: programme name, topic, lesson progress dots (complete / in progress / not started), and a "Next up" prompt showing the next lesson. Dark card treatment distinguishes these from discovery content. Only appears when the user has at least one in-progress programme.

### 2.3 Recommended for You

Programmes suggested based on the user's selected goal, onboarding answers, and open banking data. Vertical programme cards showing: programme emoji, name, hook (subtitle), lesson count, and estimated time. Programmes related to the user's goal carry a visible goal badge. No progress indicators -- these cards are for discovery, not continuation. "See All" link to view all recommendations. Ranking logic defined in `requirements/features/programme-recommendations.md`.

### 2.4 Trending Now

Horizontal carousel of programmes tied to current news and events. Typically sit under the Economics topic and are rotated regularly. Examples: tariff impacts, Bank of England rate decisions, student loan policy changes. The carousel format encourages browsing without taking up too much vertical space.

### 2.5 Browse by Topic

Tappable topic pills at the bottom, each with an emoji. Tapping a topic opens a Topic View overlay showing overall topic progress (percentage and lesson count) and all programmes within that topic. Programme cards within the Topic View also display the goal badge where applicable.

* **Exit:** User taps a programme card (enters programme view) or navigates to another tab.

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography, word limits, Lottie constraints |
| Personas | `knowledge/personas.md` | Persona profiles drive recommendation personalisation |
| Programme Recommendations | `requirements/features/programme-recommendations.md` | Ranking logic for Recommended for You |
| Goals System | `requirements/features/goals-system.md` | Goal card behaviour, badge logic |
| Learning Journey | `requirements/features/learning-journey.md` | Programme/lesson hierarchy |

**Prohibitions:** NEVER use the `$` symbol, red alert text, complex background gradients, or brand logos.

## 4. System Architecture

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `users` | READ | `goal`, `topicsOfInterest`, `experienceLevel`, `openBankingConnected` |
| `goals` | READ | `goalId`, `name`, `programmeIds` |
| `programmes` | READ | `programmeId`, `goalId`, `name`, `description`, `lessonCount`, `estimatedTime`, `difficulty`, `tags`, `topic`, `emoji`, `hook` |
| `core_lessons` / `user_lessons` | READ | `lessonId`, `programmeId`, `lessonName` |
| `lesson_history` | READ | `lessonId`, `userId`, `completedAt` (to compute progress) |

### Involved AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| Telemetry Agent | Tracks which sections users interact with (Continue vs Recommended vs Trending vs Browse), programme card tap-through rates | Section interaction events |

## 5. Compliance Constraints

* Recommended programmes are educational pathway suggestions, not financial product recommendations. Use "Start here" or "Suggested for your goal", never "We recommend this product".
* Trending Now content must be educational commentary on current events, not investment advice or market predictions.
* A disclaimer is not required on the Home screen itself (it appears at the lesson/ATMI level).

## 6. Failure States

* **Data Failure:** If Firestore reads fail, show skeleton loading states with retry. Never show error codes.
* **Empty Continue:** If no in-progress programmes, hide the Continue section entirely (do not show an empty state).
* **Empty Recommendations:** If the goals/programmes collections are not yet populated, show a "Content coming soon" card with the user's goal name.
* **No Trending Content:** If no trending programmes exist, hide the Trending Now section.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* The Home screen layout is fixed -- sections always appear in the same order. Only Continue and Trending Now can be hidden (when empty).
* The goal badge appears on programme cards wherever they are displayed -- Recommended, Trending, Browse by Topic, and Topic View. It updates immediately when the user changes their goal.
* Topics list: Property, Saving & Budgeting, Investing, Debt & Credit, Pensions, Tax & Admin, Protection, Economics.
