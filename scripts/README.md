# Scripts

Utility scripts for managing the Mulo AI platform from the command line.

## sync_curriculum.js

Syncs hand-crafted core lesson content from the Cursor monorepo to Firestore.

### What it does

1. Scans `requirements/content/programmes/` for programme folders
2. **Phase 1 (programme):** Reads `programme.md` in each folder, parses YAML frontmatter (`programmeName`, `category`, `persona`, `estimatedTime`, `lessonCount`, `lessons` array), validates, and syncs to Firestore `programmes/{programmeId}`
3. **Phase 2 (lessons):** Reads each lesson `.md` file (skipping `programme.md`)
4. Routes files ending in `.v2.md` to the v2 parser; all other `.md` files use the v1 parser
5. Parses YAML frontmatter for lesson metadata (including files that start with a blockquote before the first `---` block)
6. **Validates** parsed lessons before any Firestore write: v1 screen count 8–11, question/summary field checks; v2 exactly 5 questions, `learnMore` structure (5 slides, 2 breakdown cards, takeaways, `correctIndex`, etc.)
7. **v1:** Parses `## Screen N: Type` headings into Shape A screen documents
8. **v2:** Parses `## Question N:` headings (including nested `### learnMore`) into Shape B screen documents
9. Writes lesson metadata to `core_lessons/{lesson-slug}` (v1) or `core_lessons/{lesson-slug}--v2` (v2), setting `lessonOrder` from the `programme.md` `lessons` array
10. Writes each screen to the `screens` collection with `lessonType: "core"` and matching `lessonFormat`
11. Clears existing core screens for that lesson id before re-syncing when the lesson **does** need a write
12. Stores **`sourceSha256`** on each `programmes` and `core_lessons` document (hash of the raw markdown file). If Firestore already matches that hash **and** (for lessons) the number of core `screens` rows equals the parsed count, that document is **skipped** (saves writes). If someone deleted the document or screens in the console, the next sync **recreates** them from the repo.
13. **Prune lessons:** After syncing, removes `core_lessons` documents (and their core `screens`) for each `programmeId` that are **no longer** represented by a file in that programme folder.
14. **Prune programmes:** Removes `programmes` documents whose id does not match a folder in `requirements/content/programmes/`. Cascades: deletes all `core_lessons` and `screens` for that programme.
15. Use **`--no-prune`** to turn pruning off. **`--force`** always re-writes (ignores the hash short-circuit).

### Prerequisites

```bash
npm install
```

**Team workflow (default):** Add GitHub Actions secret **`FIREBASE_SERVICE_ACCOUNT_JSON`** (full service account JSON). Pushes to **`main`** that touch `requirements/content/programmes/**` run **Sync curriculum to Firestore** — see **`docs/partner-curriculum-sync.md`**.

**Running sync on your own machine** (optional): the service account needs Firestore write access. Either:

- Put the JSON at **`.secrets/firebase-adminsdk.json`** (or the only `*.json` in `.secrets/`); the script sets `GOOGLE_APPLICATION_CREDENTIALS` if unset, **or**
- Set `GOOGLE_APPLICATION_CREDENTIALS` to the full path of the JSON file, **or**
- Use [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) (e.g. `gcloud auth application-default login`).

**Project ID:** If you see `unable to detect a project ID in the current environment`, the script reads **`projects.default` from `.firebaserc`** in the repo root and passes it to `initializeApp`. You can override with any of:

- `GCLOUD_PROJECT`
- `GOOGLE_CLOUD_PROJECT`
- `FIREBASE_PROJECT_ID`

Example (PowerShell):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccount.json"
npm run sync-curriculum
```

`firebase login` alone does **not** provide Admin SDK credentials; use a service account key or ADC as above.

### Usage

From the repository root:

```bash
npm run sync-curriculum
```

**Validate only (no Firebase init or writes)** — runs the same parsers and checks screen counts, required fields, v2 `learnMore` shape, and frontmatter:

```bash
npm run validate-curriculum
```

Equivalent: `node scripts/sync_curriculum.js --dry-run` (or `--validate-only`).

**Flags:** `--no-prune`, `--force` (see list above). Example:

```bash
node scripts/sync_curriculum.js --force
```

### File formats

**Programme (`programme.md`):** `templates/template-programme.md`
- YAML frontmatter with `programmeName`, `category`, `persona`, `estimatedTime`, `lessonCount`, and a `lessons` array (each entry: `slug` + `order`)
- The `lessons` array is the source of truth for lesson display order in the app
- Example:
  ```yaml
  ---
  programmeName: First Home Foundations
  category: Mortgage
  persona: Sarah (First-Time Buyer)
  estimatedTime: 10 mins
  lessonCount: 1
  lessons:
    - slug: first-home-deposits-explained
      order: 1
  ---
  ```

**V1 (`{slug}.md`):** `templates/template-core-lesson.md`
- YAML frontmatter with `category`, `programmeId`, `lessonName`, `lessonLevel`, `lessonTime`, `persona`, `screenCount`
- `## Screen N: Type` headings with `**fieldName:**` pairs; MCQ options as `- A) ...`

**V2 (`{slug}.v2.md`):** `templates/template-core-lesson-v2.md`
- YAML frontmatter includes `lessonFormat: v2_interactive` and `screenCount: 5`
- `## Question N:` headings with options as `- 0)` … `- 3)` and a `### learnMore` block per question
