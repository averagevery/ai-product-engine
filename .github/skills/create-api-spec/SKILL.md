---
name: create-api-spec
description: "Generate RESTful API specifications that support the Maker-Checker loop for the Mulo AI backend."
---

# Create API Specification

## Instructions

Use this skill when defining or reviewing API endpoints for the Mulo backend. Read `.cursor/rules/create-api-spec.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read `functions/docs/agent_architecture.md` for the canonical database schema and agent roster.
2. Read `docs/vision-and-product.md` for product context.
3. Define endpoints following the RESTful standards and Maker-Checker requirements below.

## RESTful Standards

- Use standard HTTP methods: `POST` for creation, `GET` for retrieval, `PATCH` for updates, `DELETE` for removal.
- All endpoints must return structured JSON responses with consistent error shapes.
- Use plural nouns for resource paths (e.g., `/lessons`, `/screens`).

## Maker-Checker Loop Requirements

Every content-write endpoint must support the full Maker-Checker cycle:

1. **Draft submission** -- accepts a generation request and triggers the Creator Agent.
2. **Compliance review** -- the Compliance Agent evaluates the draft within a `while` loop.
3. **Approval** -- on `"status": "PASS"`, the content is written to Firestore via a Batch Write.
4. **Rejection** -- on `"status": "FAIL"`, the failed draft is logged to `agent_logs` and the loop retries.

## Mandatory Fields

All write payloads to the `lessons` collection must include:

- `compliance_audit` -- the Compliance Agent's reasoning and verdict.
- `human_approved` -- boolean, default `false`.
- `version` -- integer, default `1`.
- A server-generated timestamp.
