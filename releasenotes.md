# Release Notes

## v0.0.1 (2026-11-16)

### CI/Infrastructure

- [PR #216], closes [#214]: Upgraded the `@typescript-eslint` family to `8.73.0` (floor `^8.72.1` → `^8.73.0`) so the nested `minimatch` transitive copy resolves to v11, clearing the `osv-scanner` finding with no override left to outlive its reason — since `osv-scanner` is a required MegaLinter descriptor, this stops MegaLinter from going red on every branch including `main`, unblocking the Dark Factory Definition of Done, which reads the PR's own checks.
- [PR #218], closes [#215]: Disabled MegaLinter's dictionary spell check (`SPELL_CSPELL`) in `.mega-linter.yml` beside the two existing `DISABLE_LINTERS` entries, because cspell's general-English dictionary rejects this project's domain vocabulary — it rejected a word derived from the repository's own `build:prerender` script, and no dictionary can keep pace with the model-authored plan artifacts the Dark Factory writes into the repo — while leaving the `SPELL_LYCHEE` link checker active.
