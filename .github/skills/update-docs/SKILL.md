---
name: update-docs
description: "Keep all living reference pages in sync after any substantive change to the repository."
---

# Doc Sync Protocol (Copilot)

## Single source of truth

Open **`.cursor/rules/05-update-docs.mdc`** for the full **Living Reference Pages** registry, **Change-to-Doc Matrix**, and **Mandatory closing verification** checklist. That file is always-on in Cursor and is canonical. **Do not maintain a separate copy of the matrix here** — this skill only reminds you to apply it.

## Definition of Done

**A task is not complete until all impacted reference pages have been updated.**

Apply doc updates in the **same** PR or change set as the feature work. Read `05-update-docs.mdc` and complete its **Mandatory closing verification** before you finish.

## Quick steps

1. Complete the primary task.
2. Open `.cursor/rules/05-update-docs.mdc` and apply **every** applicable matrix row.
3. If you renamed or removed a path, slug, or id, search the repo for the old string and update living references.
4. Run `npm run verify-reference-docs` when scripts or the registry changed, or when unsure (checks that living reference **files** still exist).
