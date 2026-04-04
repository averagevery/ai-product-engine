# Mulo AI Glossary

## Purpose

Domain-specific terminology used across the Mulo platform. AI agents should use these definitions consistently.

## Platform Terms

| Term | Definition |
|------|-----------|
| **Programme** | A focused learning journey containing exactly 5 lessons. Sits within a Topic. Takes approximately 10 minutes to complete. |
| **Lesson** | A single learning session within a programme. Contains either 8-11 screens (v1_swipe) or 5 questions (v2_interactive). Takes approximately 2 minutes. |
| **Screen** | An individual unit of content within a lesson. In v1_swipe: a Standard, Question, or Summary screen. In v2_interactive: a question with feedback and Learn More drill-down. |
| **Topic** | The broadest content category (e.g. Property, Investing, Debt & Credit). Groups related programmes. |
| **Learn More** | The scrollable drill-down page in v2_interactive lessons. Contains Hero, Quick Summary, Deep-Dive Cards, Takeaways, and Apply to My Money. |
| **Deep-Dive Cards** | Three tappable cards in the Learn More page: Real World Example (story carousel), Breakdown (visual cards), and Trusted Tool (action link). Each opens as a lightbox. |
| **Goal** | A user's selected financial objective (e.g. "Buy my first home"). Drives programme recommendations and surfaces goal badges on relevant programme cards. |
| **Goal Badge** | A visual indicator on programme cards showing alignment with the user's selected goal. Updates immediately when the user changes their goal. |
| **XP** | Experience points earned by answering questions. 20 XP per correct answer, +50 bonus for a perfect 5/5 lesson score. |
| **North Star Goal** | The user's primary financial goal, always visible at the top of the Home screen. |

## Architecture Terms

| Term | Definition |
|------|-----------|
| **Maker-Checker Loop** | The core safety mechanism. A Creator Agent (Maker) drafts content, then a Compliance Agent (Checker) validates it against FCA rules. Only PASS allows a Firestore write. Maximum 3 attempts. |
| **Creator Agent** | The Maker in the Maker-Checker loop. Drafts lesson content as structured JSON. Routes to v1_swipe or v2_interactive guidelines based on `lessonFormat`. |
| **Compliance Agent** | The Checker in the Maker-Checker loop. Validates content against FCA Consumer Duty rules. Returns `{ "status": "PASS" | "FAIL", "reasoning": "string" }`. |
| **Design Agent** | Post-PASS agent that generates or reuses Lottie visual assets. Only applies to v1_swipe lessons. |
| **Telemetry Agent** | Analyses user feedback, quiz results, and engagement data to suggest curriculum improvements. |
| **Orchestrator Agent** | The central coordinator that manages the 9-agent pipeline. Not yet implemented. |
| **GitOps** | The architectural principle that this repository is the single source of truth. All agent rules, prompts, and curriculum live here and are deployed from here. |
| **Living Prompt** | An AI Source Prompt block at the top of every generated document. To update the document, edit the prompt and regenerate rather than manually rewriting. |
| **lessonFormat** | A string field (`"v1_swipe"` or `"v2_interactive"`) on each `core_lessons`, `user_lessons`, and `screens` document. Tells the app and agents which JSON shape applies. User requests still generate **both** formats; this field distinguishes each stored variant. |

## Data Terms

| Term | Definition |
|------|-----------|
| **core_lessons** | Firestore collection for hand-crafted lessons synced from the Cursor monorepo (paired `{slug}` and `{slug}--v2` documents per logical lesson). Read-only in the app. |
| **user_lessons** | Firestore collection for AI-generated lessons created by the Maker-Checker pipeline. Read/write in the app. |
| **screens** | Flat Firestore collection containing individual screen documents. Linked to parent lessons via `lessonId`. Distinguished by `lessonType` (`"core"` or `"user"`). |
| **lesson_requests** | Firestore collection that triggers the Maker-Checker pipeline via `onDocumentCreated`. Each new document causes two independent runs (v1 + v2); outcomes are merged into `v1_lessonId`, `v2_lessonId`, and `status` (`completed` / `partial` / `failed_compliance`). |
| **agent_logs** | Audit trail collection for all agent failures and loop iterations. |
| **compliance_audit** | A mandatory field on every lesson document proving it passed FCA validation. Contains status, reasoning, attempt number, and timestamp. |
| **ATMI** | Apply to My Money. The personalised financial insight feature. Day 1: separate card with hardcoded constants. Day 2: per-question section in Learn More powered by Open Banking data. |
| **Derived signals** | Aggregated, anonymised metrics calculated from raw Open Banking transaction data. Raw data is never stored. Example: `verifiedMonthlyIncome`, `emergencyFundMonths`. |
| **constants** | A Firestore collection of verified regulatory values (ISA limits, tax thresholds) that are hardcoded and manually updated. Used by the Day 1 ATMI architecture. |

## Financial Education Terms

| Term | Definition |
|------|-----------|
| **FCA** | Financial Conduct Authority. The UK regulator governing financial services. |
| **Consumer Duty** | FCA regulation (PS22/9) requiring firms to act in good faith, avoid foreseeable harm, and support customer understanding. |
| **PISA Framework** | OECD Programme for International Student Assessment financial literacy framework. Defines four knowledge pillars used by Mulo's `financial_standards.md`. |
| **AISP** | Account Information Service Provider. Mulo's role under PSD2 when accessing Open Banking data. |
| **PSD2** | Payment Services Directive 2. EU/UK regulation enabling Open Banking. Requires consent re-confirmation every 90 days. |
