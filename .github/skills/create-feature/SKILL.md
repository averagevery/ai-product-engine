---
name: create-feature
description: "Generate an AI-native app feature specification with user journey, agent interactions, compliance constraints, and failure states."
---

# Create Feature

## Instructions

Use this skill when specifying a UX/UI feature or app logic component for Mulo. Read `.cursor/rules/create-feature.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read and use `templates/template-feature.md` as the document skeleton. Fill in every bracketed placeholder with natural language descriptions.
2. Read `docs/vision-and-product.md` to identify which product layer (See / Learn / Act) this feature belongs to.
3. Read `knowledge/personas.md` to associate the feature with a specific persona.
4. Add `.cursor/rules/03-design-system.mdc` and `knowledge/fca-regulations.md` to the Context Documents table. Add any other relevant documents.
5. Identify which of the 9 agents interact with this feature and populate the Agent interaction table.
6. Write Compliance Constraints specific to this feature.
7. Write Failure States in plain English describing system behaviour when things go wrong.
8. Save the completed document to `requirements/features/` using a natural-language kebab-case filename (e.g., `debt-snowball-calculator.md`).

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Quality Checklist

- User Journey must define Entry, Action, and Exit in plain English.
- Context Documents table must reference `03-design-system.mdc` and `knowledge/fca-regulations.md` at minimum.
- Database Contract must specify Firestore collections, Read/Write operations, and required fields.
- Compliance Constraints must declare FCA boundaries specific to this feature.
- Failure States must cover Data Failure, Compliance Failure, and Agent Failure scenarios.
- Source Implementation must link to relevant code files (or be marked as not yet built).
