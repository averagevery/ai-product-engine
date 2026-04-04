> **AI Source Prompt:** Draft the Apply to My Money (ATMI) feature spec. This is the Act-layer card that appears at the end of a relevant lesson, showing users how the financial concepts they just learned apply to their own money. The critical compliance rule: all financial numbers (ISA allowances, tax thresholds, interest rates) come from verified hardcoded constants, never from AI generation. The AI writes the narrative around the numbers, not the numbers themselves.
> **Generated:** 2026-03-29
> **Rule Used:** create-feature.mdc

# Apply to My Money

## 1. Goal and Context

**Product Layer:** Act (Tool) -- triggered within the Learn layer as the bridge from education to action
**Target Persona:** All five personas -- Sarah (First-Time Buyer), James (Clueless Professional), Aisha (Debt Trapped), Tom (Passive Pension), Chloe (Financially Curious)
**Core Objective:** After a user completes a relevant lesson, show them a personalised insight card that translates abstract financial concepts into their real situation. The card combines two distinct data sources: verified regulatory constants (ISA limits, tax brackets, interest rates) that are hardcoded and never AI-generated, and personalised narrative text that the AI writes around those constants. This separation prevents financial number hallucination while keeping the experience personal and actionable.

## 2. User Journey

* **Entry:** User completes the final screen of a lesson that has an associated ATMI card. A "See how this applies to you" prompt appears on the lesson summary screen.
* **Action:**
  1. User taps the prompt. The ATMI card loads.
  2. The card displays:
     - **Headline** -- a short, personalised summary (e.g., "Your LISA could grow by £X this year") where £X comes from a hardcoded constant, not AI.
     - **Insight narrative** -- 2-3 sentences of AI-generated text explaining what the numbers mean for the user's situation, referencing constants by variable name (the front-end injects actual values at render time).
     - **Personalised tip** -- one actionable suggestion based on the user's onboarding profile (e.g., "You said you're saving for a deposit -- a LISA adds a 25% government bonus on top").
     - **Disclaimer** -- always visible: "This is general education based on current UK regulations, not financial advice."
  3. User can dismiss the card and return to the programme view, or tap a "Learn more" link to the next related lesson.
* **Exit:** User returns to the programme view within the Learning Journey, or follows the "Learn more" link. The ATMI card view is logged for telemetry.

## 3. Context Documents and Technical Boundaries

AI agents generating code or content for this feature MUST read the following documents first:

| Document | Path | Relevance |
|----------|------|-----------|
| Design System | `.cursor/rules/03-design-system.mdc` | Colours, typography, word limits, Lottie constraints |
| FCA Regulations | `knowledge/fca-regulations.md` | Compliance boundaries -- ATMI cards must never constitute financial advice |
| Personas | `knowledge/personas.md` | User profiles drive personalisation of the narrative |
| Learning Journey | `requirements/features/learning-journey.md` | ATMI sits within the lesson completion flow |
| User Onboarding | `requirements/features/user-onboarding.md` | Onboarding data personalises the insight narrative |

**Prohibitions (quick reference):** NEVER use the `$` symbol, red alert text, complex background gradients, or brand logos. NEVER allow the AI to generate financial numbers -- all numerical values must come from the `constants` collection and be injected at render time.

## 4. System Architecture

### The Two-Source Rule

This is the defining architectural constraint of the ATMI feature:

| Data Type | Source | Example | Who Controls |
|-----------|--------|---------|-------------|
| Regulatory constants | `constants` collection in Firestore (hardcoded, manually updated) | ISA annual limit = £20,000, LISA bonus = 25%, basic rate tax = 20% | CEO / engineering team -- updated when HMRC/FCA publishes changes |
| Narrative text | AI-generated via Creator Agent | "Your LISA savings could benefit from the government bonus on contributions up to the annual limit" | Creator Agent, validated by Compliance Agent |

The front-end merges these two sources at render time. The AI text references constants by variable name (e.g., `{LISA_ANNUAL_LIMIT}`); the app injects the real value. This means if a tax threshold changes, only the `constants` collection is updated -- no AI regeneration needed.

### Involved AI Agents

| Agent | Role in This Feature | Trigger |
|-------|---------------------|---------|
| Creator Agent | Generates the narrative text and personalised tip for the ATMI card. Must reference constants by variable name, never by value. | ATMI card content generation request |
| Compliance Agent | Validates that the narrative does not constitute financial advice and does not embed hardcoded numbers in AI text | Maker-Checker loop after Creator draft |
| Telemetry Agent | Tracks ATMI card view rate, dismiss rate, and "Learn more" click-through | Card viewed or dismissed event |

### Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `constants` | READ | `constantId`, `name` (e.g., "LISA_ANNUAL_LIMIT"), `value` (e.g., 20000), `unit` (e.g., "GBP"), `source` (e.g., "HMRC 2025/26"), `updatedAt` (Timestamp), `effectiveFrom` (date string) |
| `lessons` | READ | `lessonId`, `atmiCardId` (reference to linked ATMI card, null if none) |
| `atmi_cards` | READ/WRITE | `cardId`, `lessonId`, `headline`, `insightNarrative`, `personalisedTip`, `disclaimer`, `constantRefs` (array of constant IDs used), `compliance_audit`, `created_at` |
| `users` | READ | `goals`, `situation`, `confidenceLevel` (from onboarding -- used to personalise the tip) |

## 5. Compliance Constraints

FCA-specific rules that apply to this feature:

* The AI MUST NEVER generate financial numbers. All monetary values, percentages, tax thresholds, and regulatory limits must come from the `constants` collection and be injected by the front-end at render time.
* If a referenced constant is missing, expired, or marked as outdated in the `constants` collection, the ATMI card MUST NOT render. Show a graceful fallback: "This insight is being updated with the latest figures. Check back soon."
* The narrative text must be clearly educational. Phrases like "You should invest in..." or "We recommend..." are banned. Use educational framing: "Based on current UK rules, here's how this works for someone in your situation."
* Every ATMI card must display the disclaimer: "This is general education based on current UK regulations, not financial advice."
* The `compliance_audit` field on every ATMI card must confirm the Compliance Agent verified the narrative does not embed financial numbers and does not constitute advice.

## 6. Failure States

* **Data Failure:** If the Firestore read for `constants` or `users` fails, do not render the ATMI card. Show a subtle fallback on the lesson summary: "Personalised insights are temporarily unavailable." Never show partial data with missing constants.
* **Compliance Failure:** If the Compliance Agent returns FAIL on the ATMI narrative (e.g., AI embedded a number or used advisory language), the card is not published. Log to `agent_logs` and retry via the Maker-Checker loop. The lesson itself is unaffected -- only the ATMI card is withheld.
* **Stale Constants:** If a constant's `effectiveFrom` date is in the past and no updated value exists, flag the ATMI card as "pending update" in the admin view. Do not show stale regulatory data to users.
* **Missing ATMI Card:** If a lesson has no linked ATMI card (`atmiCardId` is null), simply do not show the "See how this applies to you" prompt on the lesson summary. Not every lesson needs an ATMI card.

## 7. Source Implementation

| File | Purpose |
|------|---------|
| Not yet built | -- |

## 8. Notes

* **Day 1 vs Day 2 ATMI architecture:** This spec defines the **Day 1** approach: a separate post-lesson ATMI card using hardcoded constants injected at render time (the "two-source rule"). For **Day 2**, a per-question ATMI section is embedded inside each question's Learn More lightbox in `v2_interactive` lessons, powered by Open Banking derived signals and user-input values. The per-question schema is defined in `core-system-architecture.md` (`applyToMyMoney` sub-fields under the `screens` collection) and the Day 2 Open Banking data spec is in `functions/docs/day2_open_banking_agent.md`. The constants approach remains the safer compliance architecture for Day 1 since it prevents AI from generating financial numbers.
* The `constants` collection is a critical new data store. It should be seeded with current HMRC and FCA values before any ATMI cards are generated. A suggested initial set: LISA annual limit, LISA bonus rate, ISA annual limit, basic/higher/additional rate income tax thresholds, student loan repayment thresholds, state pension age, auto-enrolment minimum contributions.
* Not every lesson needs an ATMI card. ATMI cards are most valuable for lessons in the Act-adjacent space (savings products, tax wrappers, debt strategies). Purely educational lessons (e.g., "What is compound interest?") may not need one.
* The two-source architecture means ATMI cards degrade gracefully when regulations change -- update the constants collection and all existing cards immediately reflect the new values without regeneration.
* This feature was originally scoped as a template (`template-atmi.md`) but is correctly a feature spec because it describes runtime behaviour, database contracts, and compliance rules rather than a document skeleton.
