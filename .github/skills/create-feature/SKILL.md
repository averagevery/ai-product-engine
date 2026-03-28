---
name: create-feature
description: "Generate a feature specification scoped within an epic and the three-layer product model for Mulo AI."
---

# Create Feature Specification

## Instructions

Use this skill when scoping a feature within an existing epic. Read `.cursor/rules/create-feature.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read `docs/vision-and-product.md` to understand the three-layer product model:
   - **Layer 1 -- SEE:** Open Banking financial overview.
   - **Layer 2 -- LEARN:** Question-based micro-lessons.
   - **Layer 3 -- ACT:** Compare products and switch providers.
2. Read `knowledge/personas.md` to associate the feature with specific personas.
3. If an epic document exists for this feature, read it first for scope boundaries.

## Required Sections

Every feature specification must include:

- **Feature Title** -- concise name.
- **Parent Epic** -- reference to the epic this feature belongs to.
- **Product Layer** -- explicitly state which layer (See / Learn / Act) this feature operates in.
- **Description** -- what the feature does and why it matters.
- **Personas Served** -- named personas from `knowledge/personas.md`.
- **Acceptance Criteria** -- boolean, testable conditions.
- **Dependencies** -- other features, APIs, or data sources required.
- **Out of Scope** -- what this feature explicitly does not cover.
