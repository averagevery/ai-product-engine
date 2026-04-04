# Mulo AI: Onboarding & Recommendation Routing (Phase 1.5 / Day 2)

**Status:** The onboarding questions are Day 1 (captured in `requirements/features/user-onboarding.md`). The advanced routing logic described below is Phase 1.5 / Day 2 -- the MVP uses simpler goal-based recommendations defined in `requirements/features/programme-recommendations.md`.

## The 8-Screen Onboarding Flow

Full onboarding spec is in `requirements/features/user-onboarding.md`. The screens that capture routing data are:

| Screen | Question | Field Saved | Routing Impact |
|--------|----------|-------------|---------------|
| 3 | What's your main financial goal right now? | `goal` | Determines the entire Home screen layout and recommended programmes |
| 4 | How would you describe your financial knowledge? | `experienceLevel` | Affects lesson difficulty recommendations and content depth |
| 5 | How do you like to learn? | `learningDifficulty` | Controls Beginner vs Intermediate lesson ratio |
| 7 | What interests you most? (multi-select) | `topicsOfInterest` | Broadens recommendations beyond goal-driven content |

## Goal Options and Routing

| Goal | Primary Routing | Example Programmes |
|------|----------------|-------------------|
| Buy my first home | Property, Saving & Budgeting | First Home Essentials, Saving for a Deposit, Mortgage Basics |
| Build an emergency fund | Saving & Budgeting | Emergency Fund Foundations, Budgeting Basics |
| Improve my credit score | Debt & Credit | Understanding Credit, Credit Score Builders |
| Clear my debt | Debt & Credit | Debt Management, Borrowing Wisely |
| Build wealth | Investing | Investing Basics, ISA Strategy |
| Retire comfortably | Pensions | Pension Essentials, Retirement Planning |
| Understand my finances | All (broad) | Money Basics, Budgeting, Saving |
| Protect my finances | Protection | Insurance Essentials, Protection Planning |

## Experience Level Routing

| Level | Lesson Difficulty Bias |
|-------|----------------------|
| Complete beginner | Surface Beginner lessons first; foundational programmes prioritised |
| Some knowledge | Mix of Beginner and Intermediate |
| Fairly confident | Intermediate first; advanced modules available |
| Pretty savvy | Advanced modules surfaced; skip foundational content in recommendations |

## Day 2 Advanced Routing (Phase 1.5)

When Open Banking is connected, financial signals augment the onboarding data:

- User with high credit card utilisation + goal "Improve my credit score" -> boost debt-focused programmes
- User with no pension contributions detected + goal "Retire comfortably" -> prioritise auto-enrolment awareness
- User with £20k+ savings + goal "Build wealth" -> surface investing programmes above basic saving

The recommendation engine defined in `requirements/features/programme-recommendations.md` describes the scoring algorithm. Day 2 adds Open Banking signal weights to the existing difficulty/tag/progress scores.

## Example Routing Output

User selects: Goal = Buying first home, Experience = Some knowledge, Difficulty = Mix of both, Topics = Property + Saving & Budgeting.

**Home screen shows:**

1. First Home Essentials (goal badge)
2. Saving for a Deposit (goal badge)
3. Mortgage Basics (goal badge)
4. Credit Scores & Mortgages (goal badge)
5. Budgeting Basics (topic match, no goal badge)
