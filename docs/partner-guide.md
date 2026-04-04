# Partner guide

How to work in this repository as a **partner**: lessons, requirements, agent rules, and getting changes reviewed and live in the app.

Hand-crafted lessons live under **`requirements/content/programmes/`**. Pushing (via a merged PR) to **`main`** triggers **GitHub Actions** to sync them to Firestore so the app can read them. That path does **not** deploy Cloud Functions (the Maker-Checker engine). Deploying `functions/` code is a separate, engineering step.

---

## Who this is for

Partners who edit **curriculum**, **feature specs**, and **agent/templates** quality — using **Cursor** and **GitHub**. You do not need to be a backend engineer unless you are changing code under `functions/src/` or deploying Firebase.

---

## First-time setup

1. **GitHub access** — Your CEO invites you to the repo. Prefer **Read** access and a **fork** workflow so only the owner merges to `main`; see [CONTRIBUTING.md](CONTRIBUTING.md).
2. **Clone** the repo (or your fork) and **open the folder in Cursor**.
3. **Node / npm** — See the table below. You can contribute curriculum **without** installing Node if you rely on PR checks and the owner merging (Actions runs the sync).

### Do I need `npm install`?

| What you do | Need `npm install` at repo root? |
|-------------|-----------------------------------|
| Edit files under `requirements/content/programmes/`, open a PR, owner merges; **sync runs in GitHub Actions** | **No** — the workflow runs `npm ci` and syncs for you. |
| Run **`npm run validate-curriculum`** on your machine before opening a PR (optional but useful) | **Yes** — run once: `npm install`, then `npm run validate-curriculum`. |
| Run **`npm run sync-curriculum`** locally / work on scripts | **Yes** — plus Firebase service account setup; see [scripts/README.md](../scripts/README.md). |

Pull requests also run checks such as **`verify-reference-docs`** and (when curriculum files change) validation relevant to the repo — use a green CI run as a backstop if you skip local `npm install`.

---

## What to focus on (in order)

### 1. Generate and refine lessons

Hand-crafted core lessons are **paired** markdown files in each programme folder:

- `{slug}.md` — v1 swipe format  
- `{slug}.v2.md` — v2 interactive format  

Use Cursor **Composer** (Cmd/Ctrl + I), mention the skill with `@`, and describe what you need. See [README.md](../README.md) §2 for the full skill list.

**Example prompt (core lesson, both formats):**

```text
@create-lesson Add a paired core lesson for programme buying-your-first-home:
slug mortgage-basics-first-timer, lesson name "Mortgage basics for first timers",
beginner, Sarah (First-Time Buyer), UK English, FCA-safe general education only.
```

Adjust the programme folder, slug, and topic to match your work.

### 2. Requirements

Review **`requirements/features/`** for specs that match what the app should do. If something is missing or unclear, use **`@create-feature`** in Cursor to draft a new or updated spec (natural-language feature doc).

### 3. Agent rules and templates

**`functions/docs/`** defines how AI agents behave at runtime (compliance, lesson shapes, etc.). **`templates/`** defines blanks for new docs. After you create lessons, tighten these when you spot gaps so **automated** generation (Maker-Checker) stays aligned with hand-crafted quality. Use **`@create-agent`** when you need to change rules under `functions/docs/`.

---

## Opening a pull request (simple path)

You do not need to memorise Git commands.

1. In **Cursor** (chat or Composer), use a prompt like:

   ```text
   Create a new branch named partner/short-description-of-change, commit all current changes with a clear one-line message, push to the remote, and give me the exact GitHub URL to open a pull request into main.
   ```

   If you use a **fork** (Read access), say **push to my fork** and **open a PR from my fork into the upstream main** so the model targets the right remote.

2. **Click the link** Cursor or GitHub shows (for example **Compare & pull request** after the push). Add a short title and description, then create the PR.

3. **Wait for review** — the repository owner merges to `main`.

**Full git and fork steps:** [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Curriculum sync: how lessons reach the app (PR → `main` → Firebase)

### Owner setup (one time)

1. Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Name: **`FIREBASE_SERVICE_ACCOUNT_JSON`**
3. Value: paste the **entire** Firebase Admin SDK service account JSON (same Firebase project as `.firebaserc`).

### When sync runs

The workflow **Sync curriculum to Firestore** (`.github/workflows/sync-curriculum.yml`) runs when:

- A push to **`main`** changes files under **`requirements/content/programmes/**`**, or  
- Someone runs the workflow manually from the **Actions** tab.

**Merging a PR into `main`** counts as that push. The workflow updates Firestore collections **`programmes`**, **`core_lessons`**, and **`screens`**.

**Partner workflow:** edit in Cursor → **pull request** → owner **reviews and merges** → confirm **Actions** is green.

### What sync does (plain terms)

The **repository is the source of truth**. The sync pushes programme metadata from `programme.md` and lesson content from markdown. Edits in the repo update Firebase; **deleting** a programme or lesson in the repo removes it from Firebase (including lessons under a removed programme). If someone deleted data **only** in Firebase, the next successful sync **restores** it from the repo. Unchanged files are often **skipped** for speed (see [scripts/README.md](../scripts/README.md) for `--force` or `--no-prune`).

### Optional: validate before your PR

If you ran `npm install`:

```bash
npm run validate-curriculum
```

This parses and validates markdown only (no Firebase login).

You can also run:

```bash
npm run verify-reference-docs
```

---

## If the workflow fails

- **Validation errors:** Fix the lesson markdown (screen counts, required fields, `learnMore` shape). The Actions log shows which lesson failed.
- **Auth errors:** The secret **`FIREBASE_SERVICE_ACCOUNT_JSON`** must be a service account that can write Firestore on this project.
- **Workflow did not run:** Confirm merged files are under `requirements/content/programmes/`. To sync without a programme file change, use **Actions → Run workflow** manually.

**Technical detail for maintainers:** [scripts/README.md](../scripts/README.md).

---

## Reference documentation (do not skip)

When you rename folders, add scripts, or change rules, update living reference docs in the **same** PR. See `.cursor/rules/05-update-docs.mdc` and [CONTRIBUTING.md](CONTRIBUTING.md) §Reference documentation.
