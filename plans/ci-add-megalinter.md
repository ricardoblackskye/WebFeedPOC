# MegaLinter Integration Implementation Plan

> **For Hermes:** Follow the repository's strict TDD workflow: establish executable validation tests, verify RED, push tests for review, then implement only after approval.

**Goal:** Add a secure, repository-appropriate MegaLinter GitHub Actions workflow to WebFeedPOC without enabling automatic source rewrites initially.

**Architecture:** Add an independent `.github/workflows/mega-linter.yml` alongside the existing test CI. MegaLinter v10 runs on pushes and pull requests targeting `main`, validates the full codebase on `main` pushes and changed files on pull requests, and uploads reports as artifacts. A root `.mega-linter.yml` holds stable repository configuration.

**Technical Strategy:** Use `oxsecurity/megalinter@v10`, `actions/checkout@v6`, and `actions/upload-artifact@v7`. Use least-privilege workflow permissions (`contents: read`, `issues: write`, `pull-requests: write`) and do not configure `APPLY_FIXES`; MegaLinter must report issues without mutating branches. Enable JavaScript, JSON, YAML, Markdown, GitHub Actions, and repository linting only if the initial repository inspection confirms those file types. Exclude generated/dependency/build directories through MegaLinter defaults and `.mega-linter.yml`.

**Testing Blueprint:** Add deterministic repository-policy tests under `scripts/tests/` using Node's built-in test runner. Tests parse the workflow/config as text/YAML-shaped policy checks and cover triggers, action versions, permissions, no automatic fixes, report artifact upload, and ignored generated directories. These tests are integration/policy tests rather than application unit tests because the deliverable is CI configuration.

---

## Current Context

- Repository: `ricardoblackskye/WebFeedPOC`
- Default branch: `main`
- Existing CI: `.github/workflows/ci.yml` runs Vitest and coverage.
- Stack: React/Vite JavaScript, Vitest, Playwright, GitHub Actions, JSON/YAML/Markdown configuration.
- No existing MegaLinter configuration.
- Branch: `ci/add-megalinter`

## Tasks

### Task 1: Add RED policy tests

**Files:**
- Create: `scripts/tests/megalinter-config.test.mjs`

Write tests asserting the intended workflow and configuration contracts. Run:

```bash
node --test scripts/tests/megalinter-config.test.mjs
```

Expected: tests fail because the MegaLinter workflow/configuration files do not yet exist. Fix only test syntax/errors; do not add implementation files.

### Task 2: Commit and push RED tests

```bash
git add plans/ci-add-megalinter.md scripts/tests/megalinter-config.test.mjs
git commit -m "test: define MegaLinter CI policy"
git push -u origin ci/add-megalinter
```

Stop for user review/approval before implementation.

### Task 3: Add MegaLinter configuration

**Files:**
- Create: `.mega-linter.yml`

Set `IGNORE_GITIGNORED_FILES: true`, preserve report output, and exclude `node_modules`, `dist`, `dist-ssr`, `coverage`, `playwright-report`, and `test-results` where required.

### Task 4: Add MegaLinter workflow

**Files:**
- Create: `.github/workflows/mega-linter.yml`

Trigger on pushes and pull requests to `main`; use full-codebase validation on `main` pushes and diff validation for pull requests; pass `GITHUB_TOKEN`; upload `megalinter-reports` and `mega-linter.log` on success or failure. Do not grant contents write and do not enable automatic fixes.

### Task 5: Verify GREEN

Run:

```bash
node --test scripts/tests/megalinter-config.test.mjs
npm ci
npm test -- --run
npm run build
```

Then inspect the final diff and, if available, validate YAML syntax. Push implementation commit and report CI run URL/status.

## Edge Cases Identified

| Scenario | Expected behavior | Test coverage |
|---|---|---|
| Pull request from a fork | Lint runs without write access to source | Workflow has read-only contents permission and no autofix |
| Push to `main` | Full repository validation | `VALIDATE_ALL_CODEBASE` expression |
| Feature branch push | Workflow runs and does not mutate branch | push trigger + no `APPLY_FIXES` |
| Linter finds errors | Reports remain downloadable | artifact step uses `if: success() || failure()` |
| Dependencies/build output present | They are not lint targets | config exclusions and gitignore-aware setting |
| Workflow itself malformed | MegaLinter cannot start | actionlint descriptor remains enabled by default |

## Repo History Bug-Fix Review

Recent history includes `fix: remediate react-router security advisory (#46)`. No prior MegaLinter or CI-lint integration was found in the visible history. The plan therefore preserves the existing test workflow and adds MegaLinter as an independent job to avoid changing established test behavior.

## Risks and Trade-offs

- MegaLinter's default all-linter behavior may initially surface many pre-existing findings. Reports will be collected so findings can be triaged without silently weakening CI.
- No automatic fixes are enabled in the first implementation to avoid unexpected source changes and PAT/write-permission requirements.
- MegaLinter v10 and action major versions are intentionally pinned to major tags, matching the current official template; Dependabot or periodic updates should manage future upgrades.

## Acceptance Criteria

- Policy tests exist and were observed failing before implementation.
- `.github/workflows/mega-linter.yml` is valid and runs MegaLinter v10 on the required events.
- `.mega-linter.yml` exists with repository-specific exclusions.
- Workflow has no contents write permission and no automatic fix configuration.
- Existing tests/build remain green.
- Branch and commits are pushed for review; no direct changes are made to `main`.

---

## Execution Handoff

After RED tests are committed and pushed, stop and obtain explicit user approval before adding the workflow or `.mega-linter.yml`.