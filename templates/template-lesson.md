> **AI Source Prompt:** [Paste the exact prompt or @-mention that generated this document]
> **Generated:** [YYYY-MM-DD]
> **Rule Used:** create-lesson.mdc

# Lesson Brief: [Lesson Name]

> This is an **editorial brief** -- it defines what the lesson should teach and the editorial tone. The Creator Agent uses this brief to generate the full **5-question v2_interactive lesson** via the Maker-Checker pipeline. You do not need to write all questions here; provide the topic direction, misconceptions to challenge, and key learning points. For structure rules see `functions/docs/lesson_guidelines.md`.

## Lesson Metadata

```yaml
category: [e.g., Savings, Debt, Mortgage, Pension, Investing]
moduleName: [Parent programme name -- maps to lesson_requests.moduleName in Firestore]
lessonName: [Lesson name]
lessonLevel: [Beginner / Intermediate / Expert]
lessonTime: 2 mins
persona: [Target persona name from knowledge/personas.md]
lessonFormat: v2_interactive
```

## Topic and Learning Objective

**Topic:** [One sentence describing the financial concept this lesson teaches]
**Learning Objective:** [What the user should understand or be able to do after completing this lesson]
**PISA Pillar:** [Which PISA financial literacy pillar this maps to -- see functions/docs/financial_standards.md]

## Misconceptions to Challenge (5 required)

Each of the 5 questions must challenge a **different** common misconception. List them here so the Creator Agent generates focused, non-overlapping questions.

1. [Misconception the learner likely holds -- e.g., "You need twenty percent saved before any lender will look at you."]
2. [A different misconception on the same broad topic]
3. [...]
4. [...]
5. [...]

## Editorial Direction

Describe the tone, angle, and approach. The Creator Agent will use this as creative direction.

* **Hook:** [How should question 1 open? e.g., "Challenge the assumption that deposit saving requires a huge salary."]
* **Core Concept:** [The single most important idea the lesson teaches]
* **Key Takeaways:** [2-3 bullet points the user should remember after all 5 questions]

## Sample Question

Provide one example to set the difficulty, style, and answer format. The Creator Agent will generate the remaining four.

**questionText:** [Max 20 words -- challenges one of the misconceptions above]
- 0) [Option -- max 10 words]
- 1) [Option -- max 10 words]
- 2) [Option -- max 10 words]
- 3) [Option -- max 10 words]
**correctIndex:** [0, 1, 2, or 3]
**Why:** [Brief explanation of why this is the single correct answer and the others are weaker]

> Only **one** option may be fully correct. Do not write two options that share the same verdict (e.g. two "False —" lines). Prefer a direct question over a true/false stem.

## Learn More Hints (optional)

Suggest story characters, £ figures, or breakdown card ideas the Creator Agent can use when building the `learnMore` sections. These are suggestions, not requirements.

* **Named UK character:** [e.g., Maya, 28, Leeds -- saving for a first flat]
* **Key £ figure:** [e.g., £600k price cap on some supported routes]
* **Breakdown card idea:** [e.g., comparison of smaller deposit sooner vs larger deposit later]

## Compliance

**Disclaimer:** This lesson is general education and does not constitute financial advice.
**FCA Check:** [ ] Content does not recommend specific products or providers

## Internal QA Summary (not user-facing)

Use this section for reviewer confidence only. It is **not** part of the customer-facing lesson output.

### 1) Consumer Duty
- **How considered:** [How the lesson supports informed decisions, avoids harm, and improves understanding for the target persona]
- **How validated:** [Checks used by agent/reviewer to confirm fairness, clarity, and accessibility]

### 2) Compliance / avoiding financial advice
- **How considered:** [How wording stays educational and non-advisory; avoids product/provider recommendations]
- **How validated:** [What was checked against FCA boundaries and internal compliance rules]

### 3) PISA alignment
- **PISA pillar(s) used:** [Financial knowledge / behaviour / attitudes context as relevant]
- **How considered:** [How each misconception/question maps to the selected pillar(s)]
- **How validated:** [How reviewer confirmed the lesson objective and questions align to the chosen pillar(s)]

## Notes

[Any additional context, edge cases, or connections to other lessons/programmes]
