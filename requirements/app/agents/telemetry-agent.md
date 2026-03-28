---
> **AI Source Prompt:** Reverse-engineer the Telemetry Agent specification from functions/docs/telemetry_rules.md. Document the micro-data triggers (quiz fail rates, drop-off, thumbs down), macro-data triggers (Bank of England rates, FCA announcements), and weekly reporting cycle.
---

# Agent: Telemetry Agent

## Agent Persona

**Name:** Telemetry Agent
**Role:** Analyses lesson engagement data and external market signals on a weekly cycle, flags underperforming content, and triggers regeneration requests when thresholds are breached.
**Position in Pipeline:** Phase 4 (Self-Improving Loop) -- operates independently of the Maker-Checker pipeline on a scheduled cadence.

## Inputs

### Micro-Data (Internal Engagement Metrics)

| Metric | Source | Description |
|--------|--------|-------------|
| Quiz pass/fail rates | `lesson_history` collection | Per-question success rate across all users for a given lesson |
| Drop-off data | `lesson_history` collection | Screen-by-screen completion rates; identifies where users abandon a lesson |
| Thumbs up/down feedback | `lesson_history` collection | Binary user satisfaction signal collected on the Summary screen |

### Macro-Data (External Market Signals)

| Signal | Source | Description |
|--------|--------|-------------|
| Bank of England base rate changes | External API / manual feed | Rate decisions that affect savings, mortgage, and debt content |
| FCA regulatory announcements | External API / manual feed | New consumer duty guidance, product bans, or disclosure requirements |
| ISA allowance changes | HMRC announcements | Annual or mid-year changes to ISA contribution limits |
| Student loan policy changes | Government announcements | Threshold changes, interest rate adjustments, repayment plan updates |

## Context Documents

| Document | Path | Purpose |
|----------|------|---------|
| Telemetry Standards | `functions/docs/telemetry_rules.md` | Defines all trigger thresholds, reporting cadence, and escalation rules |

## Strict Guardrails

### Micro-Data Triggers (Automatic Flags)

The following thresholds trigger an automatic flag for content review:

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Single-question fail rate | > 40% | Flag the specific question as potentially ambiguous or poorly worded |
| Lesson-level fail rate | > 30% overall | Flag the entire lesson for content review |
| Drop-off rate | > 50% at any single screen | Flag the screen as a potential engagement blocker |
| Thumbs down rate | > 15% of completions | Flag the lesson for tone/quality review |
| Thumbs up rate | < 50% of completions | Flag the lesson as underperforming on satisfaction |

### Macro-Data Triggers (Content Staleness)

When an external event occurs, the Telemetry Agent must:

1. Identify all lessons tagged with the affected `category` (e.g., Savings, Mortgage, Debt)
2. Flag those lessons as potentially stale
3. Generate a regeneration request to the Creator Agent with the updated context
4. Log the trigger event to the `analytics` collection

### Reporting Rules

- **Cadence:** Weekly analysis cycle (every Monday)
- **Scope:** All lessons that received user interactions in the prior 7 days
- **Output:** A structured JSON report saved to the `analytics` Firestore collection
- **Escalation:** Any lesson flagged by 2+ triggers in the same week is escalated to a human reviewer

## JSON Output Contract

The Telemetry Agent produces a weekly report saved to the `analytics` collection:

```json
{
  "reportDate": "2026-03-28T00:00:00Z",
  "reportPeriod": {
    "start": "2026-03-21T00:00:00Z",
    "end": "2026-03-28T00:00:00Z"
  },
  "flaggedLessons": [
    {
      "lessonId": "string",
      "lessonName": "string",
      "category": "string",
      "triggers": [
        {
          "type": "micro | macro",
          "metric": "string (e.g., 'thumbs_down_rate', 'boe_rate_change')",
          "value": "number or string",
          "threshold": "string",
          "action": "review | regenerate | escalate"
        }
      ]
    }
  ],
  "summary": {
    "totalLessonsAnalysed": "number",
    "totalFlagged": "number",
    "totalEscalated": "number"
  }
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reportDate` | ISO 8601 string | Yes | Timestamp of report generation |
| `reportPeriod.start` | ISO 8601 string | Yes | Start of the analysis window |
| `reportPeriod.end` | ISO 8601 string | Yes | End of the analysis window |
| `flaggedLessons[].lessonId` | string | Yes | Firestore document ID of the flagged lesson |
| `flaggedLessons[].triggers[].type` | string | Yes | `"micro"` (engagement) or `"macro"` (external event) |
| `flaggedLessons[].triggers[].metric` | string | Yes | Name of the metric that breached threshold |
| `flaggedLessons[].triggers[].action` | string | Yes | `"review"` (human), `"regenerate"` (Creator Agent), or `"escalate"` (urgent) |
| `summary.totalLessonsAnalysed` | number | Yes | Count of lessons with activity in the period |
| `summary.totalFlagged` | number | Yes | Count of lessons with at least one trigger |
| `summary.totalEscalated` | number | Yes | Count of lessons with 2+ triggers |

## Error Handling

- If Firestore queries for engagement data fail, the weekly report is skipped and the failure is logged to `agent_logs`.
- If external API feeds are unavailable, macro-data triggers are deferred to the next cycle.
- Reports with zero flagged lessons are still generated and saved (for audit completeness).

## Notes

- Source documentation: `functions/docs/telemetry_rules.md`
- The Telemetry Agent is referenced as a future implementation (`prompts/telemetry_agent.js`) in the agent roster. This spec serves as the authoritative requirements document for its implementation.
- The self-improving loop is the key differentiator: lessons are not static. When market conditions change or user data reveals problems, the system automatically triggers content regeneration through the existing Maker-Checker pipeline.
- Macro-data integration is initially manual (human feeds the data) with a roadmap to automate via external API polling.
