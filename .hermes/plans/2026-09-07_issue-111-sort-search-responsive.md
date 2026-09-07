# Sort Controls & Search Bar Responsiveness — Issue #111

> **For Hermes:** Use the AI SDLC workflow (plan → approve → TDD → PR). This file is the Phase-2 plan. Implementer gates: wait for human approval of this plan before writing any production code (GATE 1).

**Goal:** Make the sort/search controls usable on small screens — stack vertically at ≤480px, enforce `font-size: 16px` minimum on inputs (prevents iOS focus zoom), and guarantee ≥44×44px touch targets (WCAG 2.5.5) — with Playwright e2e proving operability and filtering on a mobile viewport.

**Architecture:** The controls live in `src/components/SortControls.jsx` + `SortControls.css`, rendered on `HomePage` (and `CategoryPage`). We fix this purely in CSS (a mobile media query + min font-size + explicit control heights) — no component/DOM/new-prop changes are required because the JSX already exposes `.search-input`, `.sort-select`, and `.sort-label` and already behaves correctly. A Vitest unit test pins the new CSS contract *at the component level* (re-render + `getComputedStyle` on a mounted node), and a Playwright spec pins the rendered behaviour across the real device matrix. TDD is respected: the failing assertions (min-font / stacking / 44px target) are written first and must fail against today's CSS, then GREEN after the CSS lands.

**Tech Stack:** React 18 + Vite, CSS modules-in-repo (`*.css`), Vitest + @testing-library/react (jsdom), Playwright (`playwright.config.cjs`, 10 device projects), TypeScript via `tsc` for build. Repo lint = MegaLinter (cspell, standard, zizmor/devskim disabled) — see Lint Gate.

**Repo conventions this plan honours (verified by reading the code):**
- Breakpoint tiers (documented in `src/App.css:8`): `phone 479↓ | tablet 480–768 | small-desktop 769–1024 | desktop 1025↑`. Acceptance criterion "≤480px" in the issue maps to the **phone tier = `width <= 479px`**; the issue's "≤480px" wording is interpreted as "the small-screen / phone layout". We use `@media (width <= 479px)` to match the existing phone tier.
- Hamburger/nav breakpoint is `640px` (`src/App.css:94`); not in scope here.
- Existing e2e device projects in `playwright.config.cjs`: `chromium-desktop` (1280), `chromium-mobile-android` (360), `chromium-mobile-se` (375), `chromium-mobile-pixel5` (393), `chromium-mobile-fold` (440), `chromium-tablet-mini` (768), `chromium-tablet-android` (800), `chromium-tablet-pro` (834), `chromium-desktop-hd` (1920). The smallest mobile (360/375) and the 440 (fold, still in phone tier) are the key regression surfaces. The mobile spec asserts at `360x780` (matching `chromium-mobile-android`).

---

## Root Cause (verified)

Reading `src/components/SortControls.css` against the acceptance criteria:

1. **Not stacked on mobile.** `.sort-controls` is `display:flex; flex-wrap:wrap; gap:1rem` (lines 1–7). On a narrow phone the `search-box` (`min-width:200px`) and `sort-box` sit side-by-side and wrap only when they literally cannot fit; the `select` + label (`.sort-box`, `flex-shrink:0`) can still crowd the search input and trigger accidental taps / truncation. There is **no** explicit vertical-stack rule at ≤479px.
2. **Input font-size below 16px.** `.search-input` is `font-size:0.95rem` (15.2px @16px root) and `.sort-select` is `font-size:0.9rem` (14.4px). Both are **< 16px**, so iOS Safari auto-zooms on focus — a direct WCAG/iOS failure and an explicit acceptance criterion miss.
3. **Touch targets not guaranteed ≥44px.** `.search-input` padding `0.6rem 1rem` + line-height of `0.95rem` text ≈ height ~34px. `.sort-select` padding `0.6rem 0.8rem` + `0.9rem` text ≈ ~33px. Neither reaches the **44×44px** WCAG 2.5.5 minimum. The label sits inline beside the select, shrinking the tappable select further.

The JSX (`SortControls.jsx`) already supports everything we need — it renders `.search-box > input.search-input`, `.sort-box > label.sort-label + select.sort-select`. **No prop or DOM changes are required**; this is a CSS-only fix plus tests.

## Intended Fix (CSS-only, behaviour-preserving)

In `src/components/SortControls.css`:
- Add `@media (width <= 479px)`:
  - `.sort-controls { flex-direction: column; align-items: stretch; gap: 0.75rem; }` → search and sort stack vertically full-width.
  - `.search-box`, `.sort-box { width: 100%; }`
- Enforce min font-size on inputs to stop iOS zoom:
  - `.search-input { font-size: 16px; }` (base, all viewports — iOS rule is global, not mobile-only)
  - `.sort-select { font-size: 16px; }`
  - `.sort-label { font-size: 0.8rem; }` (label is not a focus-zoom target; keep small but legible)
- Guarantee ≥44px touch targets:
  - `.search-input { min-height: 44px; padding: 0.7rem 1rem; }`
  - `.sort-select { min-height: 44px; padding: 0.7rem 0.8rem; }`
  - `.sort-label` moves **above** the select on mobile (`.sort-box { flex-direction: column; align-items: flex-start; gap: 0.35rem; }`) so the full-width select owns the 44px target; on tablet/desktop keep the existing inline layout.

> `rem` vs `px`: font-size and min-height use `px` deliberately so the 16px/44px thresholds are exact and not affected by root `font-size` scaling. This matches the acceptance criteria literally.

## Files likely to change

| File | Action | Why |
| --- | --- | --- |
| `src/components/SortControls.css` | **Modify** | The only file needing production changes (mobile stack + min font + target size). |
| `src/components/SortControls.test.jsx` | **Modify** | Add Vitest tests pinning the CSS contract on a mounted component (RED first). |
| `e2e/search-sort.spec.ts` | **Modify** | Add a mobile-viewport `test.describe` block asserting stacking, 16px min-font, 44px target, operability, and filtering. |
| `.hermes/plans/2026-09-07_issue-111-sort-search-responsive.md` | Create (this file) | SDLC plan. |
| `.cspell.json` | **Modify (if needed)** | Add any new words (e.g. `iOS`, `WCAG`) only if MegaLinter cspell flags them — see Lint Gate. |

No changes to `HomePage.jsx`, `CategoryPage.jsx`, `SortControls.jsx`, or `package.json`.

---

## Tasks (TDD: RED → GREEN per behaviour)

### Task 1 — Vitest: assert the new CSS contract on a mounted component (RED)

**Objective:** Pin the responsive CSS contract at the unit level so a regression fails fast.

**Files:** Modify `src/components/SortControls.test.jsx`

**Step 1: Write the failing tests** (append to the existing `describe('SortControls', ...)`):

```jsx
// Helper: mount and read computed style of a selector
import { render } from '@testing-library/react'

function computedStyleFor(container, selector) {
  const el = container.querySelector(selector)
  expect(el, `${selector} should render`).toBeTruthy()
  return getComputedStyle(el)
}

it('search and sort inputs have a minimum font-size of 16px', () => {
  const { container } = render(<SortControls {...defaultProps} />)
  const input = computedStyleFor(container, '.search-input')
  const select = computedStyleFor(container, '.sort-select')
  expect(parseFloat(input.fontSize)).toBeGreaterThanOrEqual(16)
  expect(parseFloat(select.fontSize)).toBeGreaterThanOrEqual(16)
})

it('search input and sort select have a minimum height of 44px (touch target)', () => {
  const { container } = render(<SortControls {...defaultProps} />)
  const input = computedStyleFor(container, '.search-input')
  const select = computedStyleFor(container, '.sort-select')
  expect(parseFloat(input.minHeight)).toBeGreaterThanOrEqual(44)
  expect(parseFloat(select.minHeight)).toBeGreaterThanOrEqual(44)
})

it('search and sort stack vertically on a phone-width viewport', () => {
  // jsdom has no real layout; we assert the media-query rule is present in the
  // stylesheet by checking computed flex-direction switches to column at 479px.
  // jsdom does not evaluate @media, so we instead assert the CSS file contains
  // the rule; see Playwright task for true layout verification.
  const css = require('fs').readFileSync(
    require('path').resolve(__dirname, 'SortControls.css'), 'utf8')
  expect(css).toMatch(/@media\s*\(width\s*<=\s*479px\)/)
  expect(css).toMatch(/\.sort-controls\s*\{[^}]*flex-direction:\s*column/)
})
```

> Note: jsdom does **not** apply `@media` or compute real box layout, so the vertical-stack assertion is verified for real in the Playwright task. The Vitest file-level check guards the rule's existence; if you can install `jest-environment-jsdom` + `resize` it is a nice-to-have, but Playwright is the authoritative layout gate. The font-size/min-height assertions DO evaluate because `getComputedStyle` returns the **base** (non-media) values, which currently fail (0.95rem/0.9rem < 16px, no min-height) → genuine RED.

**Step 2: Run to verify RED**
Run: `npm test -- src/components/SortControls.test.jsx`
Expected: the two numeric assertions FAIL (0.95rem ≈ 15.2px < 16; minHeight 0/auto < 44). Do NOT proceed until they fail for the right reason.

**Step 3: Commit the RED test**
```bash
git add src/components/SortControls.test.jsx
git commit -m "test(#111): pin 16px min-font + 44px touch target on SortControls (RED)"
```

### Task 2 — Apply the CSS fix (GREEN)

**Objective:** Make the failing tests pass and satisfy the acceptance criteria.

**Files:** Modify `src/components/SortControls.css`

**Step 1: Add base min-font + min-height (kills the RED):**
Append/replace into the existing rules:

```css
.search-input {
  /* ...existing... */
  font-size: 16px;        /* was 0.95rem — iOS focus-zoom guard (acceptance) */
  min-height: 44px;       /* touch-target floor (WCAG 2.5.5) */
  padding: 0.7rem 1rem;   /* was 0.6rem 1rem */
}

.sort-select {
  /* ...existing... */
  font-size: 16px;        /* was 0.9rem */
  min-height: 44px;
  padding: 0.7rem 0.8rem;
}

.sort-label {
  /* ...existing... */
  font-size: 0.8rem;      /* label is not a zoom target; keep compact */
}
```

**Step 2: Append the phone-tier media query** (at end of file):

```css
/* Issue #111 — mobile (phone tier <=479px): stack search + sort vertically,
   full-width, label above select, so controls are tappable without crowding. */
@media (width <= 479px) {
  .sort-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .search-box,
  .sort-box {
    width: 100%;
  }

  .sort-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
}
```

**Step 3: Run Vitest to verify GREEN**
Run: `npm test -- src/components/SortControls.test.jsx`
Expected: all pass (font-size ≥16, min-height ≥44, CSS rule present).

**Step 4: Run the FULL Vitest suite for regressions**
Run: `npm test`
Expected: full suite passes (no regressions to `SortControls` behaviour; other suites unaffected).

**Step 5: Commit GREEN**
```bash
git add src/components/SortControls.css
git commit -m "feat(#111): min 16px font + 44px touch target + vertical stack at <=479px"
```

### Task 3 — Playwright: mobile operability + filtering (RED → GREEN)

**Objective:** Prove on a real mobile viewport that the controls stack, meet the size thresholds, are operable, and that typing filters results.

**Files:** Modify `e2e/search-sort.spec.ts` (import `revealPrimaryNav` if nav click is needed; not required for sort/search since they're on the page body, not the hamburger nav).

**Step 1: Add the mobile block** (append after the existing desktop `describe`):

```ts
test.describe('Search & sort — mobile (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test('sort controls stack vertically (search above sort)', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
    const dir = await page.locator('.sort-controls').evaluate(
      (el) => getComputedStyle(el).flexDirection
    )
    expect(dir, 'sort-controls should be column on phone').toBe('column')
  })

  test('search input and sort select have >=16px font and >=44px height', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)

    const input = page.locator('.search-input')
    const select = page.locator('.sort-select')
    for (const el of [input, select]) {
      const fs = await el.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))
      const h = await el.evaluate((e) => e.getBoundingClientRect().height)
      expect(fs, 'font-size must be >= 16px to avoid iOS zoom').toBeGreaterThanOrEqual(16)
      expect(h, 'touch target must be >= 44px (WCAG 2.5.5)').toBeGreaterThanOrEqual(44)
    }
  })

  test('sort dropdown is operable on mobile viewport', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
    const select = page.locator('.sort-select')
    await expect(select, 'select must be visible on mobile').toBeVisible()
    await select.selectOption('price-asc')
    await page.waitForTimeout(300)
    const prices = await page.locator('.product-price').allInnerTexts()
    const numeric = prices.map(p => Number.parseFloat(p.replaceAll(/[^0-9.]/g, '')))
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i]).toBeGreaterThanOrEqual(numeric[i - 1])
    }
  })

  test('typing in the search field filters results on mobile', async ({ page }) => {
    await page.goto('/')
    await waitForLoadingToFinish(page)
    await waitForProducts(page)
    const search = page.locator('.search-input')
    await expect(search, 'search input must be visible on mobile').toBeVisible()
    const before = await page.locator('.product-card').count()
    await search.fill('Victorian')
    await page.waitForTimeout(300)
    const after = await page.locator('.product-card').count()
    expect(after).toBeLessThanOrEqual(before)
    expect(after).toBeGreaterThan(0)
  })
})
```

**Step 2: Run the new block (will be RED until Task 2 CSS is in — run after Task 2 committed)**
Run: `npx playwright test --config playwright.config.cjs e2e/search-sort.spec.ts --project=chromium-mobile-android`
Expected (after GREEN): 4 passed. Before the CSS fix these fail on font-size/height/column — that is the intended RED before Task 2.

**Step 3: Run the full e2e matrix for regressions**
Run: `npx playwright test --config playwright.config.cjs`
Expected: all projects pass (the search-sort and responsive-shell suites remain green; no overflow introduced).

**Step 4: Commit**
```bash
git add e2e/search-sort.spec.ts
git commit -m "test(#111): Playwright mobile operability + filter for sort/search"
```

## Validation (run in order, report real output)

1. `npm test -- src/components/SortControls.test.jsx` → RED first (Task 1), GREEN after Task 2.
2. `npm test` → full Vitest suite passes.
3. `npx tsc --noEmit` (or `npm run build`) → 0 type errors. (CSS-only change, but confirm build stays green.)
4. `npx playwright test --config playwright.config.cjs e2e/search-sort.spec.ts` → new mobile block passes.
5. `npx playwright test --config playwright.config.cjs` → full matrix passes (10 device projects), 0 regressions vs `main`.
6. **Lint Gate (mandatory before push):** run the repo linters locally on changed files:
   - `npx cspell --config .cspell.json "src/components/SortControls.css" "src/components/SortControls.test.jsx" "e2e/search-sort.spec.ts" ".hermes/plans/2026-09-07_issue-111-sort-search-responsive.md"` — if `iOS`/`WCAG`/issue slug are flagged, **add them to `.cspell.json` words[]** (do NOT disable the linter). Current `.cspell.json` already contains `SDLC`, `viewports`, `xyzzy`, etc.; `iOS` and `WCAG` are likely new.
   - Node `standard` is applied to `.js`/`.jsx` via MegaLinter; the test file additions are plain `@testing-library/react` assertions — run `npx standard src/components/SortControls.test.jsx` to be safe and fix any style finding.
   - Confirm the plan markdown itself passes cspell (it is linted). Add new tokens there too if flagged.
   - Resolve EVERY finding before pushing. No lint failures may be pushed.

## Risks / Open Questions

- **jsdom layout limits:** Vitest cannot evaluate `@media` or real box size, so the *vertical-stack* and *44px height* assertions are authoritative only in Playwright. The Vitest file-level CSS-rule check is a backstop. If the team prefers a single source of truth, the Vitest stack test may be dropped in favour of Playwright — but keeping it gives fast local feedback. (Flagged, not blocking.)
- **Playwright browsers:** not yet installed in this environment (`~/.cache/ms-playwright` empty). The validation commands require `npx playwright install chromium` (one-time) before `npx playwright test`. This is an env setup step, not a code change.
- **"≤480px" vs phone tier `≤479px`:** the issue says ≤480px; the repo's documented phone tier is `≤479px`. I adopt `≤479px` to stay consistent with `src/App.css` and avoid a 1px discontinuity with the tablet tier (480px → 2-col). If you'd rather match the issue wording exactly at `≤480px`, say so and I'll switch the media query.
- **No `.jsx`/component change:** explicitly confirmed not needed — the JSX already exposes the required classes. If during TDD we find the label must become a separate element for accessibility, we revisit (YAGNI for now).
- **CategoryPage usage:** `SortControls` is also used on `CategoryPage` (per search_files). The CSS fix applies globally to the component, so it benefits both pages automatically. No page-level change required.

## Acceptance Criteria → Coverage map

| Criterion | Covered by |
| --- | --- |
| Sort controls + search stack vertically at ≤480px | CSS `@media (width<=479px)` + Playwright `flex-direction: column` test |
| All form inputs ≥16px font | CSS `font-size:16px` + Vitest + Playwright assertions |
| Touch targets ≥44px | CSS `min-height:44px` + Vitest + Playwright `getBoundingClientRect().height` |
| Playwright: sort dropdown + search operable on mobile | `sort dropdown is operable` + `typing filters results` tests |
| Playwright: type in search → results filter | `typing in the search field filters results on mobile` |
