> **AI Source Prompt:** Draft an agent behavioural rule document for a new Mulo AI agent. Read `functions/docs/agent_architecture.md` for the canonical agent roster and pipeline position. Read `knowledge/fca-regulations.md` to ensure FCA compliance constraints are included. The document must state clear positive rules (what the agent MUST do), hard prohibitions (what it MUST NEVER do), and a strict JSON output contract. Save to `functions/docs/`.
> **Generated:** [DATE]
> **Rule Used:** create-agent.mdc

# [Agent Name]

## 1. Agent Role & Pipeline Position

**Type:** Maker | Checker | Middleware
**Position in pipeline:** [Describe where this agent sits -- e.g., "runs after Creator, before Compliance" or "intercepts lesson JSON before delivery"]
**Trigger:** [What triggers this agent -- e.g., `lesson_requests` document created, weekly Cloud Scheduler, etc.]

[1-2 sentence summary of what this agent does and why it exists.]

## 2. What This Agent MUST Do

- [Positive rule 1 -- clear, actionable instruction]
- [Positive rule 2]
- [Positive rule 3]
- [Add as many as needed -- the agent reads this at runtime]

## 3. What This Agent MUST NEVER Do

- [Hard prohibition 1]
- [Hard prohibition 2]
- [Hard prohibition 3]
- NEVER provide regulated financial advice or personal recommendations.
- NEVER store or pass raw transaction data to any LLM.

## 4. Input Contract

The agent receives the following input:

```json
{
  "[field_name]": "[type] -- [description]",
  "[field_name]": "[type] -- [description]"
}
```

**Required fields:** [list required fields]
**Optional fields:** [list optional fields]

## 5. Output Contract (Strict JSON Only)

The agent MUST return a single JSON object with this exact shape:

```json
{
  "[output_field]": "[type] -- [description]",
  "[output_field]": "[type] -- [description]"
}
```

Rules:
- Do NOT include Markdown, backticks, or commentary in the output.
- Return ONLY the JSON object.
- If the agent cannot produce a valid output, return `{ "status": "FAIL", "reasoning": "[explanation]" }`.

## 6. FCA Compliance Constraints

[List specific FCA rules that apply to this agent's output. Reference `knowledge/fca-regulations.md` for the full list of hard prohibitions.]

- All content must be general education, not personalised financial advice.
- [Any agent-specific FCA constraints]

## 7. Failure Handling

- If input is missing required fields: [describe fallback]
- If output cannot be generated after [N] attempts: [describe fallback]
- All failures must be logged to the `agent_logs` collection with `status: "error"` and `errorMessage`.

## 8. Context Files

This agent reads the following files at runtime:

| File | Purpose |
|------|---------|
| `functions/docs/agent_architecture.md` | System-wide pipeline context |
| `knowledge/fca-regulations.md` | FCA compliance boundaries |
| `[other relevant files]` | [Purpose] |
