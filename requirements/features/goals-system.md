> **AI Source Prompt:** Draft the Goals System feature spec. Every user sets a financial goal during onboarding. The goal is their north star -- it drives recommended content, surfaces goal badges on programme cards, and is always visible on the Home screen. Users can change their goal at any time from their Profile.
> **Generated:** 2026-04-03
> **Rule Used:** create-feature.mdc

# Goals System

## 1. Goal and Context

**Product Layer:** ALL -- goals influence every surface in the app
**Target Persona:** All five personas
**Core Objective:** Give every user a clear financial north star that shapes their entire learning experience. Without a goal, content feels generic. With a goal, every recommendation, badge, and progress indicator feels personally relevant.

## 2. User Journey

* **Entry:** Goal is set during onboarding (screen 3). Always visible on the Home screen Goal Card.
* **How Goals Work:**
  - The goal is always visible at the top of the Home screen as a goal card showing the goal name, savings progress (if applicable), and percentage.
  - The goal determines which programmes appear in the Recommended for You section.
  - The goal is shown in compact form on the Growth tab as a constant reminder.
  - Users can change their goal at any time via their Profile, which immediately updates recommended content.

### Goal Badge

Programmes related to the user's selected goal carry a visible goal badge on their programme card. The badge appears wherever programme cards are displayed: Recommended for You, Trending Now, Browse by Topic, and Topic View. All programmes remain accessible to every user regardless of their goal, but the badge provides a clear visual signal of relevance. When a user changes their goal, badges update immediately across the app.

### Available Goals

* Buy my first home
* Build an emergency fund
* Improve my credit score
* Clear my debt
* Build wealth
* Retire comfortably
* Understand my finances
* Protect my finances

This list may expand as new content is developed.

* **Exit:** Goal data persists in the user's profile and influences all downstream features.

## 3. Context Documents and Technical Boundaries

| Document | Path | Relevance |
|----------|------|-----------|
| User Onboarding | `requirements/features/user-onboarding.md` | Goal is captured during onboarding |
| Programme Recommendations | `requirements/features/programme-recommendations.md` | Goal drives recommendation ranking |
| Learning Journey | `requirements/features/learning-journey.md` | Goal -> Programme -> Lesson hierarchy |
| Onboarding Routing | `knowledge/onboarding-routing.md` | Goal routing logic |

## 4. System Architecture

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `goals` | READ | `goalId`, `name`, `description`, `programmeIds` (array of programme references), `emoji` |
| `users` | READ/WRITE | `goal` (string matching a `goalId`) |
| `programmes` | READ | `programmeId`, `goalId`, `tags` (for badge matching) |

## 5. Compliance Constraints

* Goals are learning goals, not financial targets. The goal "Build wealth" means "learn about wealth building", not "we will help you build wealth".
* Goal card savings progress (if shown) must use user-input values or Open Banking derived signals -- never AI-generated financial projections.

## 6. Failure States

* **Missing Goal:** If a user somehow has no goal set (data corruption), prompt them to select one before showing the Home screen.
* **Empty Goal Programmes:** If a goal has zero published programmes, show "Content for this goal is coming soon" with an option to explore other goals.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* The `goals` collection needs seeding before the app launches. Each goal document should contain a name, description, emoji, and an ordered list of programme references.
* Goal savings progress tracking is a Day 2 feature tied to Open Banking integration. For Day 1, the goal card shows the goal name and a static illustration.
