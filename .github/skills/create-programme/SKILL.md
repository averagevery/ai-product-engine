---
name: create-programme
description: "Generate a content programme folder with metadata and lesson files for a target persona."
---

# Create Programme

## Instructions

Use this skill when defining a high-level educational programme for Mulo. Read `.cursor/rules/create-programme.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read and use `templates/template-programme.md` as the skeleton for the programme metadata file. Fill in every bracketed placeholder.
2. Read `knowledge/personas.md` to select a specific target persona by name.
3. Read `docs/vision-and-product.md` to align the programme with the See -> Learn -> Act model.
4. Create a **folder** at `requirements/content/programmes/{programme-slug}/`.
5. Save the programme metadata as `programme.md` inside that folder.
6. For each lesson, create either one core lesson file (`templates/template-core-lesson.md` → `{lesson-slug}.md`) or an editorial brief (`templates/template-lesson.md`) as a sibling `.md` file alongside `programme.md`.

## Naming Convention

Programme folder: `{programme-slug}/` (e.g., `lisa-savings/`).
Programme metadata: `programme.md`.
Lesson files: `{lesson-slug}.md` (e.g., `lisa-penalty-rules.md`).

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Quality Checklist

- The Target Persona must reference an entry from `knowledge/personas.md` by name.
- The Lessons table must list at least 3 lessons with their filenames.
- Success Criteria must be boolean and measurable.
- The ATMI Connection section must describe the Layer 3 (Act) follow-through.
