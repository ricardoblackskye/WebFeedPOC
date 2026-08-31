# Plan: Add Eve-Agent PR Code Review to the pipeline (#137, code-review half)

- **Issue:** https://github.com/ricardoblackskye/WebFeedPOC/issues/137
- **Branch:** `feat/pr-reviewer-137`
- **Author:** Senior Software Engineer (AI SDLC flow)
- **Date:** 2026-08-31

## Goal (scoped by user decision)
Issue #137 asks to replicate agent-eve's "Eve-Agent Code Review and Release Notes"
pipeline in WebFeedPOC, triggered on PR creation/update. Investigation of the
**agent-eve** repo (`github.com/ricardoblackskye/agent-eve`) shows it has ONLY:
- `.github/workflows/ci.yml`
- `.github/workflows/pr-reviewer.yml`  ← the code-review automation

There is **no release-notes workflow** in agent-eve. Its release notes come from an
in-app **Release Manager subagent** (`agent/subagents/release-manager/tools/*.ts`)
that only runs inside the deployed Eve/Next.js runtime — it cannot be copied into
this plain Vite static site. Per the user's explicit decision, this plan covers the
**code-review half only**; release notes is deferred to a later issue.

## Root cause (verified)
WebFeedPOC has no PR-review automation. agent-eve's reviewer is a single dependency-
free Node script (`scripts/pr-reviewer.js`) driven by a GitHub Actions workflow
(`pr-reviewer.yml`) on `pull_request: [opened, synchronize, reopened]`. It is fully
portable: it uses only Node built-ins (`fs`, global `fetch`), reads the GitHub event
payload, fetches the PR diff, sends it to OpenRouter for a review, and posts the
result as a PR comment. It degrades gracefully to a **fallback** structural review if
the model/key is unavailable.

### Verified environment facts
- WebFeedPOC `package.json` is `"type": "module"` → a `.js` script runs as ESM, so
  `pr-reviewer.js` (top-level `await`, `import` syntax) works unchanged.
- `scripts/` dir already exists (holds `prerender.mjs`, `tests/`) — new file slots in.
- agent-eve's workflow pins nothing; WebFeedPOC's `ci.yml` pins action SHAs, so we
  mirror THAT convention and pin `actions/checkout` + `actions/setup-node` SHAs.
- AI calls need an `OPENROUTER_API_KEY` repo **secret** (user will provide the value;
  I'll create it via the GitHub REST API using the PAT in `~/.git-credentials`).
- `MODEL_NAME` is optional: the workflow defaults to `deepseek/deepseek-v4-pro` via
  `${{ vars.MODEL_NAME || 'deepseek/deepseek-v4-pro' }}`. No var needs creating.

## Intended fix
Mirror agent-eve's PR reviewer into WebFeedPOC:

1. **`scripts/pr-reviewer.js`** — copy agent-eve's script verbatim, with one cosmetic
   change: the `User-Agent` header `agent-eve-pr-reviewer/1.0` →
   `webfeed-poc-pr-reviewer/1.0`. All review/fallback/comment logic unchanged.
2. **`.github/workflows/pr-reviewer.yml`** — replicate agent-eve's trigger and steps,
   adapted to this repo's conventions:
   - `on: pull_request: types: [opened, synchronize, reopened]`
   - `permissions: contents: read, pull-requests: write`
   - checkout (fetch-depth: 0), setup-node **20** (matches WebFeedPOC CI; script needs
     Node 18+ for global `fetch`), then `node scripts/pr-reviewer.js` with
     `GITHUB_TOKEN`, `OPENROUTER_API_KEY`, `MODEL_NAME` env.
   - **Drop `npm ci`** (the script has zero npm dependencies — leaner + removes a
     failure point; agent-eve kept it only incidentally).
   - **Pin action SHAs** to the same ones used in this repo's `ci.yml`.

## Tasks (TDD-style — CI infra)
Because this is pipeline config, the "test" is workflow execution, not unit tests.
- **RED (anchor):** On `main`, no `.github/workflows/pr-reviewer.yml` exists → PRs
  get no automated review. Confirmed (only `ci.yml`, `mega-linter.yml` present).
- **GREEN:** Add the two files. Gate locally with `node --check scripts/pr-reviewer.js`
  (syntax/ESM-parse must pass) and a manual YAML review against the known-good
  agent-eve source. End-to-end GREEN = the workflow posts a comment on a PR.
- **REFACTOR:** None required.

## Files likely to change
- Added: `scripts/pr-reviewer.js`, `.github/workflows/pr-reviewer.yml`
- Untouched: all app code, `ci.yml`, `mega-linter.yml`, `releasenotes.md` (release
  notes deferred), `package.json`.

## Validation
1. `node --check scripts/pr-reviewer.js` → exits 0 (ESM + top-level await parse OK).
2. YAML reviewed: trigger types, permissions, pinned SHAs, env wiring match plan.
3. **Live proof (GATE 6 + secret):** after the `OPENROUTER_API_KEY` secret is set and
   the implementation PR for this branch is opened, the `PR Reviewer` job runs and
   posts a comment (AI review if key valid, else the built-in fallback review). The
   posted comment is the real signal that wiring works.
4. Without the key, the workflow still runs in **fallback mode** (structural review
   comment) — proving the pipeline is correctly wired even before the secret lands.

## Risks / open questions
- **Secret not yet present:** user will paste `OPENROUTER_API_KEY`; I'll create it via
  GitHub REST API (`PUT /repos/.../actions/secrets/...`, encrypted with the repo
  public key using `tweetsodium`) using the PAT from `~/.git-credentials`. Until then
  the workflow runs in fallback mode.
- **Model/rate limits:** handled by the script's fallback path — pipeline never fails
  the PR open; it just posts a non-AI review.
- **Node `fetch`:** global in Node 18+; workflow pins Node 20. Safe.
- **Comment posting:** requires `pull-requests: write` (granted). `GITHUB_TOKEN`
  provided by Actions automatically.
- **Release notes:** explicitly OUT of scope per user; tracked separately later.

## Commit / PR plan
- Commit 1 (this branch): `plan(ci): #137 add Eve PR-reviewer pipeline`
- Commit 2 (after approval): `feat(ci): #137 add Eve PR-reviewer workflow + script`
- PR (GATE 6, on authorization): `Closes #137` (code-review half), notes release
  notes deferred and that the secret is configured via API on merge-readiness.
