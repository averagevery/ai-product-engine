---
name: create-lesson
description: "Generate a lesson editorial brief or a hand-crafted core lesson (v2_interactive) for the Mulo AI platform."
---

# Create Lesson

## Instructions

Use this skill when specifying a lesson for Mulo. Read `.cursor/rules/create-lesson.mdc` for the canonical Cursor rule this skill mirrors.

### Option A: Editorial Brief (for AI-generated `user_lessons`)

Creates an **editorial brief** -- the input that defines what the lesson should teach. The Maker-Checker pipeline runs once per `lesson_requests` document (v2_interactive), writing a `user_lessons` doc and matching `screens`.

### Option B: Core Lesson (for hand-crafted `core_lessons`)

Creates **one** markdown file in the programme folder: `{slug}.md`. It syncs to Firestore via `npm run sync-curriculum` (`core_lessons` + `screens`).

## Steps -- Editorial Brief (Option A)

1. Read and use `templates/template-lesson.md` as the document skeleton. Fill in every bracketed placeholder.
2. Read `knowledge/personas.md` for the target persona context.
3. Read `functions/docs/financial_standards.md` for the PISA financial pillars and topic boundaries.
4. Read `functions/docs/lesson_guidelines.md` for v2_interactive structure, tone, and JSON output rules.
5. Reference `requirements/features/core-system-architecture.md` for the Firestore schema (`user_lessons`, `lesson_requests`, `screens`).
6. Save the completed document inside the relevant programme folder: `requirements/content/programmes/{programme-name}/`.

## Steps -- Core Lesson (Option B)

See `.cursor/rules/create-lesson.mdc` for the full step list.

1. `templates/template-core-lesson.md` → `{slug}.md` with `## Question N:` and nested `learnMore` (exactly 5 questions).

## Naming Convention

- `{lesson-topic}.md`

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Content Constraints

Follow `.cursor/rules/create-lesson.mdc` and `.cursor/rules/03-design-system.mdc` -- see `lesson_guidelines.md` for word limits (e.g. feedback banners 30 words).

- Lottie motifs: approved motifs only; banned: `$`, red effects, currency iconography in animations.
- Strict UK English; FCA disclaimer on every lesson; no regulated financial advice.
