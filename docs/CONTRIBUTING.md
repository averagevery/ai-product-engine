# Contributing to Mulo AI

This repository uses a **review-first** workflow: work happens on branches, changes land on `main` only through Pull Requests. The **repository owner** is the only person who should merge PRs into `main`.

## Why this model (GitHub Free, private repo)

On **GitHub Free** with a **private** repository, **branch protection** and **required code owner reviews** are not available in the same way as on paid plans. To enforce “only the owner merges to `main`” in practice, use **collaborator permissions** plus either a **fork** workflow or strict habits.

| Collaborator role | Can push to `main`? | Typical workflow |
|-------------------|---------------------|------------------|
| **Read** | No | Fork the repo → branch on the fork → open a PR to upstream. **Only the owner can merge.** |
| **Write** | Yes (unless you add rules you may not have on Free) | Same-repo branches + PRs are possible, but collaborators *could* push to `main` unless you use paid branch protection. Prefer **Read** + fork if you need hard enforcement. |

**Recommendation for collaborators:** invite them with **Read** access and use the fork workflow below. The owner keeps **Admin** and is the only account that merges PRs.

---

## Workflow for collaborators (Read access + fork)

1. **Fork** this repository on GitHub (your own copy under your account).
2. **Clone your fork** locally (or add it as `origin` and add the upstream repo as `upstream`).
3. **Create a branch** for your change (never commit on `main` in the fork):

   ```bash
   git checkout -b feature/short-description
   ```

4. **Commit** and **push** the branch to **your fork**:

   ```bash
   git push -u origin feature/short-description
   ```

5. On GitHub, open a **Pull Request** from your fork’s branch into the **upstream** `main` branch.
6. **Wait for review.** The repository owner reviews and **merges** when ready.

### Keeping your fork in sync (optional)

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

(Use `upstream` as the remote name for the original Mulo repo.)

---

## Workflow for collaborators (Write access, same repository)

If you intentionally grant **Write** so people can push branches on the same repo (no fork):

1. Create a branch from `main`: `git checkout -b feature/short-description`
2. Push the branch: `git push -u origin feature/short-description`
3. Open a **Pull Request** into `main`.
4. **Do not merge** unless you are the owner; on Free private repos, GitHub may not block merges for all collaborators—follow this rule by agreement.

For stricter enforcement without upgrading GitHub, prefer **Read** + fork.

---

## Owner (CEO) responsibilities

- Merge PRs into `main` after review.
- Keep collaborator access at **Read** unless there is a strong reason for **Write**.
- If you later move to **GitHub Pro** (or make the repo **public**), you can add **branch protection** on `main` and use `.github/CODEOWNERS` to require your approval automatically.

---

## Related files

- `.github/CODEOWNERS` -- documents intended code owners (fully enforced when branch protection + code owners are available on your plan).
- `README.md` -- high-level GitOps overview.
