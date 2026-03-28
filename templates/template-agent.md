> **AI Source Prompt:** [Paste the exact prompt or @-mention that generated this document]
> **Generated:** [YYYY-MM-DD]
> **Rule Used:** create-agent.mdc

# Agent: [Agent Name]

## Agent Persona

**Name:** [e.g., Creator Agent, Compliance Agent, Design Agent, Telemetry Agent]
**Role:** [One-sentence description of what this agent does in the pipeline]
**Position in Pipeline:** [e.g., Step 1 (Maker), Step 2 (Checker), Step 3 (Post-Pass)]

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| [Input 1] | [e.g., API request body] | [What data this agent receives] |
| [Input 2] | [e.g., Firestore `lessons` collection] | [What data this agent reads] |
| [Input 3] | [e.g., Previous agent output] | [What data is passed from upstream] |

## Context Documents

| Document | Path | Purpose |
|----------|------|---------|
| [e.g., Financial Standards] | [e.g., `functions/docs/financial_standards.md`] | [What rules this doc provides] |
| [e.g., Compliance Rules] | [e.g., `functions/docs/compliance_rules.md`] | [What constraints this doc enforces] |

## Strict Guardrails

The following constraints are non-negotiable. This agent must NEVER:

1. [Guardrail 1: e.g., Generate content that constitutes regulated financial advice]
2. [Guardrail 2: e.g., Write to Firestore without a compliance_audit field]
3. [Guardrail 3: e.g., Use the `$` symbol or red effects in visual assets]
4. [Guardrail 4: e.g., Exceed word limits -- headlines 7, body 25, feedback 15]

## JSON Output Contract

The agent must return JSON matching this exact schema:

```json
{
  "status": "[PASS or FAIL]",
  "[field_1]": "[description]",
  "[field_2]": "[description]",
  "[field_3]": "[description]"
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | `"PASS"` or `"FAIL"` |
| [field_1] | [type] | [Yes/No] | [Description] |
| [field_2] | [type] | [Yes/No] | [Description] |

## Error Handling

- On failure, the agent must return `"status": "FAIL"` with a `reasoning` field explaining why.
- Failed outputs are logged to the `agent_logs` Firestore collection with a timestamp.

## Notes

[Any additional context, upstream/downstream dependencies, or integration details]
