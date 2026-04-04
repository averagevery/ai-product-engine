# Mulo AI: The CEO Command Center

> People are not bad with money. They were never taught. Mulo exists to change that.

Mulo AI is an AI-native educational platform on a mission to help millions of people in the UK make better financial decisions through simple, personalised education. The product follows a strictly sequential user experience -- **See -> Learn -> Act** -- where users first see their financial data, then learn through micro-lessons, and only then act on education-informed decisions.

This repository is the **single source of truth** for the entire platform. Every agent prompt, compliance rule, product spec, and deployment config lives here. Nothing ships without version control.

---

## 1. Repository Architecture

The repository is organised into four key zones, each with a clear purpose.

### The Hybrid Architecture

```
Cursor Monorepo (GitOps)
    │
    ├── npm run sync-curriculum ──► Firestore: programmes + core_lessons + screens
    │                                (hand-crafted, read-only in app)
    │
    └── firebase deploy ──► Cloud Functions ──► Firestore: user_lessons + screens
                              (Maker-Checker: v2_interactive; read/write in app)
                                        │
                                        ▼
                              FlutterFlow App (reads both)
```

Two lesson paths feed the same `screens` collection, distinguished by `lessonType` (`"core"` or `"user"`):

| Path | Collection | Source |
|------|-----------|--------|
| Hand-crafted curriculum | `core_lessons` | Written in Cursor as markdown files (`{slug}.md`), synced via `npm run sync-curriculum` |
| AI-generated lessons | `user_lessons` | Maker-Checker pipeline generates a single `v2_interactive` lesson per request |

### `requirements/` -- The Source of Truth for Product Specs

All product requirements live here, split into two domains:

| Folder | Domain | Contains |
|--------|--------|----------|
| `requirements/content/programmes/{name}/` | Curriculum | Programme folder with `programme.md` + lesson `.md` files |
| `requirements/features/` | Engineering | UX/UI feature specs with database connections |

### `knowledge/` -- The Fact Base

Manually curated knowledge files that ground every AI interaction in real-world context:

| File | Purpose |
|------|---------|
| `knowledge/personas.md` | The five target personas (Sarah, James, Aisha, Tom, Chloe) |
| `knowledge/fca-regulations.md` | FCA Consumer Duty constraints -- the compliance boundary |
| `knowledge/market-context.md` | UK financial education competitive landscape |
| `knowledge/glossary.md` | Domain-specific terminology definitions |
| `knowledge/onboarding-routing.md` | 8-screen onboarding flow, goal routing, experience routing |
| `knowledge/day2-open-banking.md` | Open Banking data principles, signal categories, agent architecture |
| `knowledge/llms.txt` | Machine-readable project summary (AI agents read this first) |
| `docs/vision-and-product.md` | Product vision, mission, and the 3-layer architecture |
| `docs/partner-guide.md` | Partner how-to: lessons, requirements, agent docs; PR → `main` → Action syncs programmes to Firestore |

### `functions/` -- The 9-Agent Maker-Checker Engine

The backend execution engine. Agent behavioural rules in `functions/docs/` are the **single source of truth** for what each agent does -- editing a file there directly changes the agent's runtime behaviour.

| Folder | Contains |
|--------|----------|
| `functions/src/` | Cloud Function logic (the Maker-Checker loop, writes to `user_lessons`) |
| `functions/prompts/` | Gemini AI prompt definitions (one per agent) |
| `functions/docs/` | Agent behavioural rules, compliance constraints, and design guidelines (editable) |

The engine runs a 9-agent pipeline where a **Creator Agent** drafts content, a **Compliance Agent** validates it against FCA rules, and only a `"status": "PASS"` allows a Firestore write. Every write carries a `compliance_audit` trail. Failed drafts are logged to `agent_logs`.

### `.cursor/rules/` -- The AI Instruction Layer

Cursor rules govern how AI behaves in this repository. Five rules are always on, six are triggered manually:

| Rule | Type | Purpose |
|------|------|---------|
| `01-repo-standards.mdc` | Always on | GitOps standards, UK English, `europe-west2` deployment |
| `02-use-knowledge.mdc` | Always on | Knowledge routing, FCA compliance mandate |
| `03-design-system.mdc` | Always on | Colours, typography, word limits, Lottie constraints |
| `04-folder-integrity.mdc` | Always on | Prevents files in wrong directories |
| `05-update-docs.mdc` | Always on | Doc sync protocol: living reference registry, change-to-doc matrix, mandatory closing verification (see rule file) |
| `create-programme.mdc` | @-mention | Creates programme folders in `requirements/content/programmes/` |
| `create-lesson.mdc` | @-mention | Drafts lesson briefs or core lessons (`{slug}.md`) inside programme folders |
| `create-feature.mdc` | @-mention | Drafts feature specs to `requirements/features/` |
| `create-agent.mdc` | @-mention | Creates or updates agent rules in `functions/docs/` |
| `create-blueprint.mdc` | @-mention | Maps user journeys as service blueprints to `docs/` |
| `create-api-spec.mdc` | @-mention | Generates RESTful API specs for Maker-Checker endpoints |

GitHub Copilot mirrors live in `.github/skills/` with matching `SKILL.md` files. The **update-docs** skill points at `.cursor/rules/05-update-docs.mdc` as the single matrix source — do not duplicate the full matrix in the skill file.

---

## 2. How to Contribute (The Non-Techy Guide)

You do not need to write code to contribute product specs. The AI does the heavy lifting.

**For the Partner:** Step-by-step setup, npm vs optional, lesson prompts, PR flow, and curriculum sync are in **[docs/partner-guide.md](docs/partner-guide.md)**.

1. Open **Cursor Composer** (Cmd/Ctrl + I).
2. Type `@` to mention a skill, then describe what you need:
   - `@create-programme` -- "Define the LISA savings education programme for Sarah"
   - `@create-lesson` -- "Write a core lesson on LISA penalties for the lisa-savings programme"
   - `@create-feature` -- "Scope the Open Banking connection feature"
   - `@create-agent` -- "Update the compliance rules to add a new FCA constraint"
3. The AI will automatically use the correct template from `templates/` and reference the right knowledge files from `knowledge/`.
4. The generated document is saved to the appropriate folder.
5. Open a **Pull Request** for CEO review.

That's it. The AI handles formatting, compliance language, and file placement.

**Full contributor workflow (branches, forks, who merges):** see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

---

## 3. The GitOps Workflow (The Governance)

Every change follows a review process: **branch → pull request → owner merges to `main`**. Nobody should push directly to `main`.

### For collaborators

1. **Create a branch** (or use a fork if you have Read-only access -- see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)).
2. **Draft changes** (with AI skills in `.cursor/rules/` or `.github/skills/` where helpful).
3. **Open a Pull Request** targeting `main`.
4. **Repository owner** reviews and **merges** the PR.

On **GitHub Free** private repositories, enforced “only owner can merge” is achieved by giving collaborators **Read** access and using **forks + PRs**; the owner is then the only account that can merge. See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for step-by-step Git commands.

### For the owner (CEO)

- Keep **merge** as your step: you are the gate for `main`.
- `.github/CODEOWNERS` records intended ownership; automatic required reviews apply when your GitHub plan supports branch protection and code owners on this repo.

---

## 4. Design & Compliance Commandments

These rules are enforced by `.cursor/rules/03-design-system.mdc` and `.cursor/rules/02-use-knowledge.mdc`. They are non-negotiable.

### UI Rules

| Constraint | Value |
|-----------|-------|
| Background | Near-black `#0A0A1A` |
| Primary colour | Electric blue `#5753FF` |
| CTA / Positive | Mint green |
| Typography | DM Sans (strict, no substitutions) |

### Mobile Screen Word Limits

| Element | Maximum |
|---------|---------|
| Headlines | 7 words |
| Body text | 25 words |
| Feedback banners | 30 words |

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
# Root dependencies (for sync script)
npm install

# Cloud Functions dependencies
cd functions
npm install
```

### Run the Local Firebase Emulator

```bash
firebase emulators:start
```

This starts the Cloud Functions emulator locally, allowing you to test the Maker-Checker pipeline without deploying to production. All functions are configured to run in `europe-west2` (London) when deployed.

### Sync Core Curriculum to Firestore

After creating or editing lesson files in `requirements/content/programmes/`:

```bash
npm run sync-curriculum
```

This pushes programme metadata to `programmes`, and hand-crafted core lessons to `core_lessons` and `screens` in Firestore. Each `core_lessons` doc gets a `lessonOrder` field from `programme.md`. The sync is idempotent -- unchanged files are skipped, and orphaned programmes/lessons are pruned.

Check lessons without touching Firestore (parsers + validation only):

```bash
npm run validate-curriculum
```

Before merging structural or doc-touching work, confirm living reference files still exist (registry in `scripts/check_reference_docs.js`, canonical list in `.cursor/rules/05-update-docs.mdc`):

```bash
npm run verify-reference-docs
```

**Firestore sync (curriculum):** Default path is **GitHub Actions** — secret `FIREBASE_SERVICE_ACCOUNT_JSON`, workflow runs on push to `main` when `requirements/content/programmes/**` changes (including PR merges). See **`docs/partner-guide.md`**. For optional local runs: `.secrets/firebase-adminsdk.json` or `GOOGLE_APPLICATION_CREDENTIALS`; project ID from `.firebaserc`. Full detail: `scripts/README.md`.

Example core lessons: `requirements/content/programmes/buying-your-first-home/first-home-deposits-explained.md` and `how-to-start-building-a-deposit.md`.

### Project Configuration

- **Firebase config:** `firebase.json` (functions source set to `functions/`)
- **Environment:** `.firebaserc` (project aliases)
- **Agent rules:** Edit agent behaviour directly in `functions/docs/` -- changes take effect on next deployment
- **Root scripts:** `package.json` (curriculum sync, `validate-curriculum`, `verify-reference-docs`)

---

## Full Directory Tree

```
mulo-ai-backend/
├── .cursor/
│   ├── rules/                    # Cursor AI rules (.mdc files)
│   └── mcp.json                  # MCP server configuration
├── .github/
│   ├── CODEOWNERS                # Role-based access control
│   ├── skills/                   # GitHub Copilot Agent Skills
│   └── workflows/
│       ├── sync-curriculum.yml   # Push programmes/ on main → Firestore sync (needs repo secret)
│       └── verify-reference-docs.yml # PR/push: living reference files exist (see 05-update-docs.mdc)
├── docs/
│   ├── CONTRIBUTING.md           # Branch / fork / PR workflow for collaborators
│   ├── partner-guide.md          # Partner how-to + PR → main → curriculum sync to Firestore
│   └── vision-and-product.md     # Product vision, 3-layer model, app structure
├── functions/                    # Backend engine + agent rules
│   ├── docs/                     # Agent behavioural rules (single source of truth)
│   │   ├── agent_architecture.md
│   │   ├── compliance_rules.md
│   │   ├── day2_open_banking_agent.md
│   │   ├── design_guidelines.md
│   │   ├── financial_standards.md
│   │   ├── lesson_guidelines.md      # Interactive format rules (v2_interactive)
│   │   └── telemetry_rules.md
│   ├── prompts/                  # Agent prompt definitions
│   └── src/                      # Backend execution logic
├── knowledge/                    # Manually curated fact base
│   ├── day2-open-banking.md
│   ├── fca-regulations.md
│   ├── glossary.md
│   ├── llms.txt
│   ├── market-context.md
│   ├── onboarding-routing.md
│   └── personas.md
├── reference_docs/               # Historical reference material (read-only)
├── requirements/
│   ├── content/
│   │   └── programmes/           # Programme folders (programme.md + lesson files)
│   └── features/                 # App feature specifications
│       ├── analytics-tracking.md
│       ├── apply-to-my-money.md
│       ├── core-system-architecture.md
│       ├── goals-system.md
│       ├── growth-tab.md
│       ├── home-screen.md
│       ├── learning-journey.md
│       ├── lesson-format.md
│       ├── notifications-nudges.md
│       ├── profile-tab.md
│       ├── programme-recommendations.md
│       ├── trending-content.md
│       ├── user-onboarding.md
│       └── xp-rewards.md
├── scripts/
│   └── sync_curriculum.js        # Syncs core lessons to Firestore
├── templates/                    # Fill-in-the-blank document templates
│   ├── template-agent.md         # Agent behavioural rule document template
│   ├── template-core-lesson.md   # Core lesson template (v2_interactive)
│   ├── template-feature.md
│   ├── template-lesson.md
│   ├── template-programme.md
│   └── template-service-blueprint.md
├── .cursorignore
├── .firebaserc
├── firebase.json
├── package.json                  # Root scripts (sync-curriculum)
└── README.md
```
