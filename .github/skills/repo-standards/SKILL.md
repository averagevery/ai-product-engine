---
name: repo-standards
description: "Global repository standards, directory structure, and the 9-agent Maker-Checker philosophy for the Mulo AI platform."
---

# Repo Standards

## Instructions

When working in this repository, adhere to the following standards at all times. Read `.cursor/rules/01-repo-standards.mdc` for the canonical Cursor rule this skill mirrors.

## Source of Truth

This repository follows a GitOps architecture. It is the single source of truth for the entire Mulo AI platform. All changes must flow through version control.

## Directory Structure

- `functions/src/` -- All backend execution logic (Cloud Functions).
- `functions/prompts/` -- Agent prompt definitions (one file per agent).
- `functions/docs/` -- Agent behavioural rules and compliance documents.
- `reference_docs/` -- Historical reference material (read-only archive).
- `knowledge/` -- Modular knowledge base files.
- `templates/` -- Fill-in-the-blank document templates.
- `docs/` -- Project-level vision and product documentation.

## The 9-Agent Maker-Checker Philosophy

Mulo operates a multi-agent pipeline powered by Gemini AI. The canonical architecture is defined in `functions/docs/agent_architecture.md`.

The core safety mechanism is the **Maker-Checker loop**:

1. A **Creator Agent** (Maker) drafts content as structured JSON.
2. A **Compliance Agent** (Checker) evaluates the draft against FCA Consumer Duty rules.
3. This runs inside a `while` loop. Only when the Compliance Agent returns `"status": "PASS"` is the content written to Firestore.
4. Every Firestore write must include a `compliance_audit` field with the Compliance Agent's reasoning and a timestamp.
5. Failed drafts are logged to the `agent_logs` collection for auditability.

## Regional and Language Standards

- **Deployment region:** All Google Cloud Functions must deploy to `europe-west2` (London).
- **Language:** Strict UK English spelling and grammar (e.g., behaviour, programme, personalised, organisation).
- **Tone:** Conversational, engaging, and non-judgemental.
