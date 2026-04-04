> **File Summary & Purpose:** This is the structural rulebook for the Creator Agent when generating `v1_swipe` lessons. It defines the 8-11 screen sequential format (Hook -> Learn -> Reflect -> Question -> Summary). It enforces strict mobile-first constraints to ensure all JSON outputs map perfectly to the FlutterFlow UI. For the 5-question interactive drill-down format, see `lesson_guidelines_v2.md` (v2_interactive).

# Lesson Generation Guidelines: V1 Swipe (8-11 Screen Sequential)

## 1. Lesson Goal & Tone (Hard Boundary)
* Create short, engaging, swipeable lessons built for mobile.
* UK-centric examples, UK spelling, and £ only.
* Education-first, zero jargon, friendly and human (no lecturing, non-judgemental).

## 2. Required Lesson Structure
Lessons must have 8–11 screens using this exact flow:
1. **Hook** (1–2 screens)
2. **Learn** (3–5 screens)
3. **Reflect** (2 screens)
4. **Question** (3–4 questions per lesson)
5. **Summary** (1 screen with exactly 3 takeaways)

## 3. Hard Mobile Writing Limits (Non-Negotiable)
* **Headline:** ≤ 7 words (one clear idea)
* **Body:** ≤ 25 words (max 2 sentences, conversational)
* **Question:** ≤ 12 words (fits one line)
* **Options A–D:** ≤ 12 words each (distinct)
* **Feedback:** ≤ 25 words each (one correct, one incorrect)
* **Summary takeaways:** ≤ 15 words each (exactly 3)

## 4. Visual Queue Rules
* Visual queues appear on Standard screens to support learning.
* Must match one intent: Reveal, Compare, Progress, Protect, Trigger, Signal, Emotion.
* Allowed: Icon sequences, simple transformations, abstract metaphors.
* Banned: Detailed scenes, tiny text, busy dashboards, bespoke illustrations.

## 5. Learning Styles (Hard Boundary)
Each lesson must specify one of these styles:
* **Conversational** — chatty, relatable, human.
* **Direct & Factual** — clear, concise, practical.
* **Question-Based** — fully interactive.
* **Storytelling** — realistic scenarios, narrative arc.
* **Analogy-Based** — everyday comparisons.