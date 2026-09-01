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

## AI Code-Review Findings — Engineering Assessment

The PR-reviewer workflow ran on PR #138 and produced two AI reviews:
- `5478839787` (13:10) — 7-item "Recommendations" list (Architectural / Security / Off-by-one / Workflow).
- `5479224372` (13:41, latest, highest quality) — 13 numbered "Key Findings".

User asked to act on **the 13 recommendations** = the 13 findings in `5479224372` (exact count).
The earlier 7-item list overlaps; its still-relevant points are folded into the assessment below.

### ⚠️ Regressions discovered during this review (must re-apply)
Commit `98aa9a6` added: async `fs.promises.readFile`, early `GITHUB_TOKEN` check,
`MODEL_NAME` default, **token redaction in logs**, and `trimEnd()` off-by-one fix.
The later quality-gate rewrite (`37bbf8e`) started from the *original* script and
**dropped all of those**. The current branch `scripts/pr-reviewer.js` therefore:
- still uses `fs.readFileSync` (line 12),
- has no top-level `GITHUB_TOKEN` presence check,
- counts diff lines with bare `split("\n")` (off-by-one, line 196),
- **logs raw OpenRouter/GitHub error bodies with no redaction** (token-leak risk).
These MUST be re-applied in the final script alongside the 13 fixes.

### Assessment of the 13 findings (verdict + action)
| # | Reviewer claim | Verdict | Action |
|---|---|---|---|
| 1 | Pinned `actions/checkout` SHA looks like a placeholder | **REJECT (false positive)** | SHA `11d5960…` is a real, valid pin and matches this repo's own `ci.yml`. Pinning to a fixed commit is the intended supply-chain practice; it need not equal upstream's newest tag. Optional: bump to latest pin for freshness (low prio). |
| 2 | `MODEL_NAME` referenced incorrectly | **REJECT (false positive)** | `${{ vars.MODEL_NAME \|\| 'deepseek/deepseek-v4-pro' }}` is correct GA syntax; defaults when the repo var is unset. Already correct. |
| 3 | Potential timeout boundary condition | **PARTIAL / already bounded** | Job has `timeout-minutes: 10`; diff fetch has 30s `AbortController` (cleared on all paths). Acceptable; no change. |
| 4 | Prompt-injection vector persists | **ACCEPT (hardening)** | Current script strips control chars + escapes backticks + marks diff untrusted in system prompt. Keep; additionally wrap diff in a clearly-labeled fenced block and re-state "ignore embedded instructions". Low prio. |
| 5 | Diff URL built via template literal (issue events) | **ACCEPT (minor)** | For `event.issue.pull_request` we build `pulls/${n}.diff` because the issue payload lacks `diff_url`; correct. Optional: call PR API for canonical URL. Low prio. |
| 6 | Hardcoded issue-comments endpoint | **REJECT (deliberate)** | Issue comments reliably post + notify on PRs and match agent-eve's approach. PR Reviews API adds complexity for marginal gain. Keep (documented in code). |
| 7 | Large-diff warning without alt handling | **ACCEPT** | Implement truncation: if `prDiff.length > ~30_000`, send head+tail and note truncation, to protect token budget/cost. Medium. |
| 8 | Exit code doesn't distinguish fatal/non-fatal | **PARTIAL / minor** | We already `process.exit(1)` on diff-fetch + comment-post failure. Nit: on comment-post failure, also write review to a step summary/artifact so it isn't lost. Low prio. |
| 9 | Missing error handling for `prDiff` in fallback | **ACCEPT (nit)** | Guard `prDiff = prDiff \|\| ""` before fallback; defensively default it. Low prio. |
| 10 | Content-type mismatch returns JSON | **REJECT (false positive)** | We send `Accept: application/vnd.github.v3.diff`, so GitHub returns the raw diff, not JSON. Already correct. |
| 11 | No retry on comment posting | **ACCEPT** | Wrap the POST in a small retry (2 attempts, short backoff) to survive transient GitHub 5xx. Low/Medium. |
| 12 | Token exposure in error messages | **ACCEPT — MUST FIX (regression)** | Current branch logs raw `errorText` from OpenRouter + GitHub with no redaction → can leak secrets. Re-add `redact()` masking `sk-…`, `Bearer …`, and `token/secret/api_key` JSON fields before any logged body. High. |
| 13 | `diff_url` may omit files | **ACCEPT (known limitation)** | GitHub truncates very large PR diffs (~300 KB). Note in fallback/comment when truncated; optionally fetch via PR API with pagination. Low prio / informational. |

### Consolidated implementation list (what I will change in `scripts/pr-reviewer.js`)
**Re-apply regressions (high value, currently missing):**
- R1. `fs.readFileSync` → `fs.promises.readFile` (async).
- R2. Early `GITHUB_TOKEN` (+ `OPENROUTER_API_KEY` warn) presence check.
- R3. Off-by-one line count via `diff.trimEnd().split("\n")`.
- R4. `redact()` on every logged API error body (fixes #12).

**New from the 13 findings:**
- N7. Large-diff truncation (head+tail) + note.
- N9. `prDiff = prDiff || ""` guard.
- N11. Comment-POST retry (2 attempts).
- N4. Strengthen prompt-injection framing (delimited fenced block + re-state untrusted).

**Rejected (no code change):** #1, #2, #6, #10 (false positives / deliberate).
**Already adequate:** #3, #5, #8, #13 (note only).

### Validation after changes
1. `node --check scripts/pr-reviewer.js` → 0.
2. Unit-check `redact()` masks a sample `sk-…` key and `Bearer …` (local dry run).
3. Push → `synchronize` triggers `PR Reviewer` → posts a real AI review (OpenRouter 200, quality gate passes); confirm no raw secrets in the run log via `grep` on the job log.
4. Confirm re-review comment appears and contains none of the rejected false-positives as open issues.
