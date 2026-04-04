**mulo**

**App Functionality Requirements**

Last updated: March 2026  |  Version 1.0

# **Purpose of this Document**

This document defines how the Mulo app works at a functional level. It covers the app structure, user experience, learning mechanics, personalisation, and engagement systems. It is intended for the founding team, developers, and designers to use as a shared reference.

For the detailed lesson format, question structure, learn more screens, and content production process, see the companion document: Mulo Lesson Format — Requirements Document.

# **What is Mulo**

Mulo is a personal finance education app that teaches users about money through short, question-based lessons. It combines gamified learning (Duolingo-style), spending insights (via open banking), and goal-driven personalisation into a single experience.

Mulo never sells its own financial products. Revenue comes from referral commissions to trusted providers and premium subscriptions.

## **Core Principles**

* Education, not advice — every piece of content teaches, never recommends specific products

* Goal-driven — the user's financial goal shapes everything they see

* Respect the user's time — lessons are 2 minutes, everything optional is clearly optional

* Confidence through doing — questions first, explanation after, so users discover what they know

* UK-focused — all content uses £, UK schemes, UK rules, and UK-relevant examples

# **Core Learning Mechanics**

All learning in Mulo is question-based. Users answer multiple-choice questions and receive immediate feedback with the option to learn more. This approach delivers high engagement, clear progress tracking, and confidence-building through correct answers.

## **Learning Hierarchy**

Content is organised into four levels:

1. **Topic:** The broadest category (e.g. Property, Investing, Debt & Credit). Topics group related programmes together and provide the high-level progress view.

2. **Programme:** A focused learning journey within a topic (e.g. Understanding Mortgages). Each programme contains exactly 5 lessons and takes approximately 10 minutes to complete.

3. **Lesson:** A 2-minute session of 5 multiple-choice questions on a specific subject (e.g. Fixed vs Variable). Each lesson sits within a programme.

4. **Question:** A single multiple-choice question with 4 options, feedback, and an optional learn more drill-down. 5 questions make up each lesson.

## **Lesson Flow**

The user flow through a lesson is: Question 1 → Feedback → (optional Learn More) → Question 2 → ... → Question 5 → Lesson Complete. After each question, users see whether they were correct or incorrect, a short feedback message, and the choice to learn more or move on. The learn more section is the core teaching experience — it contains a hero card, quick summary, real-life story carousel, deep-dive cards, and takeaways. Full details are in the Lesson Format Requirements Document.

## **Lesson Tagging**

Every programme and lesson is tagged with metadata that powers the recommendation engine. Tags connect content to the user's profile, goal, and financial data. Each lesson is tagged with:

* Topic (e.g. Property)

* Programme (e.g. Understanding Mortgages)

* Related learning areas (cross-topic connections)

* Related goal (e.g. Buy my first home)

* Difficulty level (Beginner or Intermediate)

* Open banking signals (which financial data points make this lesson relevant)

* Onboarding triggers (which user profile answers make this lesson relevant)

## **Goal Badge**

Programmes that are related to the user's selected goal carry a visible goal badge on their programme card. This badge appears wherever programme cards are displayed — in Recommended for You, Trending Now, Browse by Topic, and Topic View. All programmes remain accessible to every user regardless of their goal, but the badge provides a clear visual signal of which programmes are directly relevant to their north star. This helps users stay focused without restricting their freedom to explore.

When a user changes their goal in their Profile, the badges update immediately across the app to reflect the new goal.

## **Topics Covered**

The following topics form the content structure. Each contains multiple programmes, which will expand over time:

* Property

* Saving & Budgeting

* Investing

* Debt & Credit

* Pensions

* Tax & Admin

* Protection

* Economics (used primarily for Trending Now content)

Trending Now programmes sit primarily under Economics and are tied to current news stories such as Bank of England rate changes, tariffs, oil prices, or student loan policy updates. These are created and rotated to keep the app feeling current and relevant.

# **XP & Rewards System**

Mulo uses an XP (experience points) system to reward learning activity and encourage consistency. XP is earned by answering questions, and accumulates over time as a visible indicator of the user's overall engagement.

## **How XP is Earned**

XP is awarded for answering questions, with correct answers earning more than incorrect ones. Bonus XP is awarded for perfect scores (5/5) on a lesson. The exact point values are defined in the Lesson Format Requirements Document (currently 20 XP per correct answer, \+50 bonus for a perfect lesson).

## **Principles**

* XP should always feel rewarding, never punitive — incorrect answers still earn some XP to encourage participation

* The system may be refined over time to weight XP toward suggested lessons, encouraging users to follow the recommended learning path rather than cherry-picking

* XP should be visible on the lesson complete screen and potentially on the Growth tab as a cumulative total

* Streak bonuses (completing at least one lesson per day) may carry an XP multiplier in future iterations

## **Future: Prizes & Competitions**

Users with the most XP may be eligible for prizes or rewards in future. The mechanics of this are yet to be decided, but the XP system is designed to support leaderboard-style features, seasonal competitions, or milestone rewards when the time comes.

# **Goals**

Every user is required to set a financial goal during onboarding. This goal is their north star — it gives the learning meaning and drives the recommended content. Without a goal, the learning experience becomes generic and less relevant.

## **How Goals Work**

* The goal is always visible at the top of the Home screen as a goal card showing the goal name, savings progress (if applicable), and percentage

* The goal determines which programmes appear in the Recommended for You section

* The goal is shown in compact form on the Growth tab as a constant reminder

* Users can change their goal at any time via their Profile, which immediately updates the recommended content

## **Available Goals**

* Buy my first home

* Build an emergency fund

* Improve my credit score

* Clear my debt

* Build wealth

* Retire comfortably

* Understand my finances

* Protect my finances

This list may expand as new content is developed.

# **App Structure**

The MVP app has three main tabs, plus an Explore tab for future expansion:

1. **Home:** Where users access the learning — continue where they left off, recommended programmes, trending content, and browse by topic.

2. **Growth:** Where users track their progress — goal reminder, learning streak, strongest areas, areas to revisit, topic coverage, and weekly stats.

3. **Profile:** Where users manage their personal data, onboarding answers, open banking connections, and notification preferences. Changes here directly impact the recommended learning.

4. **Explore:** Reserved for future expansion — a dedicated search and browse experience across all content.

# **Home Screen**

The Home screen is the primary interface for accessing learning. It is structured into the following sections, in order from top to bottom:

## **Goal Card**

Sits at the very top. Shows the user's financial goal, savings progress bar (if applicable), amount saved vs target, and percentage complete. Includes an Edit Goal button and a \+ button to add additional goals in future.

## **Continue**

Shows programmes the user has started but not finished, displayed as a horizontal carousel with a See All link. Each card shows the programme name, topic, lesson progress dots (indicating which lessons are complete, in progress, or not started), and a 'Next up' prompt showing the next lesson to tackle. The dark card treatment visually distinguishes these from discovery content — the message is 'pick up where you left off' rather than 'explore something new'. This section only appears when the user has at least one in-progress programme.

## **Recommended for You**

Programmes suggested based on the user's selected goal, onboarding answers, and open banking data. Displayed as vertical programme cards showing the programme emoji, name, hook (subtitle), lesson count, and estimated time. Programmes related to the user's goal carry a visible goal badge. These cards do not show progress indicators — they are for discovery, not continuation. A See All link allows the user to view all recommendations.

## **Trending Now**

A horizontal carousel of programmes tied to current news and events. These typically sit under the Economics topic and are rotated regularly. Examples include programmes on tariff impacts, Bank of England rate decisions, or student loan policy changes. The carousel format encourages browsing without taking up too much vertical space.

## **Browse by Topic**

Tappable topic pills at the bottom of the Home screen, each with an emoji. Tapping a topic opens a Topic View overlay showing overall topic progress (percentage and lesson count), and all programmes within that topic. Programme cards within the Topic View also display the goal badge where applicable, so users can see at a glance which programmes align with their goal even when browsing freely.

# **Growth Tab**

The Growth tab is the user's progress and stats hub. Its purpose is to encourage continued learning, help users understand their strengths and gaps, and provide a sense of achievement. Data from this tab may also be used for nudges and marketing content.

The Growth tab contains the following sections, in order:

## **Goal Reminder**

A compact card showing the user's financial goal with savings progress. Smaller than the Home screen version but always present as a north star reminder.

## **Learning Streak**

A weekly view (Mon–Sun) showing which days the user completed at least one lesson. A streak counter shows the current consecutive day count. The streak resets if the user misses a day. Streaks are designed to encourage daily engagement without being punitive — the tone is encouraging ('1 lesson a day keeps the gaps away') rather than guilt-inducing.

## **Strongest Areas**

Horizontal scroll cards highlighting programmes where the user has scored an average of 4/5 or above. Each card shows the programme emoji, name, and average score. This section reinforces what the user knows well and builds confidence.

## **Worth Revisiting**

Cards showing specific lessons where the user scored 2/5 or below. Each card shows the lesson title, programme name, score, and a Review prompt. Tapping takes the user back into the lesson. The framing is always positive — 'worth revisiting' rather than 'you failed'. This section only appears when there are low-scoring completed lessons.

## **Topic Coverage**

A breakdown of all topics (Property, Saving & Budgeting, Debt & Credit, Investing) showing percentage completion, lesson counts, and average scores where available. Colour-coded progress bars give an instant visual of how much the user has covered across all areas. This is the broadest progress view in the app.

## **This Week (Weekly Stats)**

A summary of the user's activity in the current week, including: programmes started, lessons completed, questions answered, average score, and time spent learning. Resets every Monday. Provides a regular sense of momentum and a benchmark for the user's learning pace.

# **Profile**

The Profile tab contains all user data that drives the personalised learning experience. Every field is editable at any time, and changes take immediate effect on the recommended content, lesson difficulty, and personalised insights.

## **About You**

* Name

* Age

## **Learning Preferences**

These fields are initially set during onboarding and can be changed at any time:

* **Financial goal:** The user's primary goal (see Goals section). Drives recommended content.

* **Experience level:** Complete beginner / Some knowledge / Fairly confident / Pretty savvy. Affects lesson difficulty recommendations and content depth.

* **Learning difficulty:** Beginner friendly / Challenge me / Mix of both. Controls whether the app primarily serves Beginner or Intermediate lessons.

* **Learning pace:** 1 lesson per week / 2–3 lessons per week / Daily / At my own pace. Used for nudge frequency and streak expectations.

* **Topics of interest:** Multi-select from the available topics. Determines which content surfaces in Recommended for You beyond the goal-driven suggestions.

## **Connections & Privacy**

* **Open banking:** Toggle to connect/disconnect open banking. When connected, financial data is used to personalise the Apply to My Money sections in lessons and influence programme recommendations (see Open Banking section).

* **Learning reminders:** Toggle to enable/disable push notifications and nudges.

## **Data Trust**

The Profile screen includes a visible data trust statement: 'We use your profile to personalise lessons — not to sell products or give financial advice. You can change or delete your data at any time.' This reinforces Mulo's position as an education platform and supports FCA compliance.

## **Account Actions**

* Export my data — allows users to download all data held about them

* Delete my account — permanently removes the user's account and all associated data

# **Onboarding Flow**

New users complete a short onboarding flow before reaching the Home screen. The purpose is to gather enough information to personalise the experience from the first session. The flow should feel quick and conversational — not like a form.

## **Onboarding Steps**

The onboarding consists of the following screens, each collecting one piece of information:

**Screen 1 — Name:** 'What should we call you?' Free text input. Used for personalised greetings throughout the app.

**Screen 2 — Age:** 'How old are you?' Free text or age range selector. Used to tailor content relevance (e.g. pensions content is less prominent for younger users, student loan content is less relevant for older users).

**Screen 3 — Goal:** 'What's your main financial goal right now?' Single select from the available goals. This is the most important onboarding question — it determines the entire Home screen layout and recommended programmes.

**Screen 4 — Experience:** 'How would you describe your financial knowledge?' Single select: Complete beginner / Some knowledge / Fairly confident / Pretty savvy. Affects lesson difficulty and content depth.

**Screen 5 — Difficulty:** 'How do you like to learn?' Single select: Beginner friendly / Challenge me / Mix of both. Determines the ratio of Beginner to Intermediate lessons surfaced.

**Screen 6 — Pace:** 'How often do you want to learn?' Single select: 1 lesson per week / 2–3 per week / Daily / At my own pace. Sets nudge frequency and streak expectations.

**Screen 7 — Topics:** 'What interests you most?' Multi-select from available topics. Broadens recommendations beyond the goal-driven content.

**Screen 8 — Open Banking (optional):** 'Want personalised insights based on your spending?' Explains the value proposition of open banking and gives the user the choice to connect or skip. Not mandatory — users can always connect later from their Profile.

All answers are stored in the user's Profile and can be changed at any time. The onboarding flow should be completable in under 60 seconds.

# **Open Banking**

Mulo uses open banking data to personalise the learning experience. When connected, financial data feeds into lesson personalisation (Apply to My Money sections) and influences which programmes are recommended. Mulo operates as an AISP (Account Information Service Provider) under PSD2 regulations.

## **Core Design Principle**

Raw transaction data is never stored. Mulo only stores derived signals — aggregated, anonymised metrics calculated from the raw data. For example, Mulo stores 'average monthly spending: £2,400' but never stores individual transactions. This minimises data risk, simplifies GDPR compliance, and aligns with the FCA Digital Sandbox requirements.

## **How Open Banking Data is Used**

1. **Programme recommendations:** Financial signals (e.g. high credit utilisation, no pension contributions, low savings rate) trigger recommendations for relevant programmes. A user with high credit card utilisation might be recommended the Understanding Credit programme.

2. **Apply to My Money personalisation:** The 3 financial numbers shown in each lesson's Apply to My Money section are populated from real user data when available, making the insights genuinely personal rather than hypothetical.

3. **Goal tracking:** For savings-related goals, open banking data can show actual savings balance progress toward the target, making the goal card dynamic and real.

## **Data Categories**

Derived signals are organised into categories including: income patterns, spending breakdown, savings rate, debt levels, credit utilisation, subscription costs, housing costs, investment activity, and pension contributions. The full data catalogue (111 data points across 11 categories) is maintained separately.

## **User Control**

* Users can connect or disconnect open banking at any time from their Profile

* When disconnected, Apply to My Money sections use user-input values or sensible defaults instead

* Data consent is re-confirmed every 90 days in line with PSD2 requirements

* Users can request deletion of all derived signals at any time

# **Notifications & Nudge Strategy**

Notifications are used to encourage learning consistency and re-engage users who have dropped off. The tone should always be warm, encouraging, and never guilt-inducing. Users can disable all notifications from their Profile.

## **Nudge Types**

* **Streak reminder:** Sent in the evening if the user hasn't completed a lesson that day and has an active streak. Example: 'You're on a 4-day streak — keep it alive with a 2-minute lesson.'

* **Continue prompt:** Sent when a user has an in-progress programme they haven't returned to in 2+ days. Example: 'You were halfway through Understanding Mortgages — pick up where you left off.'

* **New content:** Sent when a new Trending Now programme is published that's relevant to the user's goal or interests. Example: 'New: What the Bank of England rate change means for your mortgage.'

* **Weekly recap:** Sent on Monday mornings summarising the previous week's activity. Example: 'Last week you completed 3 lessons and answered 15 questions. Here's what's next.'

* **Milestone celebration:** Sent when the user hits a meaningful milestone. Example: 'You've completed 10 lessons — your Property knowledge is growing fast.'

* **Worth revisiting:** Sent periodically when a user has low-scoring lessons they haven't reviewed. Example: 'A quick review of What Lenders Actually Check could sharpen your score — 2 minutes.'

## **Frequency Rules**

* Maximum 1 push notification per day

* Streak reminders take priority over other nudge types

* If the user has set their pace to 'At my own pace', reduce nudge frequency to weekly recap only

* No notifications in the first 24 hours after signup (let the user explore organically)

* If a user hasn't opened the app in 7+ days, send a re-engagement nudge, then pause for 7 days before trying again

* After 3 consecutive ignored notifications, stop sending until the user returns organically

# **Analytics & Tracking**

In-lesson analytics events (question answered, learn more opened, carousel completed, lightbox interactions, action links clicked) are defined in the Lesson Format Requirements Document.

App-level analytics should additionally track:

* Tab navigation (which tabs are visited, in what order, time spent)

* Programme card taps (which programmes are opened from which section — Continue, Recommended, Trending, Browse)

* Topic View interactions (which topics are browsed, which programmes are accessed from within)

* Goal changes (what goal was changed from/to, and when)

* Profile edits (which fields are changed, and how often)

* Open banking connect/disconnect events

* Onboarding completion rate and drop-off points

* Notification tap-through rates by nudge type

* Streak length distribution and break points

# **Design Specifications**

Full brand colours, typography, screen constraints, and interactive element specifications are defined in the Lesson Format Requirements Document. Key references:

* **Background (dark):** \#0a0a1a

* **Background (light):** \#fafafa

* **Electric blue:** \#5753ff (primary brand / \#3733e5 variant)

* **Correct green:** \#34c759

* **Incorrect red:** \#ff6b6b

* **Text dark:** \#1a1a2e

* **Font:** DM Sans (all weights 400–900)

The app is designed mobile-first for iOS and Android. All screens should work within standard mobile viewport constraints. The prototype is built in FlutterFlow by the technical co-founder.

# **Companion Documents**

This document should be read alongside:

* **Mulo Lesson Format — Requirements Document:** Defines the detailed structure of every question, feedback screen, learn more page, and lesson complete screen. Includes content production process, quality checklist, and design specifications.

* **Mulo Curriculum Spreadsheet:** Lists all topics, programmes, lessons, hooks, difficulty levels, and goal tags across the full content library.

* **Open Banking Data Catalogue:** 111 data points across 11 categories, defining what derived signals are stored and how they map to lesson personalisation.