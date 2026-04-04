# Partner guide: core lessons → live in the app

How hand-crafted lessons in **`requirements/content/programmes/`** get into Firestore so the app can read them.

This flow does **not** deploy Cloud Functions (the Maker-Checker engine). That only matters when someone changes backend code under `functions/`.

## How it works (PR → `main` → Firebase)

1. **You (owner)** add a **one-time** GitHub secret:
   - Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: **`FIREBASE_SERVICE_ACCOUNT_JSON`**
   - Value: paste the **entire** Firebase Admin SDK service account JSON (same Firebase project as `.firebaserc`).

2. The workflow **Sync curriculum to Firestore** (`.github/workflows/sync-curriculum.yml`) runs when:
   - A push to **`main`** changes files under **`requirements/content/programmes/**`**, or  
   - Someone clicks **Run workflow** on the Actions tab (manual run).

3. **Merging a PR into `main`** counts as a push to `main`. If that merge includes changes under `requirements/content/programmes/**`, the workflow runs and updates **`core_lessons`** and **`screens`** in Firestore.

4. **Partner workflow:** edit lessons in Cursor → open a **pull request** → you **review and merge** → check **Actions** for a green run.

**Optional check before opening a PR:** `npm run validate-curriculum` (parses and validates markdown only; no Firebase login needed).

## If the workflow fails

- **Validation errors:** Fix the lesson markdown (counts, required fields, v2 `learnMore` shape). The log shows which lesson failed.
- **Auth errors:** The JSON in `FIREBASE_SERVICE_ACCOUNT_JSON` must be for a service account that can write Firestore on this project.
- **Workflow did not run:** Confirm the merged files are under `requirements/content/programmes/`. For a sync without a programme change, use **Actions → Run workflow** manually.

Technical detail for maintainers: `scripts/README.md`.
