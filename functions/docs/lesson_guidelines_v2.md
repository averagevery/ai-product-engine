> **File Summary & Purpose:** This is the structural rulebook for the Creator Agent when generating `v2_interactive` lessons. It defines the 5-question drill-down format with feedback banners and nested Learn More lightboxes. It enforces strict mobile-first constraints to ensure all JSON outputs map perfectly to the FlutterFlow UI. For the original 8-11 screen sequential format, see `lesson_guidelines.md` (v1_swipe).

# Lesson Generation Guidelines: V2 Interactive (5-Question Drill-Down)

## 1. Lesson Goal & Tone (Hard Boundary)

* Create short, question-first lessons where users discover what they know before being taught.
* UK-centric examples, UK spelling, and £ only.
* Education-first, zero jargon, friendly and human (no lecturing, non-judgemental).
* Confidence through doing -- questions first, explanation after.
* Respect the user's time -- each lesson is completable in approximately 2 minutes. Everything optional is clearly optional.

## 2. Required Lesson Structure

Every v2_interactive lesson consists of **exactly 5 questions**. No exceptions.

**User flow:** Question 1 -> Feedback -> (optional Learn More) -> Question 2 -> ... -> Question 5 -> Lesson Complete.

Each question has three layers:

1. **Question Screen** -- a single mobile viewport, no scrolling.
2. **Feedback Banner** -- slides up from the bottom after the user confirms their answer.
3. **Learn More Page** -- the core teaching experience. The only screen that scrolls. Opened via the "Learn more" button on the feedback banner.

## 3. Content Hierarchy

Lessons sit within the following hierarchy:

* **Topic** (broadest category, e.g. Property, Investing, Debt & Credit)
* **Programme** (focused learning journey, exactly 5 lessons, ~10 minutes total)
* **Lesson** (2-minute session of 5 questions on a specific subject)
* **Question** (single multiple-choice question with feedback and optional Learn More)

## 4. Screen 1: The Question

The Creator Agent must output the following fields per question:

* `emoji` -- single emoji related to the question topic.
* `questionText` -- the question itself.
* `options` -- array of exactly 4 option strings.
* `correctIndex` -- integer 0-3 indicating the correct option.

**Hard rules:**

* The entire screen must fit on one mobile viewport -- no scrolling.
* Each question must challenge a common misconception, not test textbook knowledge.
* All 4 options must be plausible to someone who doesn't know the answer -- no joke answers.
* **Exactly one correct answer.** Only one option may be fully correct. Do not write two options that both look right (for example: two answers that both start with "False —" or "No —" to the same statement, or two variants of the same verdict). Prefer a **direct question** ("What is the best first step...?") over a true/false stem that forces multiple "false" wordings. Wrong options should be clearly weaker or factually wrong, not alternate good advice.
* The correct answer position (`correctIndex`) must vary across the 5 questions.

## 5. Screen 2: The Feedback Banner

The Creator Agent must output:

* `feedbackCorrect` -- affirm the user, then add one extra insight they might not know.
* `feedbackIncorrect` -- never condescending. Reframe the correct answer as empowering.

**Hard rules:**

* The feedback banner appears over the bottom of the question screen -- the question and options remain visible above it.
* Only the correct answer (green) and the user's answer (if wrong) remain visible.
* Two buttons: "Learn more" (dark) and "Next" (white).

## 6. Screen 3: Learn More Page

The Learn More page is the core teaching experience. It is the only scrollable surface. The Creator Agent must output the `learnMore` map with all required sub-fields.

**Fixed section order** (top to bottom): Hero -> Quick Summary -> Deep-Dive Cards -> Takeaways -> Apply to My Money -> Next Question Button.

### 6.1 Hero Card

* `hero.strapline` -- 3-5 words in a pill badge (e.g. "Let's understand why", "Here's the full picture").
* `hero.headline` -- 8-15 words. A clear statement, not a question. Conversational.

### 6.2 Quick Summary

* `quickSummary` -- exactly 2 sentences.
* Must include at least one specific number or £ amount.
* No jargon without immediate plain-English explanation.
* Explains the "what" -- the story below explains the "why" through narrative.

### 6.3 Deep-Dive Cards

Three tappable cards, each opening as a lightbox overlay (slides up, covers 88% of screen). Users choose what to explore.

**Card 1: Real World Example (`storyCarousel`)**

Array of exactly 5 story slide objects using a named UK character (Maya, Tom, Sarah, Jake, Priya, etc.).

Each slide: `{ emoji, title (2-3 words), text (1-2 sentences, max 30 words) }`.

Every slide must include a specific £ amount. Slides follow a strict narrative arc:

1. **Setup** -- introduce the person and their situation.
2. **Situation** -- what they're facing or the advice they received.
3. **Complication** -- what went wrong or what the reality turned out to be.
4. **Consequence** -- the financial impact in £ terms.
5. **Resolution** -- what they did and the lesson learned.

**Card 2: Breakdown (`breakdownCards`)**

Array of exactly 2 visual cards. Each card must use a **different** type:

* **`comparison`** -- side-by-side of two options. Fields: `leftLabel`, `leftItems` (3 strings), `rightLabel`, `rightItems` (3 strings). Use when contrasting two choices.
* **`highlight`** -- a big stat on a purple gradient background. Fields: `heroNumber` (e.g. "£600k"), `subtitle`, `detail`. Use for standout facts.
* **`timeline`** -- a 3-step numbered sequence. Fields: `steps` (3 objects: `{ step, description }`). Use for progressions or year-by-year scenarios.

Each card has a `caption` -- one sentence explaining the visual in plain English.

**Critical rule:** Breakdown cards must teach information NOT already covered in the story. Different angle, new information.

**Card 3: Trusted Tool (`actionLink`) -- OPTIONAL**

* `actionLink.label` -- the tool name.
* `actionLink.description` -- what the tool does (1-2 sentences).
* `actionLink.url` -- link to the tool.

Only include when there is a genuinely relevant government or trusted tool. Approved sources only: MoneyHelper, Gov.uk, ClearScore, Credit Karma, HMRC, Turn2us, NHS. Never link to specific product providers.

### 6.4 Takeaways

* `takeaways` -- array of exactly 3 actionable strings.
* Each is one sentence.
* Include specific numbers in at least 2 of the 3.
* Keep them actionable where possible.

### 6.5 Apply to My Money (Day 2 -- OPTIONAL for Day 1 MVP)

* `applyToMyMoney` -- this entire section is **optional** and should be bypassed for Day 1 MVP generations.
* When included: `headline` (must reference 2+ of the 3 input values), `inputLabels` (3 short labels, max 12 characters, topic-specific per question), `insights` (3 statements, first marked as primary).
* Input labels must vary per question -- not the same generic salary/savings/debt every time.
* Always ends with disclaimer: "Based on general UK guidelines. Not personalised financial advice."

## 7. Screen 4: Lesson Complete

The Creator Agent does not generate the Lesson Complete screen -- it is rendered by the app using the lesson's score data. For reference, the completion screen shows:

* Score-adaptive emoji and message (5 tiers: 100%, 80-99%, 60-79%, 40-59%, 0-39%).
* Animated score ring.
* XP earned (20 per correct answer, +50 bonus for 5/5 perfect score).
* Programme progress dots and next lesson card.

All messages must be encouraging -- even 0/5 should make the user feel good about learning.

## 8. Hard Mobile Writing Limits (Non-Negotiable)

| Element | Limit |
|---------|-------|
| Question text | <= 20 words |
| Option text | <= 10 words each |
| Feedback (correct) | <= 30 words |
| Feedback (incorrect) | <= 30 words |
| Hero strapline | 3-5 words |
| Hero headline | 8-15 words |
| Quick summary | Exactly 2 sentences |
| Story slide text | <= 30 words per slide |
| Story slide title | 2-3 words |
| Breakdown card caption | 1 sentence |
| Takeaways | 3 items, each 1 sentence |
| ATMI input labels | <= 12 characters each |

No bespoke Lottie animations in v2_interactive lessons. No scrolling on the question screen. The Learn More page is the only scrollable surface.

## 9. Content Brief Checklist

Before generating a v2_interactive lesson, the Creator Agent must verify:

1. What are the 5 learning objectives? (one per question)
2. What misconception does each question challenge?
3. What is the single correct answer, and why is each other option clearly wrong (not merely a second good answer)?
4. Who is the named UK character for each real-world example?
5. What are the 3 topic-specific numbers for each Apply to My Money section? (Day 2 only)
6. Is there a relevant government/trusted tool for each question?

## 10. Quality Checklist (Post-Generation Validation)

The Compliance Agent must verify all of the following before returning PASS:

* All 5 questions challenge misconceptions (not trivia).
* Each question has exactly one clearly correct option -- no ambiguous pairs sharing the same verdict.
* Correct answer position varies across questions.
* All options are plausible to a beginner.
* Feedback is under 30 words, never condescending.
* Quick summaries are exactly 2 sentences with specific numbers.
* Real-world examples use named UK characters with £ amounts.
* Story follows the 5-slide narrative arc (Setup -> Situation -> Complication -> Consequence -> Resolution).
* Breakdown cards teach NEW information not covered in the story.
* Each breakdown card uses a different visual type.
* Apply to My Money inputs are topic-specific per question (not repeated across questions).
* Apply to My Money headline references 2+ input values.
* First insight is marked as primary.
* Action links go to trusted non-commercial sources only.
* Takeaways are 3 actionable bullets with specific numbers.
* All content is UK-focused (£, UK schemes, UK rules).
* No jargon without immediate plain-English explanation.
* No regulated financial advice, product recommendations, or advisory language.
