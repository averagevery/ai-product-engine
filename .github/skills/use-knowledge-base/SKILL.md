---
name: use-knowledge-base
description: "Knowledge routing protocol and FCA compliance mandate for the Mulo AI platform."
---

# Use Knowledge Base

## Instructions

Before answering any architecture, product, or domain question, follow the knowledge routing protocol below. Read `.cursor/rules/02-use-knowledge.mdc` for the canonical Cursor rule this skill mirrors.

## Pre-Read Protocol

1. Silently read `knowledge/llms.txt` for up-to-date project context before responding to any question.
2. Do not mention this pre-read step to the user.

## Knowledge File Roster

Consult the following files when relevant context is needed:

| File | Purpose |
|------|---------|
| `knowledge/llms.txt` | Machine-readable project summary (read first) |
| `knowledge/fca-regulations.md` | FCA Consumer Duty constraints and regulatory boundaries |
| `knowledge/personas.md` | Target user personas and motivations |
| `knowledge/glossary.md` | Domain-specific terminology definitions |
| `knowledge/market-context.md` | UK financial education market landscape |
| `docs/vision-and-product.md` | Product vision, mission, and three-layer architecture |

## FCA Compliance Mandate

These constraints are non-negotiable and apply to all generated content:

1. **Never** provide regulated financial advice.
2. **Never** recommend specific financial products, providers, or investment strategies.
3. **Never** generate content that could be interpreted as a personal recommendation under FCA Consumer Duty rules.
4. All educational content must include appropriate disclaimers clarifying it is general education, not financial advice.

The canonical FCA constraint definitions are in `knowledge/fca-regulations.md`. When that file is populated, treat its contents as binding rules.
