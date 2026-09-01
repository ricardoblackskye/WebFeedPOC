# #139 Tech-debt Cleanup (PR-reviewer findings + MegaLinter) — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Clear the `MegaLinter` check (currently red on every PR) and document the residual PR-reviewer code-review findings so the repo's lint gate is green and the #138 review backlog is tracked.

**Architecture:** Four independent, low-risk config/style fixes driven by the findings in issue #139. Three are one-or-few-line config changes; one is a style decision on `scripts/pr-reviewer.js`. No application/build logic changes — the Vite build (`npm run build:prerender`) is unaffected.

**Tech Stack:** GitHub Actions, MegaLinter v10 (`oxsecurity/megalinter`), cspell, JavaScript Standard Style, zizmor.

**Branch naming rule (repo convention):** branches and plan filenames must NOT contain `#`. Use `issue-139` not `issue-139`.

---

## Current context / facts (verified)

- PR #138 merged → `main` at `151721a`. Closes #137.
- MegaLinter run `33498803338` (on merge commit) failed these linters:
  - `action_zizmor`: 1 real finding `warning[artipacked]` on `.github/workflows/pr-reviewer.yml:19` — `actions/checkout` missing `persist-credentials: false`. (5 duplicate/suppressed; only 1 counts.) Confidence Low, has auto-fix.
  - `javascript_standard`: ~60 style errors on `scripts/pr-reviewer.js` — wants single-quotes + no semicolons (`quotes`, `semi`, `space-before-function-paren`, `comma-dangle`). Our file intentionally uses double-quotes + semis (copied from agent-eve).
  - `spell_cspell`: 35 unknown words across repo, incl. `OPENROUTER`, `openrouter`, `deepseek`, `webfeed`, `SDLC`, `prio`, `tweetsodium`, `pousr`. **No `cspell.json` exists** → MegaLinter uses built-in English dict.
  - `repository_devskim`: 1 error that is a **tool bug** (`Failed to parse Data ... as a XML document`), not a code defect. Background noise.
- No `.megalinter.yml`, no `.standardignore`, no `cspell.json`, no `.github/linters/` exist in the repo — MegaLinter uses all built-in defaults.
- PR #138 code-review findings: #4, #7, #9, #11, #12 **fixed in #138**; #1/#2/#6/#10 false positives; #3 already bounded; #5/#8/#13 are low-priority optional polish (tracked here, not required for green lint).

## Proposed approach

1. **zizmor (real, 1 line):** add `persist-credentials: false` to the checkout step in `pr-reviewer.yml`.
2. **cspell (config, new file):** create `cspell.json` with the project word list so the 35 spell errors clear.
3. **devskim (noise):** disable `REPOSITORY_DEVSKIM` via a new `.megalinter.yml` (since it's a parse bug, not our code).
4. **javascript_standard (decision):** rather than reformat `pr-reviewer.js` away from the agent-eve copy's proven style, **ignore it** for Standard Style via `.megalinter.yml` (`JAVASCRIPT_STANDARD_DISABLE_ERRORS: true` or `DISABLED` for that descriptor) — keeps the file faithful to upstream and clears the largest error count. (Alternative: run `standard --fix` — noted as a branch in Task 4.)
5. **Track residual PR-review polish** (#5/#8/#13) as optional TODOs in this plan; implement only if desired (not required for green).

## Files likely to change

- Modify: `.github/workflows/pr-reviewer.yml` (add `persist-credentials: false`)
- Create: `cspell.json` (project dictionary)
- Create: `.megalinter.yml` (disable devskim; ignore `pr-reviewer.js` for standard)
- Optionally modify: `scripts/pr-reviewer.js` (only if we choose the `standard --fix` route instead of ignoring)

---

## Task 1: Add `persist-credentials: false` to checkout (zizmor)

**Objective:** Clear the only real zizmor `artipacked` medium finding.

**Files:**
- Modify: `.github/workflows/pr-reviewer.yml:19-21`

**Step 1: Edit the checkout step**

Change:
```yaml
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          fetch-depth: 0 # Fetch all history for diff
```
to:
```yaml
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          fetch-depth: 0 # Fetch all history for diff
          persist-credentials: false # zizmor: avoid credential persistence via artifacts
```

**Step 2: Verify syntax**
Run: `node --check` is N/A (YAML). Instead validate YAML quickly:
`python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/pr-reviewer.yml')); print('YAML OK')"`
Expected: `YAML OK`

**Step 3: Commit**
```bash
git add .github/workflows/pr-reviewer.yml
git commit -m "ci: pr-reviewer.yml set persist-credentials: false (zizmor artipacked)"
```

---

## Task 2: Create `cspell.json` project dictionary (cspell)

**Objective:** Clear the 35 `cspell` unknown-word errors.

**Files:**
- Create: `cspell.json` (repo root)

**Step 1: Write `cspell.json`**

Use the words MegaLinter flagged plus other obvious project terms. Start with:
```json
{
  "version": "0.2",
  "language": "en",
  "words": [
    "OPENROUTER",
    "openrouter",
    "deepseek",
    "webfeed",
    "SDLC",
    "prio",
    "tweetsodium",
    "pousr",
    "antiques",
    "microsite",
    "Wix",
    "wix",
    "Vite",
    "vercel",
    "OpenRouter",
    "prerender",
    "zizmor",
    "devskim",
    "megalinter",
    "cspell"
  ]
}
```
> Note: the 35 errors include words beyond the flagged 8 (e.g. product/Wix/brand terms across `ARCHITECTURE.md`, `README.md`, etc.). After first push, check the new MegaLinter run; if cspell still reports unknowns, append them to `words`.

**Step 2: Verify JSON**
Run: `python -c "import json; json.load(open('cspell.json')); print('JSON OK')"`
Expected: `JSON OK`

**Step 3: Commit**
```bash
git add cspell.json
git commit -m "ci: add cspell.json project dictionary (clears spell linter)"
```

---

## Task 3: Create `.megalinter.yml` to disable devskim noise (devskim)

**Objective:** Stop the `repository_devskim` tool-bug error (not a code defect) from failing the check.

**Files:**
- Create: `.megalinter.yml` (repo root)

**Step 1: Write `.megalinter.yml`**

```yaml
# MegaLinter config — WebFeedPOC
# Disable linters that are noise for this repo / tool-version-incompatible.
REPOSITORY_DEVSKIM: "disabled"
# Ignore the agent-eve-style PR reviewer script from Standard Style (intentional
# double-quote + semicolon style); reformat instead if you prefer standard --fix.
JAVASCRIPT_STANDARD_DISABLED: false
JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE: "(scripts/pr-reviewer\\.js)"
```
> If `JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE` does not exclude it cleanly, switch to `JAVASCRIPT_STANDARD: "disabled"` (Task 4 alternative).

**Step 2: Verify YAML**
Run: `python -c "import yaml; yaml.safe_load(open('.megalinter.yml')); print('YAML OK')"`
Expected: `YAML OK`

**Step 3: Commit**
```bash
git add .megalinter.yml
git commit -m "ci: disable devskim noise + exclude pr-reviewer.js from standard"
```

---

## Task 4: Resolve `javascript_standard` (two options — pick ONE)

**Objective:** Clear the ~60 Standard Style errors on `scripts/pr-reviewer.js`.

### Option A (recommended — preserve agent-eve style): already handled in Task 3
`JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE: "(scripts/pr-reviewer\\.js)"` excludes the file. No script edit. Skip to validation.

### Option B (reformat to Standard Style): run `standard --fix`
**Only if the user prefers the file to follow Standard Style.**
```bash
npx standard --fix scripts/pr-reviewer.js
```
Then `npx standard scripts/pr-reviewer.js` → expect 0 errors. Commit:
```bash
git add scripts/pr-reviewer.js
git commit -m "style: reformat pr-reviewer.js to Standard Style"
```
> Caveat: this diverges the file from the upstream agent-eve copy; do NOT also apply Task 3's exclude if you pick this.

**Validation (either option):**
- Task 3 exclude path: confirm `JAVASCRIPT_STANDARD` no longer reports `pr-reviewer.js`.
- Task 4B path: `npx standard scripts/pr-reviewer.js` → 0 errors.

---

## Task 5: Push branch + open PR, verify MegaLinter goes green

**Objective:** Land the fixes and confirm the `MegaLinter` check passes.

**Step 1: Push the `issue-139` branch**
```bash
git push -u origin issue-139
```
> Note: from this Windows host `git push` to github.com often stalls at pack-upload. If a foreground push times out, use a background retry loop:
> `for i in 1 2 3 4 5 6; do git push -u origin issue-139 2>&1 | tail -2 && break; sleep 15; done`

**Step 2: Open PR against `main`**
Use the GitHub REST API (PAT in `~/.git-credentials`, no `gh` CLI):
```bash
TOKEN=$(sed -n 's#https://ricardoblackskye:\([^@]*\)@github.com#\1#p' "$HOME/.git-credentials" | head -1)
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/ricardoblackskye/WebFeedPOC/pulls \
  -d '{"title":"ci: #139 clear MegaLinter (zizmor/cspell/devskim/standard)","body":"Closes #139","head":"issue-139","base":"main"}'
```

**Step 3: Wait for MegaLinter run, confirm green**
- Fetch the new `MegaLinter` run on the PR head; confirm `conclusion: success`.
- If `cspell` still lists unknowns, append them to `cspell.json` (`words`) and push again (Task 2 follow-up).

---

## Optional polish (NOT required for green) — PR #138 residual findings

These were reviewed in #139 Section A and left open. Implement only if desired:
- **#5:** for `event.issue.pull_request`, fetch the PR via API to get canonical `diff_url` instead of templating `pulls/${n}.diff`. Low priority.
- **#8:** on comment-post failure, also write the review body to a workflow step summary (`$GITHUB_STEP_SUMMARY`) so it isn't lost. Low priority.
- **#13:** paginate very large PR diffs (>300KB GitHub truncation) via the PR API. Informational.

---

## Tests / validation (summary)

- `node --check` / YAML parse on every edited workflow/config file.
- `npx standard scripts/pr-reviewer.js` → 0 errors (only if Option B).
- Final gate: a fresh PR's `MegaLinter` check reports `success` (no `artipacked`, no cspell unknowns, devskim disabled, standard ignores/excludes the script).

## Risks / tradeoffs

- `persist-credentials: false` is safe here (the script uses `GITHUB_TOKEN` injected by the step env, not the checkout-created credential) — but confirm the token still works after this change (it's provided via `secrets.GITHUB_TOKEN`, independent of checkout persistence).
- Disabling devskim removes a (currently broken) secret scanner from CI — acceptable since it's a tool-parse bug, not a real finding; can be re-enabled after a MegaLinter version bump.
- Excluding `pr-reviewer.js` from Standard Style keeps it faithful to the agent-eve upstream copy; if the team wants uniform Standard Style, use Option B instead.

## Acceptance (from issue #139)

- [ ] `pr-reviewer.yml` passes `zizmor` (no `artipacked`)
- [ ] `cspell` passes (dictionary updated)
- [ ] `javascript_standard` passes or is intentionally disabled for `pr-reviewer.js`
- [ ] `devskim` noise resolved/disabled
- [ ] `MegaLinter` check green on a fresh PR
