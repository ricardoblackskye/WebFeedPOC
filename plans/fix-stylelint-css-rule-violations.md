# Stylelint CSS Rule Violations Remediation Plan

> Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Related issue:** #70

## Goal

Remediate all 306 Stylelint rule violations across 14 application CSS stylesheets in `src/` so that MegaLinter's `CSS_STYLELINT` descriptor passes cleanly with standard rules, while maintaining full visual and functional regression safety.

## Evidence

MegaLinter run [31796400309](https://github.com/ricardoblackskye/WebFeedPOC/actions/runs/31796400309) reported 306 errors across 14 CSS files using `stylelint` v17.14.1 with `stylelint-config-standard`:

- `src/App.css` (27 errors)
- `src/components/Cart.css` (66 errors)
- `src/components/CategoryFilter.css` (20 errors)
- `src/components/OrderConfirmation.css` (8 errors)
- `src/components/Pagination.css` (4 errors)
- `src/components/ProductCard.css` (15 errors)
- `src/components/ProductList.css` (1 error)
- `src/components/ProductModal.css` (60 errors)
- `src/components/ProductPage.css` (44 errors)
- `src/components/SortControls.css` (21 errors)
- `src/components/StockIndicator.css` (27 errors)
- `src/index.css` (3 errors)
- `src/pages/AboutPage.css` (2 errors)
- `src/pages/OrderHistory.css` (9 errors)

### Violation Breakdown

1. `color-function-alias-notation` (89 errors) & `color-function-notation` (89 errors) & `alpha-value-notation` (89 errors): Legacy `rgba(r, g, b, a)` format -> modern space-separated notation `rgb(r g b / a%)` (e.g. `rgba(0, 0, 0, 0.1)` -> `rgb(0 0 0 / 10%)`).
2. `shorthand-property-no-redundant-values` (14 errors): Redundant 4-value box model shorthands where 3 or 2 values suffice (e.g. `margin: 1rem 0 2rem 0` -> `margin: 1rem 0 2rem`).
3. `media-feature-range-notation` (8 errors): Legacy media queries `(max-width: 768px)` -> modern context range syntax `(width <= 768px)`.
4. `no-descending-specificity` (4 errors): Disallowed selector of lower specificity placed after higher specificity rule targeting overlapping elements.
5. `declaration-block-single-line-max-declarations` (3 errors): Multiple declarations placed on a single line.
6. `font-family-name-quotes` (2 errors): Quotes around standard unquoted font keywords (e.g. `"Lato"` -> `Lato`).
7. `keyframes-name-pattern` (2 errors): CamelCase keyframe names (`fadeIn`, `slideUp`) -> kebab-case (`fade-in`, `slide-up`).
8. `rule-empty-line-before` (2 errors) & `comment-empty-line-before` (1 error): Missing blank lines before rules/comments.
9. `selector-class-pattern` (1 error): Snake_case selector class name (`.status-not_fulfilled` -> kebab-case `.status-not-fulfilled` in CSS & JSX).
10. `declaration-block-no-redundant-longhand-properties` (1 error): Redundant top/right/bottom/left -> `inset: 0`.
11. `declaration-property-value-keyword-no-deprecated` (1 error): Deprecated `word-break: break-word` -> `overflow-wrap: break-word` or standard `word-break: normal`.

## Technical Strategy

1. **Strict Standards Compliance:** Address violations directly in source stylesheets rather than suppressing rules globally or ignoring CSS files in `.mega-linter.yml`.
2. **Deterministic TDD Policy Suite:** Create `scripts/tests/stylelint-css-compliance.policy.mjs` that runs with `node --test` to statically parse and validate each CSS rule violation category across all 14 files under `src/`.
3. **Phase 2 & 3 Review Gate:** Verify the policy tests are failing (RED) on the current baseline, commit and push them to `test/stylelint-css-compliance-red`, open a PR, and await user approval before touching stylesheets.
4. **Phase 4 Implementation:**
   - Format all 14 CSS stylesheets to comply with modern CSS standards (`rgb(r g b / %)` syntax, modern media range queries, clean property shorthands, kebab-case keyframes, etc.).
   - Update any coupled JSX component references (e.g., if `.status-not_fulfilled` or keyframe names are referenced in JS/JSX).
   - Verify `node --test scripts/tests/stylelint-css-compliance.policy.mjs` passes GREEN.
   - Run full regression suites (`npm test -- --run`, `npm run build`, and all policy tests).

## Testing Blueprint

### RED Policy Tests (`scripts/tests/stylelint-css-compliance.policy.mjs`)
- **Legacy color notation check:** Assert no `rgba(...)` or comma-separated `rgb(r, g, b)` syntax exists in any `.css` file in `src/`.
- **Media query syntax check:** Assert no legacy `(max-width: ...)` or `(min-width: ...)` media features exist in any `.css` file in `src/`.
- **Shorthand redundancy check:** Assert 4-value box properties with identical left/right or top/bottom values (e.g. `margin: 0 0 1.5rem 0`) are refactored to minimal notation.
- **Single-line declarations check:** Assert declaration blocks containing multiple declarations are split across lines.
- **Font family quotes check:** Assert standard font family names (`Lato`) do not use redundant quotes.
- **Keyframes pattern check:** Assert `@keyframes` names and `animation` references follow kebab-case.
- **Deprecated properties check:** Assert no deprecated keyword `break-word` for `word-break` is used.
- **Class naming pattern check:** Assert all CSS class selectors follow kebab-case (no snake_case like `.status-not_fulfilled`).

### Regression Suite
- `node --test scripts/tests/*.policy.mjs`
- `npm test -- --run` (175 tests across 21 test suites)
- `npm run build` (Vite production build)

## Edge Cases & Risk Analysis

| Scenario | Risk / Consideration | Mitigation |
|---|---|---|
| Color function conversion | Decimal alpha e.g. `0.15` must accurately map to percentage e.g. `15%`, `0.05` to `5%`, `0.08` to `8%`. | Strict regex / numeric mapping during refactor; visual check in Vitest/CSS build. |
| Keyframe renaming | Renaming `fadeIn` to `fade-in` and `slideUp` to `slide-up` could break animation if CSS `animation` property is not updated identically. | Update both `@keyframes` definitions and `animation:` declaration rules in `src/components/ProductModal.css`. |
| Class selector renaming | `.status-not_fulfilled` might be referenced dynamically in `OrderConfirmation.jsx` or similar components. | Search for `status-not_fulfilled` in `src/` and update JSX component class bindings synchronously. |
| Descending specificity | Reordering selectors could alter cascade precedence. | Carefully place generic/hover selectors in correct order without changing styling intent. |
| Media queries | `(max-width: 768px)` -> `(width <= 768px)`. | Modern browser support is universal; CSS parser in Vite/PostCSS handles it cleanly. |

## Acceptance Criteria

- [ ] `scripts/tests/stylelint-css-compliance.policy.mjs` passes cleanly.
- [ ] All 14 CSS files in `src/` adhere to standard Stylelint rules.
- [ ] Keyframe animations and class bindings remain completely functional.
- [ ] `npm test -- --run` passes (all 175 tests green).
- [ ] `npm run build` succeeds with zero errors.
- [ ] MegaLinter `CSS_STYLELINT` descriptor succeeds in CI with zero errors.
