> **File Summary & Purpose:** This is the behavioural rulebook for the Day 2 Open Banking Agent. It acts as a middleware data-mapper that intercepts lesson JSON before delivery to the user, replacing Apply to My Money placeholders with live financial data from TrueLayer/Finexer. This agent is isolated for Day 2 and should not be implemented during the Day 1 MVP.

# Open Banking Data Agent (Day 2)

## 1. Agent Role

The Open Banking Agent is a **middleware data-mapper**. It does not generate content -- it personalises existing content by injecting real financial data into the `applyToMyMoney` sections of v2_interactive lessons.

**Pipeline position:** After the Maker-Checker loop produces a PASS'd lesson, and before the lesson is delivered to the user, the Open Banking Agent intercepts the JSON to populate ATMI fields.

## 2. Data Flow

```
User opens lesson
    |
    v
App reads screens from Firestore
    |
    v
Open Banking Agent intercepts (client-side or Cloud Function)
    |
    v
For each screen with applyToMyMoney:
    |
    +-- User has Open Banking connected?
    |     |
    |     Yes --> Fetch derived signals from user's financial profile
    |     |       Replace inputLabels with real values
    |     |       Personalise insights with actual numbers
    |     |
    |     No --> Replace with fallback (generic text or user-input field)
    |
    v
Render personalised lesson to user
```

## 3. Data Mapping Rules

The agent maps derived Open Banking signals to the `applyToMyMoney` fields in each question's `learnMore` object.

### Input Sources

| Source | Description | Storage |
|--------|-------------|---------|
| Derived signals | Aggregated metrics calculated from raw transaction data | Stored per-user in a `financial_profile` collection (derived signals only, never raw transactions) |
| User-input values | Numbers the user enters manually when Open Banking is not connected | Stored in local app state, not persisted to Firestore |
| Constants | Regulatory values (ISA limits, tax thresholds) | `constants` collection (see `apply-to-my-money.md`) |

### Signal Categories

The agent draws from 11 categories of derived signals (111 total data points). Full catalogue: `knowledge/day2-open-banking.md` and `reference_docs/mulo-open-banking-data-points.docx.md`.

Key signals mapped per topic:

| Lesson Topic | Signals Used | Example Mapping |
|-------------|-------------|-----------------|
| Deposits / Savings | `totalSavingsBalance`, `savingsRate`, `emergencyFundMonths` | inputLabel "Your savings" -> £12,400 |
| Mortgages | `verifiedMonthlyIncome`, `rentAmount`, `firstTimeBuyerIndicator` | inputLabel "Your income" -> £3,200/month |
| Credit / Debt | `creditUtilisationRatio`, `totalDebtToIncomeRatio`, `bnplObligations` | inputLabel "Credit used" -> 42% |
| Pensions | `workplacePensionContribution`, `pensionTaxReliefBand` | inputLabel "Your contribution" -> 5% |
| Budgeting | `totalMonthlyExpenditure`, `essentialVsDiscretionarySplit`, `subscriptionCount` | inputLabel "Monthly spend" -> £2,100 |

## 4. Critical Guardrails

### Data Minimisation (Non-Negotiable)

* Raw transaction data is NEVER stored. Only derived, aggregated signals are persisted.
* Raw transaction data is NEVER passed to any LLM. The Open Banking Agent operates on pre-computed signals only.
* Derived signals are stored in the `financial_profile` collection with the user's ID. No transaction-level detail is retained.

### Privacy Controls

* Users can connect or disconnect Open Banking at any time from their Profile.
* Data consent is re-confirmed every 90 days (PSD2 requirement).
* Users can request deletion of all derived signals at any time (GDPR right to erasure).
* When a user disconnects, all derived signals are immediately purged from `financial_profile`.

### FCA Compliance

* The agent MUST NOT generate financial advice. It injects data into educational content -- the content itself is already compliance-approved by the Maker-Checker loop.
* Personalised insights must use educational framing: "Based on your numbers, here's how this applies to you" -- never "You should do X".
* The ATMI disclaimer must always be displayed: "Based on general UK guidelines. Not personalised financial advice."

## 5. Fallback Logic

If a user has not connected Open Banking, or specific data points are missing:

| Scenario | Fallback Behaviour |
|----------|-------------------|
| Open Banking not connected | Replace ATMI number cards with user-input fields (text inputs where the user can enter their own values) |
| Specific signal missing (e.g., no pension data detected) | Replace that specific input with a generic educational string (e.g., "Check your payslip for your contribution rate") |
| Open Banking API error | Gracefully degrade to user-input fields. Log the error. Do not show error messages to the user. |
| Stale data (consent expired, 90+ days) | Prompt re-consent before displaying personalised data. Fall back to user-input fields until re-consented. |

## 6. Database Contract (Firestore)

| Collection | Read/Write | Fields Required |
|------------|------------|-----------------|
| `financial_profile` | READ/WRITE | `userId`, `lastUpdated` (Timestamp), `consentExpiresAt` (Timestamp), `signals` (map of all derived signals grouped by category) |
| `screens` | READ | `learnMore.applyToMyMoney` fields (to identify which signals are needed) |
| `users` | READ | `openBankingConnected`, `userId` |
| `constants` | READ | Regulatory values used alongside Open Banking data |

## 7. Implementation Notes

* This agent may be implemented as a Cloud Function or as client-side logic in FlutterFlow, depending on latency and security requirements. Cloud Function is preferred for data isolation.
* The `financial_profile` collection should be secured with Firestore rules: only the owning user and the Open Banking Agent's service account can read/write.
* Signal refresh frequency: derived signals should be recalculated when the user opens the app (if more than 24 hours since `lastUpdated`), not on every lesson load.
* The 111 data points span "Now" (68), "Partial" (22), "Limited" (10), and "Future" (11) availability. The agent should gracefully handle missing signals for data points that are not yet available from the provider.
