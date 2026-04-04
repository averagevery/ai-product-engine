# Scripts

Utility scripts for managing the Mulo AI platform from the command line.

## sync_curriculum.js

Syncs hand-crafted core lesson content from the Cursor monorepo to Firestore.

### What it does

1. Scans `requirements/content/programmes/` for programme folders
2. Reads each lesson `.md` file (skipping `programme.md`)
3. Routes files ending in `.v2.md` to the v2 parser; all other `.md` files use the v1 parser
4. Parses YAML frontmatter for lesson metadata (including files that start with a blockquote before the first `---` block)
5. **Validates** parsed lessons before any Firestore write: v1 screen count 8–11, question/summary field checks; v2 exactly 5 questions, `learnMore` structure (5 slides, 2 breakdown cards, takeaways, `correctIndex`, etc.)
6. **v1:** Parses `## Screen N: Type` headings into Shape A screen documents
7. **v2:** Parses `## Question N:` headings (including nested `### learnMore`) into Shape B screen documents
8. Writes lesson metadata to `core_lessons/{lesson-slug}` (v1) or `core_lessons/{lesson-slug}--v2` (v2)
9. Writes each screen to the `screens` collection with `lessonType: "core"` and matching `lessonFormat`
10. Clears existing core screens for that lesson id before re-syncing (idempotent), only after validation passes

### Prerequisites

```bash
npm install
```

You must be authenticated with Firebase Admin (Firestore writes). Either:

- Set `GOOGLE_APPLICATION_CREDENTIALS` to a **service account JSON** path (recommended for CI and local sync). The account needs Firestore write access to your project.
- Or use [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) (e.g. `gcloud auth application-default login`).

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

### File formats

**V1 (`{slug}.md`):** `templates/template-core-lesson.md`
- YAML frontmatter with `category`, `programmeId`, `lessonName`, `lessonLevel`, `lessonTime`, `persona`, `screenCount`
- `## Screen N: Type` headings with `**fieldName:**` pairs; MCQ options as `- A) ...`

**V2 (`{slug}.v2.md`):** `templates/template-core-lesson-v2.md`
- YAML frontmatter includes `lessonFormat: v2_interactive` and `screenCount: 5`
- `## Question N:` headings with options as `- 0)` … `- 3)` and a `### learnMore` block per question
