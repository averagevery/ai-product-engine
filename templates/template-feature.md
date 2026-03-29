> **AI Source Prompt:** [Paste the natural language prompt that generated this document. If amending this feature, edit this prompt and use Cmd+K to regenerate the file.]
> **Generated:** [YYYY-MM-DD]
> **Rule Used:** create-feature.mdc

# [Natural Language Name of Feature, e.g., "The Debt Snowball Calculator UI"]

## 1. Goal and Context

**Product Layer:** [See (Dashboard) / Learn (Lesson) / Act (Tool)]
**Target Persona:** [e.g., Sarah -- First Time Buyer, from knowledge/personas.md]
**Core Objective:** [Write a 2-3 sentence natural language paragraph explaining exactly what this software feature does and why it exists. Focus on the user outcome, not the implementation.]

## 2. User Journey

Describe the step-by-step interaction in plain English. Focus on what the user sees and does.

* **Entry:** [How do they get here? e.g., "User taps the 'Debt Tools' card on the dashboard."]
* **Action:** [What is the primary interaction? e.g., "User enters their outstanding balances and interest rates. The calculator ranks debts by smallest balance first."]
* **Exit:** [Where do they go next? e.g., "User returns to the dashboard with a personalised payoff plan saved to their profile."]

## 3. Context Documents and Technical Boundaries

AI agents generating code or content for this feature MUST read the following documents first:

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography, word limits, Lottie constraints |
| FCA Regulations | `knowledge/fca-regulations.md` | Compliance boundaries for this feature |
| [Add more as needed] | [path] | [why this document matters] |

**Prohibitions (quick reference):** NEVER use the `$` symbol, red alert text, complex background gradients, or brand logos in any screen generated for this feature.

## 4. System Architecture

### Involved AI Agents

| Agent | Role in This Feature | Trigger |
|-------|---------------------|---------|
| [e.g., Creator Agent] | [e.g., Generates lesson screens for the calculator tutorial] | [e.g., New lesson_request document created] |
| [e.g., Telemetry Agent] | [e.g., Tracks drop-off rate on the input screen] | [e.g., Weekly analysis cycle] |

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| [e.g., `users`] | [e.g., READ] | [e.g., `current_balance`, `debt_accounts`] |
| [e.g., `lessons`] | [e.g., WRITE] | [e.g., `category`, `lessonName`, `compliance_audit`] |

## 5. Compliance Constraints

FCA-specific rules that apply to this feature:

* [e.g., "This feature MUST NOT rank or recommend specific debt repayment products. It can only present the user's own data back to them."]
* [e.g., "All output screens must include a disclaimer: 'This is general education, not financial advice.'"]
* [e.g., "If the user's debt data suggests financial distress, the feature must surface a supportive message and link to free debt advice (StepChange, Citizens Advice), not a product."]

## 6. Failure States

Instead of boolean acceptance criteria, describe what the system does when things go wrong.

* **Data Failure:** [What happens if the Firestore read/write fails? e.g., "Show a friendly 'offline' skeleton state. Do not show an error code."]
* **Compliance Failure:** [What happens if the content violates FCA rules? e.g., "If the Compliance Agent returns FAIL, the feature must not render the lesson. Log to agent_logs and retry via the Maker-Checker loop."]
* **Agent Failure:** [What happens if an AI agent times out or returns malformed output? e.g., "Default to FAIL, log the raw response (truncated to 500 chars) to agent_logs, and show the user a 'try again later' message."]

## 7. Source Implementation

Link to the code files that implement this feature. Leave empty for features not yet built.

| File | Purpose |
|------|---------|
| [e.g., `functions/src/maker_checker_loop.js`] | [e.g., Core pipeline that processes lesson generation requests] |
| [e.g., `functions/prompts/creator_agent.js`] | [e.g., Prompt builder for the Creator Agent] |

## 8. Notes

[Any additional context, edge cases, upstream/downstream dependencies, or design references that do not fit in the sections above.]
