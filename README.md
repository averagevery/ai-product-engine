# Mulo AI: The CEO Command Center

> People are not bad with money. They were never taught. Mulo exists to change that.

Mulo AI is an AI-native educational platform on a mission to help millions of people in the UK make better financial decisions through simple, personalised education. The product follows a strictly sequential user experience -- **See -> Learn -> Act** -- where users first see their financial data, then learn through micro-lessons, and only then act on education-informed decisions.

This repository is the **single source of truth** for the entire platform. Every agent prompt, compliance rule, product spec, and deployment config lives here. Nothing ships without version control.

---

## 1. Repository Architecture

The repository is organised into four key zones, each with a clear purpose.

### `requirements/` -- The Source of Truth for Product Specs

All product requirements live here, organised by type:

| Folder | Contains | Example |
|--------|----------|---------|
| `requirements/epics/` | Large initiative definitions | `EPIC-001-lesson-engine.md` |
| `requirements/features/` | Feature specifications scoped within epics | |
| `requirements/stories/` | User stories with boolean acceptance criteria | `STORY-001-lisa-basics.md` |
| `requirements/blueprints/` | Service blueprints mapping user journeys | `BP-001-user-onboarding.md` |

### `knowledge/` -- The Fact Base

Manually curated knowledge files that ground every AI interaction in real-world context:

| File | Purpose |
|------|---------|
| `knowledge/personas.md` | The five target personas (Sarah, James, Aisha, Tom, Chloe) |
| `knowledge/fca-regulations.md` | FCA Consumer Duty constraints -- the compliance boundary |
| `knowledge/market-context.md` | UK financial education competitive landscape |
| `knowledge/glossary.md` | Domain-specific terminology definitions |
| `knowledge/llms.txt` | Machine-readable project summary (AI agents read this first) |
| `docs/vision-and-product.md` | Product vision, mission, and the 3-layer architecture |

### `functions/` -- The 9-Agent Maker-Checker Engine (Protected)

The backend execution engine is **read-only** and protected by `.cursorignore`. No AI tool can modify these files:

| Folder | Contains |
|--------|----------|
| `functions/src/` | Cloud Function logic (the Maker-Checker `while` loop) |
| `functions/prompts/` | Gemini AI prompt definitions (one per agent) |
| `functions/docs/` | Agent behavioural rules and compliance documents |

The engine runs a 9-agent pipeline where a **Creator Agent** drafts content, a **Compliance Agent** validates it against FCA rules, and only a `"status": "PASS"` allows a Firestore write. Every write carries a `compliance_audit` trail. Failed drafts are logged to `agent_logs`.

### `.cursor/rules/` -- The AI Instruction Layer

Cursor rules govern how AI behaves in this repository. Three rules are always on, five are triggered manually:

| Rule | Type | Purpose |
|------|------|---------|
| `01-repo-standards.mdc` | Always on | GitOps standards, UK English, `europe-west2` deployment |
| `02-use-knowledge.mdc` | Always on | Knowledge routing, FCA compliance mandate |
| `03-design-system.mdc` | Always on | Colours, typography, word limits, Lottie constraints |
| `04-folder-integrity.mdc` | Always on | Prevents files in wrong directories |
| `create-epic.mdc` | @-mention | Drafts epics using the epic template |
| `create-story.mdc` | @-mention | Drafts stories with boolean acceptance criteria |
| `create-feature.mdc` | @-mention | Scopes features within the See / Learn / Act model |
| `create-service-blueprint.mdc` | @-mention | Maps user journeys as service blueprints |
| `create-api-spec.mdc` | @-mention | Generates RESTful API specs for Maker-Checker endpoints |

GitHub Copilot mirrors live in `.github/skills/` with matching `SKILL.md` files.

---

## 2. How to Contribute (The Non-Techy Guide)

You do not need to write code to contribute product specs. The AI does the heavy lifting.

**For the Partner:**

1. Open **Cursor Composer** (Cmd/Ctrl + I).
2. Type `@` to mention a skill, then describe what you need:
   - `@create-story` -- "Write a user story for Sarah learning about LISA penalties"
   - `@create-epic` -- "Define the epic for our savings education module"
   - `@create-feature` -- "Scope the Open Banking connection feature"
   - `@create-service-blueprint` -- "Map the onboarding journey from sign-up to first lesson"
3. The AI will automatically use the correct template from `templates/` and reference the right knowledge files from `knowledge/`.
4. The generated document is saved to `requirements/`.
5. Open a **Pull Request** for CEO review.

That's it. The AI handles formatting, compliance language, and file placement.

---

## 3. The GitOps Workflow (The Governance)

Every change follows a four-step review process. No exceptions.

### Step 1: Create a Branch

Never work directly on `main`. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

### Step 2: Draft with AI

Use the skills in `.cursor/rules/` (Cursor) or `.github/skills/` (Copilot) to generate or edit documents. The AI is pre-configured with the correct templates, personas, and compliance rules.

### Step 3: Open a Pull Request

Push your branch and open a PR. `CODEOWNERS` automatically assigns the required reviewers based on which files were changed.

### Step 4: CEO Approval

The Code Owner (`@ceo`) must approve all changes before they merge to the live engine. For collaborative zones (`requirements/`, `knowledge/`, `templates/`), the Partner can lead but CEO approval is still required.

| Zone | Who Approves | Paths |
|------|-------------|-------|
| Collaborative | Partner leads, CEO approves | `requirements/`, `knowledge/`, `templates/`, `functions/docs/` |
| Locked Engine | CEO only | `.cursor/rules/`, `.github/`, `functions/src/`, `.cursorignore` |
| Global fallback | CEO | Everything else |

---

## 4. Design & Compliance Commandments

These rules are enforced by `.cursor/rules/03-design-system.mdc` and `.cursor/rules/02-use-knowledge.mdc`. They are non-negotiable.

### UI Rules

| Constraint | Value |
|-----------|-------|
| Background | Near-black `#0A0A1A` |
| Primary colour | Electric blue `#3733E5` |
| CTA / Positive | Mint green |
| Typography | DM Sans (strict, no substitutions) |

### Mobile Screen Word Limits

All content is designed for 3-screen mobile micro-lessons:

| Element | Maximum |
|---------|---------|
| Headlines | 7 words |
| Body text | 25 words |
| Feedback screens | 15 words |

### Lottie Animations

Approved motifs: bank building, piggy bank, shield, coins, graduation cap, growth chart.

**Permanently banned:** the `$` symbol, flashy red effects, currency-specific iconography, realistic banknotes.

### FCA Compliance -- No Financial Advice

1. **Never** provide regulated financial advice.
2. **Never** recommend specific financial products or providers.
3. **Never** generate content that could be interpreted as a personal recommendation.
4. **Always** include disclaimers clarifying content is general education, not financial advice.

Full FCA constraints: `knowledge/fca-regulations.md`.

---

## 5. Quick Start for New Devs

### Prerequisites

- Node.js (v18+)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project linked in `.firebaserc`

### Install Dependencies

```bash
cd functions
npm install
```

### Run the Local Firebase Emulator

```bash
firebase emulators:start
```

This starts the Cloud Functions emulator locally, allowing you to test the Maker-Checker pipeline without deploying to production. All functions are configured to run in `europe-west2` (London) when deployed.

### Project Configuration

- **Firebase config:** `firebase.json` (functions source set to `functions/`)
- **Environment:** `.firebaserc` (project aliases)
- **Protected paths:** `.cursorignore` blocks AI from editing `functions/src/`, `functions/docs/`, `functions/prompts/`, and `reference_docs/`

---

## Full Directory Tree

```
mulo-ai-backend/
├── .cursor/
│   ├── rules/              # Cursor AI rules (.mdc files)
│   └── mcp.json            # MCP server configuration
├── .github/
│   ├── CODEOWNERS          # Role-based access control
│   └── skills/             # GitHub Copilot Agent Skills
├── docs/
│   └── vision-and-product.md
├── functions/              # PROTECTED -- READ-ONLY
│   ├── docs/               # Agent behavioural rules
│   ├── prompts/            # Agent prompt definitions
│   └── src/                # Backend execution logic
├── knowledge/              # Manually curated fact base
├── reference_docs/         # Historical reference material
├── requirements/           # Product specs (epics, stories, blueprints)
├── templates/              # Fill-in-the-blank document templates
├── .cursorignore           # AI write protection
├── .firebaserc
├── firebase.json
└── README.md
```
