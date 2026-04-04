# Mulo AI: Vision and Product Architecture

## Vision & Mission

* **Vision**: A world where everyone understands how money works. Where financial decisions are simple, transparent, and fair, and no one is left behind because they were never taught.
* **Mission**: To help millions of people in the UK make better financial decisions through simple, personalised education.
* **Core Belief**: People are not bad with money. They were never taught. Mulo exists to change that.

## The Problem

* Financial services today are built to sell products, maximise profit, and benefit from confusion. This leads to poor decisions, wealth gaps, and stress.
* **Origin Story**: The founder was penalised by a government Lifetime ISA scheme he was encouraged to use; this personal friction drives the mission.

## Product Architecture (The Three-Layer Model)

The product operates on a strictly sequential user experience: **See -> Learn -> Act**. A user must pass through Layer 2 (Learn) before arriving at Layer 3 (Act) for any topic.

1. **LAYER 1: SEE** -- Open Banking financial overview (savings, debt, income, mortgage, pension, spending). Day 2 feature requiring AISP integration (TrueLayer/Finexer). Users see derived signals, never raw transaction data.
2. **LAYER 2: LEARN** -- Goal-driven micro-lessons delivered in two A/B-tested formats:
   - **Format A (v1_swipe):** 8-11 screen linear flow for rapid swiping.
   - **Format B (v2_interactive):** 5-question drill-down with feedback banners and nested Learn More lightboxes.
3. **LAYER 3: ACT** -- Compare products and switch providers based on education-informed decisions. Mulo earns referral commissions on these switches.

## App Structure

The app is built in FlutterFlow and organised into three main tabs:

### Home (Default Tab)

The primary entry point. Contains (in fixed order):

* **Goal Card** -- User's financial goal with savings progress (if applicable)
* **Continue** -- In-progress programmes as a horizontal carousel
* **Recommended for You** -- Goal-driven programme recommendations (vertical cards)
* **Trending Now** -- Economics programmes tied to current news (horizontal carousel, Day 2)
* **Browse by Topic** -- Tappable topic pills (Property, Saving & Budgeting, Investing, Debt & Credit, Pensions, Tax & Admin, Protection, Economics)

See `requirements/features/home-screen.md`.

### Growth

The progress and stats hub. Contains:

* **Goal Reminder** -- Compact goal card as a north star
* **Learning Streak** -- Weekly day tracker with streak counter
* **Strongest Areas** -- Programmes scored 4/5+ average
* **Worth Revisiting** -- Lessons scored 2/5 or below (positive framing)
* **Topic Coverage** -- All topics with percentage completion
* **This Week** -- Programmes started, lessons completed, questions answered, average score, time spent

See `requirements/features/growth-tab.md`.

### Profile

User settings that drive personalisation. All onboarding answers are editable here:

* **About You** -- Name, age
* **Learning Preferences** -- Goal, experience level, learning difficulty, learning pace, topics of interest
* **Connections & Privacy** -- Open Banking toggle, notification toggle
* **Data Trust** -- Transparency statement
* **Account Actions** -- Export data, delete account (GDPR)

See `requirements/features/profile-tab.md`.

## Content Hierarchy

```
Topic (8 fixed categories)
  └── Programme (ordered sequence of lessons under a topic)
       └── Lesson (single learning unit; stored as both v1_swipe and v2_interactive variants -- app or experiments choose which to play)
            └── Question/Screen (5 questions in v2, 8-11 screens in v1)
```

* **Topics** -- The 8 core areas of financial education. Each topic contains multiple programmes.
* **Programmes** -- A curated sequence of lessons. Hand-crafted (`core_lessons`) or AI-generated (`user_lessons`). Each programme belongs to one topic and may be tagged to one or more goals.
* **Lessons** -- Individual learning units. One of two formats (A/B tested). See `requirements/features/lesson-format-v2.md` and `functions/docs/lesson_guidelines.md`.
* **Questions/Screens** -- The atomic content unit. In V2, each question has a feedback layer and an optional Learn More drill-down.

## Goals System

Every user selects a financial goal during onboarding. The goal drives:

* Which programmes appear in Recommended for You
* Goal badges on relevant programme cards
* Goal Card visibility on Home and Growth

Available goals: Buy my first home, Build an emergency fund, Improve my credit score, Clear my debt, Build wealth, Retire comfortably, Understand my finances, Protect my finances.

See `requirements/features/goals-system.md`.

## Onboarding

8-screen flow capturing: Name, Age, Goal, Experience Level, Learning Difficulty, Learning Pace, Topics of Interest, Open Banking opt-in.

See `requirements/features/user-onboarding.md` and `knowledge/onboarding-routing.md`.

## Engagement Systems

### XP & Rewards

* 20 XP per correct answer, minimal XP for incorrect
* +50 XP bonus for perfect lesson score (5/5)
* See `requirements/features/xp-rewards.md`

### Notifications & Nudges

* 6 nudge types: streak reminder, continue prompt, new content, weekly recap, milestone celebration, worth revisiting
* Max 1 push notification per day
* See `requirements/features/notifications-nudges.md`

## AI Pipeline

Mulo operates a 9-agent pipeline powered by Gemini AI. The canonical architecture is defined in `functions/docs/agent_architecture.md`.

**Agents:**

* **Orchestrator Agent** -- Coordinates the pipeline
* **Creator Agent** (Maker) -- Generates lesson content as structured JSON
* **Compliance Agent** (Checker) -- FCA Consumer Duty validation
* **Design Agent** -- Lottie animation briefs (v1_swipe only)
* **Engagement Agent** -- Gamification and hook elements
* **Tone & Readability Agent** -- UK English, reading age, word limits
* **Visual Learning Agent** -- Visual asset selection
* **Curriculum & Learning Journey Agent** -- Programme sequencing
* **Government Tools & Eligibility Agent** -- Links to approved external tools

The core safety mechanism is the **Maker-Checker loop**: Creator drafts -> Compliance validates -> max 3 attempts -> PASS writes to Firestore with `compliance_audit` field.

## Day 1 vs Day 2 Isolation

| Feature | Day 1 (MVP) | Day 2 |
|---------|-------------|-------|
| Layer 2 (Learn) | Core lesson delivery, both formats | Advanced personalisation |
| Open Banking (Layer 1) | Not connected | AISP integration, derived signals |
| Apply to My Money | Post-lesson card with constants | Per-question embedded in Learn More with real data |
| Trending Content | Manual curation | AI-generated from news |
| Prizes/Competitions | XP accumulation only | Leaderboards, rewards |

## Compliance

All content is subject to FCA Consumer Duty constraints. See `knowledge/fca-regulations.md`. Key rules:

* Never provide regulated financial advice
* Never recommend specific products or providers
* Never generate financial projections or AI-calculated numbers
* All educational content includes appropriate disclaimers