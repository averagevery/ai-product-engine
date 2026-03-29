> **AI Source Prompt:** [Paste the exact prompt or @-mention that generated this document]
> **Generated:** [YYYY-MM-DD]
> **Rule Used:** create-lesson.mdc

# Core Lesson: [Lesson Name]

> This is a **hand-crafted core lesson** stored in the Cursor monorepo and synced to the `core_lessons` Firestore collection via `npm run sync-curriculum`. Each `## Screen N:` heading becomes a separate document in the `screens` collection with `lessonType: "core"`.

---
category: [e.g., Savings, Debt, Mortgage, Pension, Investing]
programmeId: [parent-programme-folder-name]
lessonName: [Lesson Name]
lessonLevel: [Beginner / Intermediate / Expert]
lessonTime: [e.g., 3 mins]
persona: [Target persona name from knowledge/personas.md]
screenCount: [Total number of screens]
---

## Screen 1: Hook
**screenType:** question
**headline:** [Max 7 words]
**question:** [Multiple-choice question to hook the learner]
- A) [Option]
- B) [Option]
- C) [Option]
- D) [Option]
**questionAnswer:** [Correct letter]
**feedbackCorrect:** [Max 15 words -- shown when user answers correctly]
**feedbackIncorrect:** [Max 15 words -- shown when user answers incorrectly]

## Screen 2: Learn
**screenType:** standard
**headline:** [Max 7 words]
**paragraph:** [Max 25 words -- the core educational content for this screen]
**LottieSuggestion:** [Approved motif: bank building, piggy bank, shield, coins, graduation cap, growth chart]

## Screen 3: Summary
**screenType:** summary
**keyTakeaway1:** [One sentence takeaway]
**keyTakeaway2:** [One sentence takeaway]
**keyTakeaway3:** [One sentence takeaway]

<!-- Add more ## Screen N: Type sections as needed. Each heading becomes a Firestore screen document. -->

## Compliance

**Disclaimer:** This lesson is general education and does not constitute financial advice.
**FCA Check:** [ ] Content does not recommend specific products or providers
