---
name: create-blueprint
description: "Generate a service blueprint mapping a user journey across front-stage and back-stage touchpoints."
---

# Create Service Blueprint

## Instructions

Use this skill when mapping a complete user journey or feature flow across touchpoints. Read `.cursor/rules/create-blueprint.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read and use `templates/template-service-blueprint.md` as the document skeleton. Fill in every bracketed placeholder.
2. Read `docs/vision-and-product.md` to align the blueprint phases with the See -> Learn -> Act model.
3. Read `knowledge/personas.md` to ground the user actions in a specific persona's context.
4. Reference the relevant feature specs in `requirements/features/` for each phase.
5. Save the completed document to `docs/` using the naming convention `blueprint-[journey-name].md`.

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Quality Checklist

- Each phase must define User Actions, Front-stage Interactions, Back-stage Processes, and Support Processes.
- The Line of Visibility must clearly separate what the user sees from what happens behind the scenes.
- Pain Points must identify at least one friction point per phase with a proposed improvement.
- Cross-references to feature specs in `requirements/features/` should be included where applicable.
