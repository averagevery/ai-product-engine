> **AI Source Prompt:** [Paste the exact prompt or @-mention that generated this document]
> **Generated:** [YYYY-MM-DD]
> **Rule Used:** create-lesson.mdc

# Core Lesson: [Lesson Name]

> This is a **hand-crafted core lesson** stored in the Cursor monorepo and synced to the `core_lessons` Firestore collection via `npm run sync-curriculum`. Each `## Question N:` heading becomes a separate document in the `screens` collection with `lessonType: "core"` and `lessonFormat: "v2_interactive"`. The nested `learnMore` map is stored on the same screen document. For structure rules and word limits, see `functions/docs/lesson_guidelines.md`.

---
category: [e.g., Savings, Debt, Mortgage, Pension, Investing]
programmeId: [parent-programme-folder-name]
lessonName: [Lesson Name]
lessonLevel: [Beginner / Intermediate / Expert]
lessonTime: [e.g., 2 mins]
persona: [Target persona name from knowledge/personas.md]
lessonFormat: v2_interactive
screenCount: 5
---

## Question 1: [Topic]

**emoji:** [Single emoji related to this question]
**questionText:** [Max 20 words -- challenges a common misconception]
- 0) [Option -- max 10 words]
- 1) [Option -- max 10 words]
- 2) [Option -- max 10 words]
- 3) [Option -- max 10 words]
<!-- Exactly one option must be fully correct. Avoid two answers with the same verdict (e.g. two "False —" lines on one statement). Prefer a direct question if a T/F stem would duplicate correct-looking options. -->
**correctIndex:** [0, 1, 2, or 3]
**feedbackCorrect:** [Max 30 words -- affirm, then add one extra insight]
**feedbackIncorrect:** [Max 30 words -- never condescending, reframe the correct answer]

### learnMore

**strapline:** [3-5 words in a pill badge, e.g. "Let's understand why"]
**headline:** [8-15 words, clear statement, conversational]
**quickSummary:** [Exactly 2 sentences. Must include at least one specific number or £ amount.]

#### Slide 1: Setup
**emoji:** [Emoji]
**title:** [2-3 words]
**text:** [1-2 sentences, max 30 words. Must include a specific £ amount.]

#### Slide 2: Situation
**emoji:** [Emoji]
**title:** [2-3 words]
**text:** [1-2 sentences, max 30 words. Must include a specific £ amount.]

#### Slide 3: Complication
**emoji:** [Emoji]
**title:** [2-3 words]
**text:** [1-2 sentences, max 30 words. Must include a specific £ amount.]

#### Slide 4: Consequence
**emoji:** [Emoji]
**title:** [2-3 words]
**text:** [1-2 sentences, max 30 words. Must include a specific £ amount.]

#### Slide 5: Resolution
**emoji:** [Emoji]
**title:** [2-3 words]
**text:** [1-2 sentences, max 30 words. Must include a specific £ amount.]

#### Card 1: [comparison / highlight / timeline]
**type:** [comparison / highlight / timeline]
**caption:** [One sentence explaining the visual]

<!-- For comparison: -->
**leftLabel:** [Label]
**leftItems:** [Item 1] | [Item 2] | [Item 3]
**rightLabel:** [Label]
**rightItems:** [Item 1] | [Item 2] | [Item 3]

<!-- For highlight: -->
<!-- **heroNumber:** [e.g. "£600k"] -->
<!-- **subtitle:** [Short subtitle] -->
<!-- **detail:** [One sentence detail] -->

<!-- For timeline: -->
<!-- **step1:** [Description] -->
<!-- **step2:** [Description] -->
<!-- **step3:** [Description] -->

#### Card 2: [comparison / highlight / timeline]
**type:** [comparison / highlight / timeline -- must be DIFFERENT from Card 1]
**caption:** [One sentence explaining the visual]

<!-- Fill in the appropriate fields for the chosen type (see Card 1 above). -->
<!-- Cards must teach NEW information not covered in the story. -->

- Takeaway: [One actionable sentence with a specific number]
- Takeaway: [One actionable sentence with a specific number]
- Takeaway: [One actionable sentence]

<!-- Optional: only include if a genuinely relevant government or trusted tool exists. -->
<!-- Approved sources: MoneyHelper, Gov.uk, ClearScore, Credit Karma, HMRC, Turn2us, NHS. -->
<!-- **actionLabel:** [Tool name] -->
<!-- **actionDescription:** [What the tool does, 1-2 sentences] -->
<!-- **actionUrl:** [URL] -->

<!-- Repeat ## Question N: sections for Questions 2-5, following the same structure. -->
<!-- Each question must challenge a DIFFERENT misconception. -->
<!-- The correctIndex must VARY across all 5 questions. -->
<!-- Story characters must be named UK individuals (Maya, Tom, Sarah, Jake, Priya, etc.). -->

## Question 2: [Topic]

<!-- Same structure as Question 1 above. -->

## Question 3: [Topic]

<!-- Same structure as Question 1 above. -->

## Question 4: [Topic]

<!-- Same structure as Question 1 above. -->

## Question 5: [Topic]

<!-- Same structure as Question 1 above. -->

## Compliance

**Disclaimer:** This lesson is general education and does not constitute financial advice.
**FCA Check:** [ ] Content does not recommend specific products or providers
