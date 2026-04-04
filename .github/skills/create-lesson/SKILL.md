---
name: create-lesson
description: "Generate a lesson editorial brief or paired hand-crafted core lessons (v1 + v2) for the Mulo AI platform."
---

# Create Lesson

## Instructions

Use this skill when specifying a lesson for Mulo. There are two lesson types. Read `.cursor/rules/create-lesson.mdc` for the canonical Cursor rule this skill mirrors.

### Option A: Editorial Brief (for AI-generated `user_lessons`)

Creates an **editorial brief** -- the input that defines what the lesson should teach. The Maker-Checker pipeline runs **twice** per `lesson_requests` document (v1_swipe and v2_interactive), writing up to two `user_lessons` docs and matching `screens`.

### Option B: Core Lesson (for hand-crafted `core_lessons`)

Creates **two** markdown files in the programme folder: `{slug}.md` (v1) and `{slug}.v2.md` (v2). Both sync to Firestore via `npm run sync-curriculum` (`core_lessons` + `screens`; v2 lesson doc id `{slug}--v2`).

## Steps -- Editorial Brief (Option A)

1. Read and use `templates/template-lesson.md` as the document skeleton. Fill in every bracketed placeholder.
2. Read `knowledge/personas.md` for the target persona context.
3. Read `functions/docs/financial_standards.md` for the PISA financial pillars and topic boundaries.
4. Read `functions/docs/lesson_guidelines.md` for v1 screen flow (the pipeline also runs v2 using `lesson_guidelines_v2.md`).
5. Reference `requirements/features/core-system-architecture.md` for the Firestore schema (`user_lessons`, `lesson_requests`, `screens`).
6. Save the completed document inside the relevant programme folder: `requirements/content/programmes/{programme-name}/`.

## Steps -- Core Lesson (Option B)

**Always produce both files** (same metadata except format-specific fields). See `.cursor/rules/create-lesson.mdc` for the full step list.

1. **V1:** `templates/template-core-lesson.md` → `{slug}.md` with `## Screen N:` headings.
2. **V2:** `templates/template-core-lesson-v2.md` → `{slug}.v2.md` with `## Question N:` and nested `learnMore` (exactly 5 questions).

## Naming Convention

- **v1:** `{lesson-topic}.md`
- **v2:** `{lesson-topic}.v2.md`

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Content Constraints

Follow `.cursor/rules/create-lesson.mdc` and `.cursor/rules/03-design-system.mdc` -- v1 vs v2 word limits differ (v2 feedback banners 30 words; v1 feedback screens 15 words; see `lesson_guidelines_v2.md` for full v2 rules).

- Lottie motifs (v1 only): approved motifs only; banned: `$`, red effects, currency iconography in animations.
- Strict UK English; FCA disclaimer on every lesson; no regulated financial advice.
