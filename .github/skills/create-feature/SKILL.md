---
name: create-feature
description: "Generate an app feature specification with UX flow, UI layout constraints, and database connections."
---

# Create Feature

## Instructions

Use this skill when specifying a UX/UI feature or app logic component for Mulo. Read `.cursor/rules/create-feature.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read and use `templates/template-feature.md` as the document skeleton. Fill in every bracketed placeholder.
2. Read `docs/vision-and-product.md` to identify which product layer (See / Learn / Act) this feature belongs to.
3. Read `knowledge/personas.md` to associate the feature with specific personas.
4. Reference `.cursor/rules/03-design-system.mdc` for UI layout constraints.
5. Save the completed document to `requirements/app/features/` using the naming convention `FEAT-NNN-short-name.md`.

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Quality Checklist

- The UX Flow must have clear entry and exit points.
- UI Layout Constraints must reference the design system values.
- Database Connections must specify collections, operations, and fields.
- Acceptance Criteria must be boolean and testable.
