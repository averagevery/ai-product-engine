**Mulo Lesson Format — Requirements Document**

**Purpose:** This document explains how every Mulo lesson and question works, in simple terms. It's designed so that anyone — content writers, designers, or developers — can understand the format and replicate it across all \~70 lessons.

**Last updated:** March 2026

---

**How a Lesson Works**

Every lesson follows the same structure. There are no exceptions.

A lesson belongs to a **programme** (e.g. "Buying Your First Home"). Each programme contains 5 lessons. Each lesson contains **5 questions**. Every question has the same format.

The user flow through a single lesson is:

Question 1 → Feedback → (optional) Learn More → Question 2 → ... → Question 5 → Lesson Complete

The user answers all 5 questions in order. After each answer, they see feedback and can choose to learn more or move on. After the final question, they see a completion screen showing their score and the next lesson in the programme.

---

**Screen 1: The Question**

**What the user sees:**

* Lesson title and progress bar at the top  
* An emoji related to the topic  
* The question text  
* 4 answer options  
* A "Confirm Answer" button at the bottom

**Rules:**

* The entire screen must fit on one mobile viewport — no scrolling  
* Each question should challenge a common misconception, not test textbook knowledge  
* All 4 options must be plausible to someone who doesn't know the answer — no joke answers  
* The correct answer position should vary across the 5 questions (don't always put it in the same slot)  
* Question text should be under 20 words  
* Option text should be under 10 words where possible

**How the user interacts:**

1. They tap an option (it highlights in purple)  
2. They tap "Confirm Answer"  
3. The feedback banner slides up from the bottom

---

**Screen 2: The Feedback Banner**

**What the user sees:**

* A banner at the bottom of the screen (green for correct, pink for incorrect)  
* A ✓ or ✕ icon with "Correct" or "Incorrect"  
* 1–2 sentences of feedback text  
* Two buttons: "Learn more" (dark) and "Next" (white)

**Rules:**

* Correct feedback: affirm the user, then add one extra insight they might not know. Max 30 words.  
* Incorrect feedback: never condescending. Reframe the correct answer as empowering — "you don't need X, here's what actually works." Max 30 words.  
* The feedback banner appears over the bottom of the question screen — the question and options remain visible above it  
* Only 2 of the 4 options are shown when feedback is visible: the correct answer (green) and the user's answer if wrong

**What happens next:**

* "Learn more" → opens the Learn More page  
* "Next" → advances to the next question (or completion screen after Q5)

---

**Screen 3: Learn More**

This is the core learning experience. It's where Mulo teaches the user, not just tests them. This is the only screen that scrolls.

The Learn More page has 6 sections in a fixed order. The layout from top to bottom is: Hero → Quick Summary → Deep-Dive Cards → Takeaways → Apply to My Money → Next Question Button.

**Header:** Back arrow (‹) on the left, lesson title centred, close button (✕) on the right. Progress bar below.

**3.1 Hero Card**

**What it is:** A purple card at the top with a strapline and headline.

**Purpose:** Frame the key learning point in one sentence.

**Rules:**

* Strapline: 3–5 words in a pill/badge (e.g. "Let's understand why", "Here's the full picture")  
* Headline: 8–15 words. A clear statement, not a question. Conversational. (e.g. "You can buy with a 5% deposit, but more is better")

**3.2 Quick Summary**

**What it is:** A short paragraph of plain text below the hero card.

**Purpose:** Ground the headline with specifics. Give the user enough context to understand the story that follows.

**Rules:**

* Exactly 2 sentences  
* Include at least one specific number or £ amount  
* No jargon without immediate plain-English explanation  
* Should explain the "what" — the story below explains the "why" through narrative

**Example:**

"Government-backed schemes let you get a mortgage with just 5% deposit on homes up to £600k. A bigger deposit means better interest rates—but waiting years to save one has its own costs."

**3.3 Deep-Dive Cards**

**What it is:** Three tappable cards below the quick summary. Each card shows an emoji, title, and subtitle. All three open as lightboxes (full-screen overlays that slide up from the bottom).

**Purpose:** Let users choose what they want to explore without forcing them through everything. Keeps the main page compact. Provides analytics on what content users actually care about.

**Default state:** All three cards are visible in their collapsed state (white background, emoji \+ title \+ subtitle \+ chevron). The page stays short — users scan the options and tap what interests them.

**The three cards are always:**

**Card 1: 🌍 Real World Example → opens as lightbox**

**Subtitle:** Uses the story intro text (e.g. "See how this played out for someone in a similar position.")

**Interaction:** Tapping the card opens a lightbox overlay that slides up from the bottom, covering up to 88% of the screen. The lightbox has a sticky header with the title and a ✕ close button. Tapping the dimmed background also closes it.

**Contains:** A 5-slide swipeable story carousel inside the lightbox.

**Carousel rules:**

* Always 5 slides  
* Uses a named UK character (Maya, Tom, Sarah, Jake, Priya, etc.)  
* Every slide must include a specific £ amount to make it tangible  
* Each slide has: an emoji, a 2–3 word title, and 1–2 sentences of text (max 30 words)  
* Slides follow a narrative arc:   
  1. **Setup** — introduce the person and their situation  
  2. **Situation** — what they're facing or the advice they received  
  3. **Complication** — what went wrong or what the reality turned out to be  
  4. **Consequence** — the financial impact in £ terms  
  5. **Resolution** — what they did and the lesson learned

**Carousel behaviour:**

* Back/Next buttons below the slides  
* Dot indicators showing current position  
* On the last slide, the Next button shows "Done ›"

**Card 2: 📊 Breakdown → opens as lightbox**

**Subtitle:** "Tap for detailed breakdown"

**Interaction:** Same lightbox behaviour as the Real World Example.

**Contains:** Exactly 2 visual cards. Each card uses one of three visual types:

**Comparison card** — side-by-side comparison of two options

* Two columns, each with a label and 3 bullet items  
* Use when contrasting two choices (e.g. "Buy now vs wait", "LISA vs Help to Buy ISA")

**Highlight card** — a big stat on a purple gradient background

* One hero number (e.g. "£600k", "30%", "£0")  
* A subtitle explaining what the number means  
* A detail line with extra context  
* Use for standout facts the user should remember

**Timeline card** — a 3-step numbered sequence

* Three numbered steps with short descriptions  
* Use for progressions or year-by-year scenarios

Each visual card also has a **caption** underneath — one sentence explaining the visual in plain English.

**Critical rule:** Breakdown cards must teach information NOT already covered in the story. If the story already explained a concept, the breakdown should cover a different angle.

**Card 3: 🔗 \[Tool Name\] → opens as lightbox**

**Subtitle:** "Tap for detailed breakdown"

**Interaction:** Same lightbox behaviour as the other two cards.

**Contains:**

* A description of what the tool does (1–2 sentences)  
* A purple button: "Go to \[source\] →"

**Rules:**

* This card is optional — only include it when there's a genuinely relevant government or trusted tool  
* Links should go to non-commercial, trusted sources: MoneyHelper, Gov.uk, ClearScore, Credit Karma, HMRC, Turn2us, NHS  
* Never link to specific product providers (that would make it an ad)  
* Only the button is the tap target, not the whole card

**Examples of action links by topic:**

* Deposits → MoneyHelper mortgage calculator  
* LISA → MoneyHelper LISA comparison  
* Credit score → ClearScore (free credit report)  
* Borrowing → MoneyHelper affordability calculator  
* Pensions → Gov.uk Pension Tracing Service  
* Benefits → Turn2us benefits calculator

**3.4 Takeaways**

**What it is:** 3 short bullet points with solid green circle checkmarks, always visible on the main page below the deep-dive cards.

**Purpose:** Quick reference of the key points. The user sees these without tapping anything — they're the "TL;DR" of the lesson.

**Rules:**

* Exactly 3 takeaways  
* Each is one sentence  
* Include specific numbers in at least 2 of the 3  
* Keep them actionable where possible  
* Green checkmarks are solid circles (\#34c759 background, white ✓)

**3.5 Apply to My Money**

**What it is:** A dark card (\#1a1a2e background) at the bottom of the page, below the takeaways. Tapping it opens a lightbox.

**Purpose:** This is Mulo's most differentiated feature — it connects the lesson to the user's real financial numbers. It sits at the bottom as the final, most personal piece of content. The dark styling visually separates it from the educational content above and signals "this is about YOU."

**Card appearance (collapsed on page):**

* Dark background (\#1a1a2e)  
* ✨ emoji, title "Apply to My Money", subtitle "Get AI powered insights based on your finances"  
* Chevron on the right

**Lightbox contains:**

* 3 financial number cards (dark background) showing the user's own numbers  
* A headline connecting those numbers to the lesson (must reference at least 2 of the 3 numbers)  
* 3 insight statements, each starting with a bold lead-in referencing a user number

**Rules:**

* The 3 input numbers must be specific to THIS question's topic — not the same generic salary/savings/debt every time  
* Input labels should be short (max 12 characters)  
* The first insight should be marked as "primary" and gets a green left border and subtle background tint for visual prominence  
* Always ends with the disclaimer: "Based on general UK guidelines. Not personalised financial advice."

**Example of good input variation across questions:**

* Q1 (deposit): savings, home price, 5% deposit amount  
* Q2 (LISA): savings, LISA annual limit, free bonus  
* Q3 (credit): debt, credit limit, utilisation %  
* Q4 (borrowing): salary, max borrowing, total budget  
* Q5 (costs): savings, buying costs, amount left for deposit

**3.6 Next Question Button**

**What it is:** A dark "Next Question" button that appears fixed at the bottom of the screen.

**Critical behaviour:** The button is **hidden by default** and only appears once the user has scrolled to the bottom of the page. This ensures users see all the content (summary, cards, takeaways, Apply to My Money) before they can advance.

**How it works:**

* A tiny invisible sentinel element sits at the very bottom of the page content (below the Apply to My Money card)  
* An IntersectionObserver watches this sentinel  
* When the sentinel enters the viewport (user has scrolled to the bottom), the button appears with a subtle slide-up animation  
* Once revealed, the button stays visible permanently — it does not hide again if the user scrolls back up  
* The button advances to the next question (or completion screen after Q5)

**Styling:**

* Fixed position at the bottom of the screen  
* Dark background (\#1a1a2e), white text  
* Gradient fade from transparent to page background above the button  
* Slide-up \+ fade-in animation on reveal (0.3s ease)

---

**Screen 4: Lesson Complete**

**What the user sees (all on one screen, no scrolling):**

* Dark background (\#0a0a1a)  
* Score-adaptive emoji and message (5 tiers from 0% to 100%)  
* Animated score ring showing their percentage  
* XP earned (20 per correct answer, \+50 bonus for perfect score)  
* Programme progress dots (showing which lesson they just completed)  
* Next lesson card with title, emoji, and estimated time  
* "Next Lesson →" primary button  
* "Retry lesson" secondary button

**Score messages:**

* 100%: 🎉 "Perfect score\!" / "You nailed every question."  
* 80–99%: 🔥 "Great job\!" / "Solid understanding."  
* 60–79%: 👏 "Nice work\!" / "Strong foundation."  
* 40–59%: 💪 "Good start\!" / "Learning what most don't."  
* 0–39%: 🌱 "Keep going\!" / "Being here puts you ahead."

**Rules:**

* Must fit on one mobile viewport — no scrolling  
* The score ring animates on load (fills up over \~1 second)  
* XP text has a gold shimmer animation  
* Programme progress and next lesson card fade in after a short delay  
* Every message is encouraging — even 0/5 should make the user feel good about learning

---

**Programme Structure**

Each programme contains exactly 5 lessons. The programme is shown on the completion screen so users see their progress and what's next.

**Programme data includes:**

* Programme title (e.g. "Buying Your First Home")  
* 5 lessons, each with: id, title, emoji

**Example:**

1. 🏠 First Home Essentials  
2. 🏦 Mortgage Types Explained  
3. 📋 The Buying Process  
4. 💸 Hidden Costs & Fees  
5. 🎯 Saving Smarter for a Home

---

**How to Replicate for a New Lesson**

Creating a new lesson means filling in the data structure below. The app renders whatever data it receives — no code changes needed.

**Step 1: Define the Programme**

If this is the first lesson in a new programme, define the programme (title \+ 5 lesson titles with emojis). If the programme already exists, skip this step.

**Step 2: Write the Content Brief**

Before writing content, answer these questions:

1. What are the 5 learning objectives? (one per question)  
2. What misconception does each question challenge?  
3. What is the correct answer and why are the others wrong?  
4. Who is the character for each real life example?  
5. What are the 3 topic-specific numbers for each Apply to Your Money section?  
6. Is there a relevant government/trusted tool for each question?

**Step 3: Fill in the Data**

For each of the 5 questions, fill in:

Question:  
  \- emoji (single emoji related to the topic)  
  \- question text (under 20 words, challenges a misconception)  
  \- 4 options (all plausible, under 10 words each)  
  \- correct answer index (0–3, vary across questions)  
  \- correct feedback (affirm \+ extra insight, max 30 words)  
  \- incorrect feedback (never condescending, max 30 words)

Learn More:  
  \- strapline (3–5 words)  
  \- headline (8–15 words, clear statement)  
  \- quick summary (2 sentences with specific numbers)  
  \- story intro (1 sentence bridging summary to story)  
  \- story (5 slides: emoji, title, text following the narrative arc)  
  \- breakdown (exactly 2 cards, each using a different visual type)  
  \- your money (3 topic-specific inputs, headline, 3 insights)  
  \- action link (optional: label, description, URL, source)  
  \- takeaways (3 bullet points with specific numbers)

**Step 4: Quality Check**

Run through this checklist:

* All 5 questions challenge misconceptions (not trivia)  
* Correct answer position varies across questions  
* All options are plausible to a beginner  
* Feedback is under 30 words, never condescending  
* Quick summaries are exactly 2 sentences with specific numbers  
* Real life examples use named characters with £ amounts  
* Story follows the 5-slide narrative arc  
* Breakdown cards teach NEW info not covered in the story  
* Each breakdown card uses a different visual type  
* Apply to My Money inputs are topic-specific (not repeated)  
* Apply to My Money headline references 2+ input values  
* First insight is marked as primary  
* Action links go to trusted non-commercial sources  
* Takeaways are 3 actionable bullets with specific numbers  
* All content is UK-focused (£, UK schemes, UK rules)  
* No jargon without immediate plain-English explanation

---

**Design Specifications**

**Brand colours:**

* Background (dark): \#0a0a1a  
* Background (light): \#fafafa  
* Electric blue: \#5753ff  
* Correct green: \#34c759  
* Incorrect red: \#ff6b6b  
* Text dark: \#1a1a2e  
* Font: DM Sans (all weights 400–900)

**Screen constraints:**

* Question screen: must fit on one mobile viewport, no scrolling  
* Lesson complete screen: must fit on one mobile viewport, no scrolling  
* Learn more screen: scrollable, but compact by default (accordion cards are collapsed)

**Interactive elements:**

* Lightboxes: Real World Example, Breakdown, Tool, and Apply to My Money all open as full-screen overlays  
* Story carousel: swipeable with Back/Next buttons and dot indicators (inside lightbox)  
* Next Question button: hidden until user scrolls to bottom, then slides up with animation  
* Score ring: animates on load  
* XP text: gold shimmer animation  
* Feedback banner: slides up from bottom

---

**Analytics Events to Track**

The lightbox pattern enables tracking of user engagement with each section:

* **Lightbox opened** — which lightbox (story / breakdown / tool / your money), on which question  
* **Lightbox closed** — how long it was open  
* **Action link clicked** — which tool, on which question  
* **Story carousel completed** — did they swipe through all 5 slides?  
* **Story carousel abandoned** — which slide did they leave on?  
* **Learn more opened** — did they tap "Learn more" or "Next" on the feedback banner?  
* **Scroll depth reached** — did the user scroll to the bottom (triggering the Next Question button)?  
* **Question answered** — correct/incorrect, which option selected, time to answer

These events will show which content users value most and where they drop off, informing future lesson design.

