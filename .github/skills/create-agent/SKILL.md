---
name: create-agent
description: "Generate an AI agent specification with persona, inputs, guardrails, and JSON output contract."
---

# Create Agent Specification

## Instructions

Use this skill when defining or documenting an AI agent's system prompt, behavioural rules, and output contract. Read `.cursor/rules/create-agent.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read and use `templates/template-agent.md` as the document skeleton. Fill in every bracketed placeholder.
2. Read `functions/docs/agent_architecture.md` for the canonical agent roster, Firestore schema, and Maker-Checker loop requirements.
3. Read `knowledge/fca-regulations.md` to ensure guardrails include FCA compliance constraints.
4. Save the completed document to `requirements/app/agents/` using the naming convention `AGENT-NNN-short-name.md`.

## AI Source Prompt

Every generated document must retain the AI Source Prompt block at the top, recording the prompt used, the date, and the rule name.

## Quality Checklist

- The Agent Persona must have a clear name, role, and pipeline position.
- Inputs must specify the exact data sources.
- Strict Guardrails must include at least one FCA compliance constraint.
- The JSON Output Contract must define every field with type and required status.
- Error Handling must specify that failures log to `agent_logs` with a timestamp.
