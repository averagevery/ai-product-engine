# Mulo Open Banking Data Principles (DAY 2 FEATURE)

**Status:** Day 2 feature. Isolated from Day 1 MVP development. The structural foundation is documented here; implementation is deferred.

Mulo connects to user accounts via Open Banking (e.g., TrueLayer or Finexer) to personalise the "Apply to My Money" lesson sections and dynamically route programme recommendations. Mulo operates as an AISP (Account Information Service Provider) under PSD2 regulations.

## The Data Minimisation Rule

**CRITICAL:** Raw transaction data is NEVER stored. The system only processes transactions into derived, aggregated signals in real-time, and discards the underlying transaction details immediately. This minimises data risk, simplifies GDPR compliance, and aligns with FCA Digital Sandbox requirements.

## The 11 Data Categories (111 Data Points)

The engine processes 111 derived data points across the following 11 categories. The full catalogue with per-field availability, source, and educational application is maintained in `reference_docs/mulo-open-banking-data-points.docx.md`.

| # | Category | Key Signals | Availability |
|---|----------|-------------|-------------|
| 1 | **Income & Earnings** | `verifiedMonthlyIncome`, payday dates, irregular windfalls, employer name | 8 points, mostly Now |
| 2 | **Spending & Outgoings** | Subscription burden, BNPL detection, spending velocity, category breakdown | 20 points, mostly Now |
| 3 | **Savings & Cash Reserves** | Emergency fund runway (months), ISA utilisation, savings rate (% of income) | 13 points, mostly Now |
| 4 | **Debt & Credit** | Credit utilisation ratio, minimum payment traps, debt trajectory, BNPL obligations | 15 points, mostly Now |
| 5 | **Housing & Property** | Homeowner vs renter, mortgage-to-income ratio, first-time buyer indicator | 10 points, mixed |
| 6 | **Investing & Wealth Building** | Regular contribution habits (pound-cost averaging), investment-to-savings ratio | 8 points, mostly Limited |
| 7 | **Pensions & Retirement** | Workplace auto-enrolment levels, pension tax relief band estimation | 9 points, mostly Future |
| 8 | **Protection & Insurance** | Premium payments detection, protection gap estimation | 8 points, mostly Now |
| 9 | **Tax & Allowances** | Estimated income tax band, self-assessment indicator, Marriage Allowance eligibility | 8 points, mixed |
| 10 | **Behavioural & Engagement** | Impulse spending patterns, pay-yourself-first behaviour, financial engagement score | 10 points, mostly Now |
| 11 | **User Profile & Life Stage** | Household size inference, dependants indicator, employment status | 9 points, mixed |

**Availability key:** Now = accessible via current UK Open Banking AISP APIs. Partial = provider-dependent or requires inference. Limited = select platforms only. Future = dependent on Pensions Dashboards or Open Finance regulation.

## How Data Powers Personalisation

1. **Programme recommendations:** Financial signals trigger recommendations. Example: high credit utilisation -> recommend Understanding Credit programme.
2. **Apply to My Money (per-question):** The 3 financial numbers in each v2_interactive lesson's ATMI section are populated from real user data when available, making insights personal rather than hypothetical.
3. **Goal tracking:** For savings-related goals, Open Banking data shows actual savings balance progress toward the target.

## Open Banking Agent Architecture (Day 2)

The Open Banking Agent acts as a middleware data-mapper:

1. Intercepts the lesson JSON before it is sent to the user.
2. Reads the `applyToMyMoney` arrays in each question's `learnMore` object.
3. Replaces variable placeholders with live user data fetched from TrueLayer/Finexer.

**Critical guardrail:** Raw transaction data is NEVER passed to the LLM. Only derived signals (like `verifiedMonthlyIncome`) can be processed.

**Fallback logic:** If a user has not connected their bank, or the data is missing, the agent MUST replace the variable with either a generic educational fallback string or a UI input field where the user can enter their own number.

## User Control

- Users connect or disconnect Open Banking at any time from their Profile.
- When disconnected, ATMI sections use user-input values or sensible defaults.
- Data consent is re-confirmed every 90 days (PSD2 requirement).
- Users can request deletion of all derived signals at any time.

## Agent Specification

The full Day 2 Open Banking Agent specification is in `functions/docs/day2_open_banking_agent.md` (created as part of Blueprint Prompt 4).
