---
name: update-docs
description: "Keep all living reference pages in sync after any substantive change to the repository."
---

# Doc Sync Protocol

## Definition of Done

**A task is not complete until all impacted reference pages have been updated.**

Apply all doc updates as part of the same set of changes — in the same response, before finishing. Every diff, PR, and commit must contain the feature change AND the corresponding doc update together. Read `.cursor/rules/05-update-docs.mdc` for the canonical Cursor rule this skill mirrors.

## Living Reference Pages

| File | What it documents |
|------|-------------------|
| `README.md` | Directory tree, rules table, architecture overview, Quick Start commands |
| `knowledge/llms.txt` | Repository layout, architecture, database schema, non-negotiable constraints |
| `.cursor/rules/04-folder-integrity.mdc` | Mandatory file location table |
| `.cursor/rules/01-repo-standards.mdc` | Directory structure listing |

## Change-to-Doc Matrix

| If you... | Update these files |
|-----------|-------------------|
| Add, remove, or rename a **folder** | `README.md` (directory tree), `knowledge/llms.txt` (layout section), `04-folder-integrity.mdc` (file locations table), `01-repo-standards.mdc` (directory structure) |
| Add or remove a **Cursor rule** (`.mdc`) | `README.md` (rules table in Section 1), `knowledge/llms.txt` (`.cursor/rules/` roster) |
| Add or remove a **GitHub Copilot skill** | `README.md` (skills note), `knowledge/llms.txt` (skills section) |
| Add or remove a **document template** | `README.md`, `knowledge/llms.txt` (templates section) |
| Change **Firestore collections or schema** | `knowledge/llms.txt` (architecture section), `requirements/features/core-system-architecture.md` |
| Add or change a **root `npm` script** | `README.md` (Quick Start section), `scripts/README.md` |
| Change **Maker-Checker loop behaviour** | `knowledge/llms.txt` (core architecture section), `requirements/features/core-system-architecture.md` |
| Add or remove a **feature spec** | `knowledge/llms.txt` (requirements layout section) |
| Add or remove an **agent rule file** in `functions/docs/` | `knowledge/llms.txt` (functions section), `.cursor/rules/create-agent.mdc` (existing agent rule files table) |
| Add or change a **utility script** in `scripts/` | `README.md` (directory tree), `scripts/README.md`, `knowledge/llms.txt` (scripts section) |

## Steps

1. Complete the primary task.
2. Scan the matrix and identify every applicable row.
3. Open each listed reference file and update the affected section(s) only.
4. Include all reference file edits in the same response as the primary change.

If a reference file is missing a relevant section for new content, add the section rather than skipping it.
