---
name: create-programme
description: "Generate a content programme specification defining a collection of micro-lessons for a target persona."
---

# Create Programme

## Instructions

Use this skill when defining a high-level educational programme for Mulo. Read `.cursor/rules/create-programme.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read and use `templates/template-programme.md` as the document skeleton. Fill in every bracketed placeholder.
2. Read `knowledge/personas.md` to select a specific target persona by name.
3. Read `docs/vision-and-product.md` to align the programme with the See -> Learn -> Act model.
4. Save the completed document to `requirements/content/programmes/` using the naming convention `PROG-NNN-short-name.md`.

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Quality Checklist

- The Target Persona must reference an entry from `knowledge/personas.md` by name.
- The Lessons table must list at least 3 lessons with IDs.
- Success Criteria must be boolean and measurable.
- The ATMI Connection section must describe the Layer 3 (Act) follow-through.
