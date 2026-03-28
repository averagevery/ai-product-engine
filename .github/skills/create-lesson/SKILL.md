---
name: create-lesson
description: "Generate a 3-screen micro-lesson specification with database frontmatter and compliance checks."
---

# Create Lesson

## Instructions

Use this skill when specifying an individual 3-screen micro-lesson for Mulo. Read `.cursor/rules/create-lesson.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read and use `templates/template-lesson.md` as the document skeleton. Fill in every bracketed placeholder.
2. Read `knowledge/personas.md` for the target persona context.
3. Reference `functions/docs/agent_architecture.md` for the Firestore schema (`lessons` and `screens` collections).
4. Save the completed document to `requirements/content/lessons/` using the naming convention `LESSON-NNN-short-name.md`.

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Content Constraints

- Headlines: max 7 words
- Body text: max 25 words
- Feedback text: max 15 words
- Lottie motifs: only approved motifs (bank building, piggy bank, shield, coins, graduation cap, growth chart)
- Banned: `$` symbol, red effects, currency iconography
- All content must use strict UK English spelling.
- Every lesson must include an FCA disclaimer.
