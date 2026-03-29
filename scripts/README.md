# Scripts

Utility scripts for managing the Mulo AI platform from the command line.

## sync_curriculum.js

Syncs hand-crafted core lesson content from the Cursor monorepo to Firestore.

### What it does

1. Scans `requirements/content/programmes/` for programme folders
2. Reads each `.md` lesson file (skipping `programme.md`)
3. Parses YAML frontmatter for lesson metadata
4. Parses `## Screen N: Type` headings for individual screen content
5. Writes lesson metadata to `core_lessons/{lesson-slug}` in Firestore
6. Writes each screen to the `screens` collection with `lessonType: "core"`
7. Clears existing core screens for a lesson before re-syncing (idempotent)

### Prerequisites

```bash
npm install
```

You must be authenticated with Firebase. Either:
- Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to a service account key file, or
- Run `firebase login` and ensure the default project is set

### Usage

From the repository root:

```bash
npm run sync-curriculum
```

### File format

Lesson files must follow the `templates/template-core-lesson.md` format:
- YAML frontmatter with `category`, `programmeId`, `lessonName`, `lessonLevel`, `lessonTime`, `persona`, `screenCount`
- `## Screen N: Type` headings with `**fieldName:**` key-value pairs for screen content
- Multiple-choice options as `- A) Option text` list items
