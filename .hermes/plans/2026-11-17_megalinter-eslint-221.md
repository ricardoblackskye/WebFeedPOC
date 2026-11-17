# Plan: clear the 13 eslint findings in main's MegaLinter report

Story: #221

## Goal

Make MegaLinter green on the default branch. It reports 13 eslint errors, and because a push to
`main` scans the whole repository rather than only a diff, a finding in a file nobody recently touched
keeps the default branch red while every pull request looks clean.

## Recon (verified, not inferred)

Main's own MegaLinter report is the authority here, and it is unusually clear:

| Artifact                  | Content               |
|---------------------------|-----------------------|
| `JAVASCRIPT_ES-ERROR.log` | 7 problems in 2 files |
| `TYPESCRIPT_ES-ERROR.log` | 6 problems in 6 files |
| `JSX_ESLINT-SUCCESS.log`  | clean                 |

That is exactly the 13 the issue lists, in exactly the files it names. Reproduced locally with the same
command CI uses, on the same nine files: **13 problems (13 errors, 0 warnings)**.

### What "the last merge" actually was

The flagged files are all old — `scripts/pr-reviewer.js` last touched by `15f22ed`,
`src/services/wixCheckoutService.test.js` by `535e5eb`, `e2e/home.spec.ts` by `61e5d65`. What is new is
`eslint.config.js`, which landed in `9b9e47d` (#190) and brought these rules with it. **That commit is
also the first one whose MegaLinter failed on `main`**, and every default-branch run since has failed too.
So the default branch has been red since #190, and the recent merges did not introduce this code. The
reason they looked clean is that their own MegaLinter runs are diff-scoped: they never touched these files.

### A caveat worth recording

A whole-repo local `eslint --no-ignore` over-reports — it lints the locally built `dist/`, which CI never
sees, because `dist/` is gitignored and `.mega-linter.yml` sets `IGNORE_GITIGNORED_FILES: true`. I made
that mistake and it produced an alarming, wrong number; the report above is the thing to trust. Do not
size this task from a local whole-repo scan.

## The 13 findings and their fixes

Twelve are genuine dead code. One is deliberate and should not be "fixed" as if it were a defect.

| File                                                                           | Line | Finding                                                   | Fix                                                                                 |
|--------------------------------------------------------------------------------|------|-----------------------------------------------------------|-------------------------------------------------------------------------------------|
| `scripts/pr-reviewer.js`                                                       | 106  | `'_' is defined but never used` + `Empty block statement` | optional catch binding `catch {` with a comment explaining the empty body           |
|                                                                                | 251  | `'e' is defined but never used`                           | `catch {`                                                                           |
|                                                                                | 441  | control characters in a regular expression                | **deliberate** — scoped `eslint-disable-next-line no-control-regex` with the reason |
|                                                                                | 447  | `'error' is defined but never used`                       | `catch {`                                                                           |
| `src/services/wixCheckoutService.test.js`                                      | 1    | `'vi' is defined but never used`                          | drop it from the import                                                             |
|                                                                                | 191  | `'originalEnv' is assigned a value but never used`        | remove the dead binding                                                             |
| `e2e/{accessibility,cart,category-filter,home,pagination,search-sort}.spec.ts` | 1    | `'type Page' is defined but never used`                   | drop it from the import (six files)                                                 |

**The one judgement call is line 441.** That expression deliberately strips control characters from a
pull request diff before it is sent to the model, so the rule is correct in general and inapplicable
here. It gets a disable comment naming the reason, scoped to that single line — not a rewrite, and not a
rule relaxed in `eslint.config.js`.

**No config change.** Every finding is fixed in code, including the deliberate one, which is annotated
rather than silenced globally.

Verified while planning: this config parses the optional catch binding, and a comment-only block
satisfies `no-empty` — probed in-repo, so the `catch {` conversions are safe.

## Tasks

This is a lint gate, so the linter's verdict *is* the behaviour to drive:

1. **RED** is the current state, reproducible on demand with the command CI runs:
   `npx eslint --no-ignore -c eslint.config.js <the nine files>` → **13 problems**.
2. Fix the 13 as tabled above.
3. **GREEN** is the same command reporting **0 problems**.

There is deliberately **no new test file**. The gate is the linter itself, run by the pre-commit hooks
added in #190 and by CI; a Vitest case that shells out to eslint would duplicate that coverage while
making the suite slower and dependent on a spawned process.

## Files likely to change

| Path                                                                                                                                | Change         |
|-------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `scripts/pr-reviewer.js`                                                                                                            | 4 findings     |
| `src/services/wixCheckoutService.test.js`                                                                                           | 2 findings     |
| `e2e/accessibility.spec.ts`, `cart.spec.ts`, `category-filter.spec.ts`, `home.spec.ts`, `pagination.spec.ts`, `search-sort.spec.ts` | 1 finding each |
| `.hermes/plans/2026-11-17_megalinter-eslint-221.md`                                                                                 | this plan      |

## Validation

- `npx eslint --no-ignore -c eslint.config.js` on the nine files reports **0 problems**.
- The changed files also pass `standard` where it applies — note `scripts/pr-reviewer.js` is excluded
  from `JAVASCRIPT_STANDARD` by `.mega-linter.yml:50`, and `TYPESCRIPT_STANDARD` is disabled, so eslint
  is the gate that matters for these files.
- The full suite still passes: **235 tests**.
- `eslint` must stay runnable through the project's own binary, which `.mega-linter.yml` pins with
  `JAVASCRIPT_ES_CLI_EXECUTABLE: node_modules/.bin/eslint` so the flat config's bare imports resolve.
- **Both scopes go green**: the pull request's diff-scoped MegaLinter, and the default branch's full
  scan after merge. The second is the acceptance gate — the PR alone cannot prove it.

## Risks and open questions

- **`catch {` changes nothing at runtime**; every binding involved is unused, which is what the linter
  proved. The conversions remove names, not behaviour.
- **`src/services/wixCheckoutService.test.js:191` is dead code from an unfinished test** — it captures
  `originalEnv` under a comment saying "In real tests, you'd mock the environment variable", and never
  mocks or restores anything. Removing the unused binding is the truthful minimal change; making that
  test actually mock the environment is a separate concern. Flagging it rather than widening this change.
- **The default branch has been red since #190** and nothing caught it earlier because PRs are
  diff-scoped. Worth knowing that a whole-repo gate can stay red for a long time this way.

## No ADR

Dead-code removal plus one annotated, scoped disable. Nothing architectural to record.
