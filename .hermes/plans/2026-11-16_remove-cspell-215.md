# Plan: remove the spell-check descriptor from MegaLinter

Story: #215

## Goal

Stop MegaLinter spell-checking this repository. The check was found to be unhelpful with the Dark Factory
approach, and it is the last thing standing between a generated pull request and a green gate.

## Context

The Dark Factory writes a plan artifact into this repository (`.hermes/plans/df-<issue>.md`) whose prose is
authored by a model, so its vocabulary is unbounded. The spell descriptor uses a general-English dictionary
rather than this project's domain language, and the measured failure is on the project's own jargon: it
rejected a word derived from this repository's own `build:prerender` script.

Two further facts make removal the right call rather than a workaround:

- **It is the only active spell descriptor here.** The other three are already inactive on this repository,
  so this change is not "downgrade one spell checker among several" — it is removing spell-checking from the
  gate, which is the intent the story states.
- **The artifact cannot be repaired after the fact.** The plan is written after the coding loop finishes, so
  no earlier gate can lint it, and the run can only report the failure rather than fix it. That leaves the
  repository unable to complete a run for a word its own scripts already use.

## Intended fix

Add the spell descriptor to `DISABLE_LINTERS` in `.mega-linter.yml`, beside the two entries already there,
with a comment in the same style as the entries already there explaining why.

## What is deliberately NOT changed

- **`.cspell.json` stays.** The story asks to remove the check from MegaLinter, not to delete the project's
  vocabulary. The file is still useful to editors and to any future tooling, and deleting it would be a
  larger, unrelated change.
- **The pre-commit hook stays as it is.** It runs `npm run lint` and `npm run typecheck` only — it does not
  invoke the spell checker — so nothing there needs to change.
- **No other descriptor is touched.** The two existing `DISABLE_LINTERS` entries are kept, and the config
  test asserts they survive.

## The consequence, stated plainly

This removes spell-checking from CI entirely. A genuine typo in human-authored prose will no longer be
caught by any gate. That is the trade the story makes, and it is worth stating in the pull request rather
than leaving for someone to discover.

## Tasks (TDD phases)

This is a configuration change, so the RED anchor is the repository's existing config guard,
`tests/lint-config.test.js` — the same file that already asserts the `DISABLE_LINTERS` contents.

1. **RED** — extend `tests/lint-config.test.js` with a case asserting `DISABLE_LINTERS` contains the spell
   descriptor, and that the two existing entries are still present. Confirm it fails against the current
   config. The second assertion is what stops a later edit silently dropping the existing entries.
2. **GREEN** — add the entry and its explanatory comment to `.mega-linter.yml`. Confirm the guard passes.
3. **Release notes** — add an entry to `releasenotes.md` under `### CI/Infrastructure`, following the shape
   of the existing entry (the PR link, the closing issue link, and a prose summary).
4. **Local lint gate** — run the linters MegaLinter applies to the changed files: the pinned markdown table
   formatter, markdownlint, the link checker, and `standard` for any `.js` change.

## Files likely to change

| Path                        | Change                                               |
|-----------------------------|------------------------------------------------------|
| `.mega-linter.yml`          | one entry added to `DISABLE_LINTERS`, with a comment |
| `tests/lint-config.test.js` | the new guard case                                   |
| `releasenotes.md`           | the entry for this change                            |

## Validation

- The guard fails before the change and passes after.
- A MegaLinter run on the pull request reports the spell descriptor as inactive, and its summary table has
  no spell row.
- Every other descriptor that ran before still runs — the change must not disable anything else.

## Risks and open questions

- **Loss of typo protection is the accepted cost**, and it is the whole point of the story. Recorded above
  so the pull request carries it rather than hiding it.
- **The generated-plan exemption becomes moot in this repository.** A related decision exempts the factory's
  generated plan artifact from spell-checking; with the descriptor gone that mechanism has nothing left to
  do here. It is recorded in another repository and is left alone — this is a note, not a task.
- **A future maintainer may want it back.** The comment beside the entry states why it is disabled, so the
  reasoning is not lost the way a bare list entry would lose it.

## No ADR

The reason lives beside the setting, in the same commented style the file already uses for its other
entries, and the config guard pins the outcome. There is no decision here a future developer would have to
re-derive from an ADR.
