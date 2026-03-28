---
name: create-story
description: "Generate a user story with boolean acceptance criteria linked to named personas for Mulo AI."
---

# Create User Story

## Instructions

Use this skill when generating individual user stories for Mulo. Read `.cursor/rules/create-story.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read and use `templates/template-story.md` as the document skeleton. Fill in every bracketed placeholder.
2. Read `knowledge/personas.md` and select a specific persona by name for the Persona field. Do not use generic placeholders like "the user."

## Story Format

Use the standard format:

> As a **[persona name]**, I want **[goal]** so that **[benefit]**.

## Acceptance Criteria Rules

- Every criterion must be a **boolean** condition: it either passes or fails, with no ambiguity.
- Write criteria as testable statements (e.g., "The lesson completion screen displays within 2 seconds of the final answer submission").
- Include at least 3 acceptance criteria per story.
- Do not use vague language such as "should work well" or "is user-friendly."
