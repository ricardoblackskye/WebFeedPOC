# Plan: make the release-notes page test assert what the page is for

Story: #217

## Goal

Stop the release-notes page test from turning `main` red. It currently pins a literal string taken from the
content file, so the first real release note broke it and the `test` job has been failing on the default
branch ever since — blocking every pull request in this repository, including unrelated ones.

## Root cause (verified)

`src/pages/ReleasenotesPage.test.jsx:26` asserts:

```js
expect(screen.getByText(/This file will be auto-updated by the Eve Agent./)).toBeInTheDocument()
```

That string was the *entire content* of `releasenotes.md` before any real note existed. Commit `c8e6c8c`
replaced it with the first entry, so the assertion can no longer match. The test passed only while the file
was still a placeholder, which is the opposite of what it should do.

Measured on the branch, which is cut from current `main`: **1 failed | 234 passed** — the single failure is
this test, and it is the only thing keeping `main` red.

The placeholder appears in exactly one place in source (the stale `dist/` build output also contains it, but
that directory is generated and not tracked). No other test pins it.

## Intended fix

Assert what the page is actually responsible for — that it renders the release-notes content — rather than a
literal copied out of that content. Three assertions:

1. the `Release Notes` heading renders (kept as-is);
2. the rendered body is **not empty**, which is the case that fails if the page renders nothing;
3. the rendered body **is the content of `releasenotes.md`**, read from disk in the test.

Read the file with `readFileSync`, not a `?raw` import: the page's own `?raw` import works under this
project's bundler, but a test that reads from disk does not depend on that and cannot silently receive an
empty string. **Normalize line endings on both sides** before comparing — this tree is CRLF, so an
un-normalized comparison passes locally and fails in CI.

### On the issue's third suggestion

The issue suggests asserting the placeholder is *absent* once real notes exist. This plan deliberately does
not do that: the page renders whatever the file says, so a test that requires the placeholder to be gone
would fail if the file were ever legitimately reset, and it asserts nothing about the page. Comparing the
rendered body against the file's real content covers the intent — a placeholder, or real notes, both pass,
and an empty or missing document fails.

## Tasks

This is a test-only correction, so there is no new behaviour to test-drive and no RED/GREEN pair to split.

- **The RED is the existing failure on `main`**, and it is reproducible on demand: run the suite and it names
  this test. It is recorded in the commit message as the before-state rather than re-created as a new
  failing test, because the failing assertion is the thing being removed.
- **GREEN** is the corrected test passing, with the rest of the suite unchanged.

1. Correct the three assertions as above.
2. Run the full suite: **235 passed**, no other test touched.
3. Local lint gate on the changed file: `standard`, `eslint` and `cspell`.

## Files likely to change

| Path                                  | Change                                                 |
|---------------------------------------|--------------------------------------------------------|
| `src/pages/ReleasenotesPage.test.jsx` | replace the placeholder assertion with the three above |

## Validation

- The full suite is green on the branch — the same 235 tests, with the single pre-existing failure removed.
- The `test` job is green on the pull request, which is what unblocks every other pull request.
- No other test file is modified, so nothing else can change state.

## Risks and open questions

- **Comparing against the file makes the test depend on the page rendering the file verbatim.** That is
  exactly the page's contract today, so the assertion is honest; if the page ever starts transforming the
  markdown, the test should be updated deliberately rather than silently, which is the point.
- **A sibling page has the same shape and may carry the same latent defect.**
  `src/pages/ArchitecturePage.jsx` also renders a content file (`ARCHITECTURE.md`), and
  `ArchitecturePage.test.jsx` asserts three literal strings. If those come from the document rather than
  from the page's own labels, the same brittleness is waiting there. This plan does not touch it — it is a
  separate concern and a separate change — but it is worth checking, and I will confirm which it is while
  implementing so the finding is recorded rather than assumed.

## No ADR

A test correction with no architectural decision behind it. The reasoning lives in the test itself, which
now says what the page is for.
