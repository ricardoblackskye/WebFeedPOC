# Release Notes

## v0.0.3 (2026-11-24)

### Features

- [PR #252], closes [#242]: Gave every navigation label on the home page one identical bold gold treatment — the same `var(--color-gold)` (#D4AF37) at `font-weight: 700` that the category buttons already used on hover — because the previous dark brown (`#2c2416`, at weights 400/600) made the 'Categories' heading, the resting category buttons and their counts, the 'All Items (106)' item-count heading, the 'Search Products' placeholder and typed search text, and the 'Sort by' label plus the 'Name (A-Z)' select value and arrow read as too faint against the page, so the affordances that drive catalog navigation were easy to miss; the change is CSS-only in `CategoryFilter.css` and `SortControls.css` with no markup or data-flow change, the 'All Items (106)' heading — which lives in `HomePage.jsx`, outside the permitted change set — is reached through a `.products-section h2:has(> .product-count)` anchor on the unique count span plus a direct `font-weight: 700` on `.product-count` so the rule cannot match an unrelated heading, and `.category-btn.active` keeps its distinct gold-fill/dark-label treatment; proven by new stylesheet-content and DOM assertions in `CategoryFilter.test.jsx` and `SortControls.test.jsx` that locate the CSS with `node:fs` + `process.cwd()` rather than `import.meta.url`, per the review feedback on #242.

### CI/Infrastructure

- [PR #252], closes [#242]: Extended `tests/dependency-vulnerabilities.test.js` with a second guard, `GHSA-6jcc-5g8w-32mx`, that walks every resolved `i18next` copy in `package-lock.json` — nested copies included — and fails if any sits below the patched `26.3.4`, and paired it with an `i18next: "^26.3.4"` override in `package.json` so the transitive copy `@wix/sdk` pulls in (resolved 25.8.7 → 26.7.2) cannot silently reintroduce the advisory — since `osv-scanner` is a required MegaLinter descriptor, one affected copy turns MegaLinter red on every branch including `main`, and the Dark Factory's Definition of Done reads the PR's own checks.

### Documentation

- [PR #252], closes [#242]: Rewrote `README.md` as a system blueprint (system overview, subdirectory boundaries, global invariants and side effects, build/test commands) and added per-module READMEs for `api/`, `scripts/`, `src/`, `src/components/`, `src/hooks/`, `src/pages/`, `src/services/`, `src/test-utils/` and `src/utils/`, each documenting that module's interface, invariants, side effects and verification command — so the documented module boundaries now match the code, which is what lets the drift-detection step assert "no drift detected" for every README in `2026-11-22_DRIFT_REPORT.md`.

## v0.0.2 (2026-11-19)

### Features

- [PR #236], closes [#235]: Made a product image in the gallery open a modal viewer when it is clicked and close that viewer when the image is clicked again, and gave the gallery trigger a `zoom-in` cursor so the image reads as clickable — previously clicking a product image only swapped the inline image with no dialog, and the modal's own image swallowed clicks without closing — and collapsed `ProductPage`'s two modal state flags (`showImageModal` plus `modalImageIndex`) into one nullable `modalIndex`, so the open state and the displayed image can no longer disagree; `ImageModal` is now a labelled modal dialog (`role="dialog"`, `aria-modal`, `aria-label`), a `modalIndex !== null && displayImages.length > 0` guard keeps it from opening on a product with no images, and the behavior is covered by new tests in `ProductPage.test.jsx` and `ImageModal.test.jsx`.

## v0.0.1 (2026-11-16)

### CI/Infrastructure

- [PR #216], closes [#214]: Upgraded the `@typescript-eslint` family to `8.73.0` (floor `^8.72.1` → `^8.73.0`) so the nested `minimatch` transitive copy resolves to v11, clearing the `osv-scanner` finding with no override left to outlive its reason — since `osv-scanner` is a required MegaLinter descriptor, this stops MegaLinter from going red on every branch including `main`, unblocking the Dark Factory Definition of Done, which reads the PR's own checks.
- [PR #218], closes [#215]: Disabled MegaLinter's dictionary spell check (`SPELL_CSPELL`) in `.mega-linter.yml` beside the two existing `DISABLE_LINTERS` entries, because cspell's general-English dictionary rejects this project's domain vocabulary — it rejected a word derived from the repository's own `build:prerender` script, and no dictionary can keep pace with the model-authored plan artifacts the Dark Factory writes into the repo — while leaving the `SPELL_LYCHEE` link checker active.
- [PR #220], closes [#217]: Rewrote `src/pages/ReleasenotesPage.test.jsx` to assert the behavior of the page instead of a snapshot of its content — that `ReleasenotesPage` renders the markdown returned by `useReleasenotes` whatever it contains, `LoadingState` while the hook is pending, and `ErrorState` when the hook rejects — replacing the `getByText` match against a literal copied out of `releasenotes.md`, which stopped existing once real release notes were generated into that file — clearing the failing `test` job on `main`, which had been red since the first generated release note and was blocking every pull request in the repository, including unrelated ones, so the suite now stays stable as `releasenotes.md` evolves.
