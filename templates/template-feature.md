> **AI Source Prompt:** [Paste the exact prompt or @-mention that generated this document]
> **Generated:** [YYYY-MM-DD]
> **Rule Used:** create-feature.mdc

# Feature: [Feature Name]

## Overview

**Feature ID:** [FEAT-NNN]
**Product Layer:** [SEE / LEARN / ACT]
**Persona(s) Served:** [Persona name(s) from knowledge/personas.md]

## UX Flow

Describe the step-by-step user journey through this feature:

1. **Entry Point:** [How the user arrives at this feature -- e.g., taps a card on the dashboard]
2. **Step 1:** [What the user sees and does first]
3. **Step 2:** [Next interaction]
4. **Step 3:** [Next interaction]
5. **Exit Point:** [Where the user goes after completing this flow -- e.g., returns to dashboard, enters a lesson]

## UI Layout Constraints

All screens must comply with the Mulo design system (`.cursor/rules/03-design-system.mdc`):

| Constraint | Value |
|-----------|-------|
| Background | `#0A0A1A` (near-black) |
| Primary colour | `#3733E5` (electric blue) |
| CTA colour | Mint green |
| Font | DM Sans |
| Headlines | Max 7 words |
| Body text | Max 25 words |
| Feedback text | Max 15 words |
| Lottie motifs | Bank building, piggy bank, shield, coins, graduation cap, growth chart |
| Banned elements | `$` symbol, red effects, currency iconography |

## Database Connections

| Collection | Operation | Fields Used |
|-----------|-----------|-------------|
| [e.g., `lessons`] | [READ / WRITE] | [List relevant fields] |
| [e.g., `screens`] | [READ / WRITE] | [List relevant fields] |
| [e.g., `image_library`] | [READ] | [List relevant fields] |

## Acceptance Criteria

- [ ] [Criterion 1: a boolean, testable condition]
- [ ] [Criterion 2: a boolean, testable condition]
- [ ] [Criterion 3: a boolean, testable condition]

## Dependencies

- [Dependency 1]
- [Dependency 2]

## Out of Scope

- [What this feature explicitly does not cover]

## Notes

[Any additional context, edge cases, or design references]
