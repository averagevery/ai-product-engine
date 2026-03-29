---
name: create-agent
description: "Create or update an AI agent's behavioural rules in functions/docs/. These files are loaded at runtime and directly control agent behaviour."
---

# Create or Update Agent Rules

## Instructions

Use this skill when creating a new agent rule document or updating an existing one. Read `.cursor/rules/create-agent.mdc` for the canonical Cursor rule this skill mirrors.

## Steps

1. Read `functions/docs/agent_architecture.md` for the canonical agent roster and Maker-Checker loop requirements.
2. Read `knowledge/fca-regulations.md` to ensure FCA compliance constraints are included.
3. If updating an existing file, read the current version first and preserve its structure.
4. Save the document to `functions/docs/` using descriptive `snake_case` naming (e.g., `personalisation_rules.md`).

## Existing Agent Rule Files

| File | Agent | Purpose |
|------|-------|---------|
| `compliance_rules.md` | Compliance Agent | FCA Consumer Duty validation rules |
| `design_guidelines.md` | Design Agent | Visual asset prompting rules |
| `telemetry_rules.md` | Telemetry Agent | Micro and macro data triggers |
| `financial_standards.md` | Creator Agent | PISA financial literacy pillars |
| `lesson_guidelines.md` | Creator Agent | Mobile screen constraints and JSON output rules |
| `agent_architecture.md` | All | System-wide pipeline architecture |

## Quality Checklist

- Clear positive rules (MUST do) and prohibitions (MUST NEVER do).
- FCA compliance constraints where the agent handles user-facing content.
- Concise, scannable language -- the AI agent reads this at runtime.
