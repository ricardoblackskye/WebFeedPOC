# Dark Text Color for Category and Sort Controls Remediation Plan

> Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Related issue:** #84

## Goal

Ensure that text elements within the Category Filter and Sort Controls components on the homepage render with readable dark text (`#2c2416` or `color: inherit` matching the page text) and appropriate contrast, replacing hardcoded semi-transparent white text (`rgb(255 255 255 / ...)`) that was unreadable against light backgrounds.

## Evidence

In the default and light theme views:
1. `src/components/CategoryFilter.css`:
   - `.category-filter-title` uses `color: rgb(255 255 255 / 90%);`
   - `.category-btn` (inactive state) uses `color: rgb(255 255 255 / 80%);`
   - `.category-count` uses `background: rgb(255 255 255 / 20%);`
   - `.category-filter` container uses `background: rgb(255 255 255 / 5%);`
2. `src/components/SortControls.css`:
   - `.sort-label` uses `color: rgb(255 255 255 / 70%);`
   - `.search-input::placeholder` uses `color: rgb(255 255 255 / 40%);`

These hardcoded white/near-white values create severe contrast issues and unreadable text when rendered on light backgrounds or matching the primary `#2c2416` text styling defined in `src/index.css`.

## Technical Strategy

1. **CategoryFilter Styling (`src/components/CategoryFilter.css`):**
   - Update `.category-filter-title` to use dark text `color: #2c2416;` (or `inherit`).
   - Update `.category-btn` to use dark text `color: #2c2416;` (or `inherit`).
   - Retain `.category-btn:hover` gold accent styling (`color: var(--color-gold);`).
   - Retain `.category-btn.active` gold background with dark text (`background: var(--color-gold); color: #1a1a1a;`).
   - Adjust `.category-count` background / border to maintain clean contrast with both active and inactive states.
   - Adjust `.category-filter` container background/border for clean aesthetic harmony with the light surface `#faf8f3`.

2. **SortControls Styling (`src/components/SortControls.css`):**
   - Update `.sort-label` to use dark text `color: #2c2416;` (or `inherit`).
   - Update `.search-input::placeholder` to use subtle dark placeholder text (e.g., `rgb(44 36 22 / 50%)` or `rgb(0 0 0 / 40%)`).

3. **Stylelint & Regression Guard:**
   - Adhere strictly to modern CSS standards (`rgb(r g b / %)` syntax, no legacy shorthand or syntax violations).
   - Verify that all 14 stylesheets pass `node --test scripts/tests/stylelint-css-compliance.policy.mjs`.

## Testing Blueprint

### RED Policy Tests (`scripts/tests/category-sort-text-color.policy.mjs`)
- **Category Filter Title Color**: Assert `.category-filter-title` in `src/components/CategoryFilter.css` does not use `rgb(255 255 255` or white text, and specifies dark text (`#2c2416`, `inherit`, or `rgb(44 36 22`).
- **Category Button Text Color**: Assert `.category-btn` in `src/components/CategoryFilter.css` does not use `rgb(255 255 255` or white text, and specifies dark text (`#2c2416`, `inherit`, or `rgb(44 36 22`).
- **Sort Label Text Color**: Assert `.sort-label` in `src/components/SortControls.css` does not use `rgb(255 255 255` or white text, and specifies dark text (`#2c2416`, `inherit`, or `rgb(44 36 22`).
- **Search Input Placeholder Color**: Assert `.search-input::placeholder` in `src/components/SortControls.css` does not use `rgb(255 255 255` or white text.

### Regression Suite
- `node --test scripts/tests/category-sort-text-color.policy.mjs`
- `node --test scripts/tests/stylelint-css-compliance.policy.mjs`
- `npm test -- --run`
- `npm run build`

## Edge Cases & Risk Analysis

| Scenario                        | Risk / Consideration                                          | Mitigation                                                                           |
|---------------------------------|---------------------------------------------------------------|--------------------------------------------------------------------------------------|
| Active category button contrast | Active button uses gold background (`var(--color-gold)`).     | Ensure `.category-btn.active` keeps dark text (`#1a1a1a`) for high contrast on gold. |
| Hover states                    | Hover states should provide clear visual feedback.            | Keep hover border and text colored with `var(--color-gold)`.                         |
| Stylelint compliance            | Any CSS edit could introduce formatting or syntax violations. | Run Stylelint policy test `scripts/tests/stylelint-css-compliance.policy.mjs`.       |

## Acceptance Criteria

- [ ] `scripts/tests/category-sort-text-color.policy.mjs` passes GREEN after implementation.
- [ ] `.category-filter-title` renders in readable dark text.
- [ ] `.category-btn` inactive buttons render in readable dark text.
- [ ] `.sort-label` renders in readable dark text.
- [ ] All Stylelint policy tests pass.
- [ ] All existing regression tests (`npm test -- --run`) and production build (`npm run build`) pass.
