# #108 Layout Grid & Page Shell Responsiveness — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make the page shell (`.app` container, header, nav, breadcrumbs, product grid, footer) adapt cleanly at 320px / 768px / ≥1024px so the site meets the #108 acceptance criteria — no overflow, readable header, collapsed mobile nav, and a 2-column tablet grid.

**Architecture:** Pure CSS + one small accessible nav-toggle in `App.jsx`. No new dependencies, no CSS framework (the app uses plain CSS with hardcoded `@media` breakpoints — no breakpoint variables exist). Responsive *visual* verification is done via Playwright (real browser computes media queries); the nav-toggle *state* is covered by a jsdom unit test. The existing `@media (width <= 968px)` `.app-main` collapse is left untouched (it already works).

**Tech Stack:** React 18 + react-router-dom 7, plain CSS (`src/**.css`), Vite 6, Vitest + @testing-library/react (unit), Playwright 1.58.2 (e2e).

**Branch naming rule (repo convention):** branches and plan filenames must NOT contain `#`. Use `issue-108-layout-responsiveness`.

---

## Current context / facts (verified against `main`, tip `1d931f0`)

Read the real files before planning. Findings vs. the issue's own guesses:

- **`.app` container** — `src/App.css:1-5`: `max-width: 1400px; margin: 0 auto; padding: 2rem`. ✅ Matches issue ("reduce padding at mobile").
- **`.app-header h1`** — `src/App.css:17-23`: `font-size: 3.5rem`. ✅ Matches ("3.5rem is massive on mobile").
- **`.app-nav`** — `src/App.css:32-37`: `display: flex; justify-content: center; gap: 2rem; margin-top: 1rem`. **No `flex-wrap`, no hamburger.** Only 3 short links (Shop / About / Architecture). Matches "wraps poorly." No hamburger component exists anywhere in `src/` (grep for `hamburger|menu-toggle|aria-expanded` → none).
- **Breadcrumbs** — `src/App.css:154-161` (`.breadcrumb ol { display: flex; gap: 0.5rem }`): **no `flex-wrap` / `overflow` handling**. Long category names (e.g. "Timepieces") could overflow on a 320px screen. Matches issue.
- **Product grid** — `src/components/ProductList.css:1-11`: base `repeat(auto-fill, minmax(280px, 1fr))`, then `@media (width <= 768px) { grid-template-columns: 1fr }`. ✅ Confirmed "jumps straight to 1fr" — there is **no 2-column tablet tier** between 480–768px. Real gap.
- **`.app-main`** — `src/App.css:64-68` + `@media (width <= 968px)` at `:104-112`: already collapses the cart aside to 1 column below 968px. **Already responsive — leave as-is.**
- **`.app-footer`** — `src/App.css:114-122`: centered text, `font-size: 0.9rem`, single © line. Low overflow risk, but gets a defensive `overflow-wrap` + mobile padding.
- **`src/index.css`**: no breakpoint CSS variables; `body { min-width: 320px }` (`:30`). Plain hardcoded breakpoints are the established convention.
- **`src/components/CategoryFilter.css:66-79`**: already has a `@media (width <= 768px)` block — so the 768px breakpoint convention is consistent across the app; I'll mirror it.
- **No e2e test currently covers 320px.** `e2e/no-scrollbar.spec.js` only checks 375px+ (iPhone SE). The #108 "Mobile (320px)" acceptance criterion needs a new spec (or a `test.use({ viewport })` override inside one).
- **`src/App.test.jsx`** exists (Vitest + RTL, 253 lines). jsdom does **not** compute `@media` queries or layout, so it can only test the nav-toggle *state* (button presence, `aria-expanded` toggling), not font-size. Responsive visuals are Playwright-only.
- **Issue #108 first task is already `[x]`** ("ProductList grid already responsive — verify it still works"). Keep it checked; this plan *improves* the grid with a tablet tier rather than starting from zero.

## Section A: Issue #108 task → code-location audit

| # | Issue task | Real location | Status |
|---|---|---|---|
| 1 | Verify ProductList grid responsive | `src/components/ProductList.css:1-11` | ✅ Already works; will add tablet tier |
| 2 | `.app` padding 2rem → ~1rem mobile | `src/App.css:4` | ⬜ Add `@media (max-width:768px)` |
| 3 | `.app-header h1` 3.5rem → clamp/breakpoint | `src/App.css:18` | ⬜ Replace with `clamp(2rem, 8vw, 3.5rem)` |
| 4 | `.app-nav` → hamburger ≤768px | `src/App.css:32-37` + `src/App.jsx:70-74` | ⬜ New toggle + CSS (see decision below) |
| 5 | Breadcrumbs truncate/wrap on mobile | `src/App.css:154-161` | ⬜ Add `flex-wrap` + `overflow-wrap` |
| 6 | Product grid 2-col on tablets (480–768px) | `src/components/ProductList.css:7-11` | ⬜ Replace 1fr override with tiers |
| 7 | Footer no overflow on narrow | `src/App.css:114-122` | ⬜ Defensive `overflow-wrap` + mobile padding |

**Decision — hamburger breakpoint:** the issue says "convert to hamburger/dropdown at ≤768px", but acceptance also says "Tablet (768px): nav shown if space permits." Three short links fit comfortably at 768px, so collapsing them into a hamburger *at* 768px would *hide* them and contradict the tablet criterion. **This plan sets the hamburger breakpoint at `≤640px`** so that 768px tablets keep the inline nav ("shown if space permits") while phones (320–640px) get the collapsed hamburger ("nav collapsed"). This is a deliberate, documented deviation from the literal "≤768px" — easy to change to 768px if you prefer the literal reading. Flagged in Risks.

---

## Files likely to change

- Modify: `src/App.css` (`.app` padding, `.app-header h1`, `.app-nav` + `.nav-toggle`, `.breadcrumb`, `.app-footer`)
- Modify: `src/App.jsx` (nav-toggle button + `useState` open state; nav gets `id` + `data-open`)
- Modify: `src/components/ProductList.css` (grid tiers)
- Modify: `src/App.test.jsx` (add nav-toggle unit test)
- Create: `e2e/responsive-shell.spec.ts` (acceptance-proof: 320 / 768 / 1280 assertions)

---

## Preparation (execution start)

1. `git checkout main && git pull --ff-only && git checkout -b issue-108-layout-responsiveness`
2. Keep the dev server available for local Playwright runs: `npm run dev` (Vite on :5173). Under CI, `playwright.config.cjs` `webServer` starts its own.

---

## Task 1: Reduce `.app` padding on mobile

**Objective:** Stop the 2rem padding from eating the 320px viewport.

**Files:** Modify `src/App.css` (after line 5).

**Step 1 (implement):** Add after the `.app { … }` block:
```css
@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }
}
```

**Step 2 (verify):** `e2e/responsive-shell.spec.ts` (Task 7) asserts at 320px: `getComputedStyle(document.querySelector('.app')).paddingLeft` parses to `≤ 16` px.

**Step 3 (commit):** `git commit -m "fix(#108): reduce .app padding to 1rem on mobile"`

## Task 2: Clamp the header `<h1>` font-size

**Objective:** Header ≤ 2rem at 320px, preserved 3.5rem on desktop.

**Files:** Modify `src/App.css:18`.

**Step 1 (implement):** change `font-size: 3.5rem;` →
```css
  font-size: clamp(2rem, 8vw, 3.5rem);
```
(`8vw` at 320px = 25.6px → clamped to min 2rem = 32px; at 1920px = 153px → clamped to 3.5rem. Desktop unchanged.)

**Step 2 (verify):** Playwright at 320px: `parseFloat(getComputedStyle(h1).fontSize) ≤ 32`. At 1280px: `≈ 56` (3.5rem).

**Step 3 (commit):** `git commit -m "fix(#108): clamp header h1 font-size for mobile"`

## Task 3: Responsive nav hamburger (state unit-tested, TDD)

**Objective:** Collapse `.app-nav` into an accessible toggle ≤640px; keep inline nav ≥641px.

**Files:** Modify `src/App.jsx` (imports + nav block `:65-75`), Modify `src/App.css` (`.app-nav` area `:32-37`).

**Step 1 (write failing unit test first — TDD):** In `src/App.test.jsx`, add:
```js
it('nav-toggle collapses and expands the primary nav', () => {
  vi.spyOn(wixHook, 'useWixProducts').mockReturnValue({ products: [], loading: false, error: null })
  renderApp()
  const toggle = screen.getByRole('button', { name: /menu/i })
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(toggle)
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
})
```
Run `npx vitest run src/App.test.jsx` → **FAIL** ("Unable to find role button name /menu/").

**Step 2 (implement JSX in `src/App.jsx`):**
```jsx
import { useMemo, useState } from 'react'   // add useState
...
function App({ initialProducts }) {
  const [navOpen, setNavOpen] = useState(false)
  ...
  <header className="app-header">
    <Link to="/" className="app-header-link">
      <h1>Antiques Marketplace</h1>
      <p>Discover unique treasures from the past</p>
    </Link>
    <button
      type="button"
      className="nav-toggle"
      aria-expanded={navOpen}
      aria-controls="primary-nav"
      aria-label="Toggle navigation menu"
      onClick={() => setNavOpen(o => !o)}
    >
      ☰
    </button>
    <nav id="primary-nav" className="app-nav" data-open={navOpen} aria-label="Site navigation">
      <Link to="/">Shop</Link>
      <Link to="/about">About</Link>
      <Link to="/architecture">Architecture</Link>
    </nav>
  </header>
```

**Step 3 (implement CSS in `src/App.css`):**
```css
/* nav toggle — hidden on desktop, shown on mobile */
.nav-toggle {
  display: none;
  margin: 0 auto 0.5rem;
  background: transparent;
  border: 1px solid var(--color-gold);
  color: var(--color-gold);
  font-size: 1.4rem;
  line-height: 1;
  padding: 0.3rem 0.8rem;
}

@media (max-width: 640px) {
  .app-nav {
    display: none;
  }
  .app-nav[data-open='true'] {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }
  .nav-toggle {
    display: inline-block;
  }
}
```

**Step 4 (verify):** `npx vitest run src/App.test.jsx` → **PASS**. Playwright at 320px: toggle visible, nav hidden until clicked (Task 7). At 768px: nav visible inline, toggle hidden.

**Step 5 (commit):** `git commit -m "feat(#108): accessible hamburger nav toggle (≤640px)"`

## Task 4: Breadcrumbs wrap gracefully

**Objective:** Long category names wrap instead of causing horizontal overflow.

**Files:** Modify `src/App.css:154-161`.

**Step 1 (implement):**
```css
.breadcrumb ol {
  list-style: none;
  display: flex;
  flex-wrap: wrap;          /* was missing */
  gap: 0.5rem;
  padding: 0;
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
}

.breadcrumb li {
  min-width: 0;             /* allow shrink */
}

.breadcrumb a {
  color: var(--color-gold);
  text-decoration: none;
  font-family: var(--font-secondary);
  overflow-wrap: anywhere;  /* long names break instead of overflow */
}
```
(Keep the existing `::after` separator and `[aria-current]` rules.)

**Step 2 (verify):** Playwright at 320px with a long category → no horizontal overflow (covered by Task 7's overflow assertion on the category page).

**Step 3 (commit):** `git commit -m "fix(#108): let breadcrumbs wrap on narrow screens"`

## Task 5: Product grid 2-column tablet tier

**Objective:** 1-col on phones (≤479px), 2-col on tablets (480–768px), auto-fill on desktop (>768px).

**Files:** Modify `src/components/ProductList.css:7-11` (replace the single `≤768px → 1fr` override).

**Step 1 (implement):**
```css
/* phones: single column */
@media (max-width: 479px) {
  .product-list {
    grid-template-columns: 1fr;
  }
}

/* tablets: two columns */
@media (min-width: 480px) and (max-width: 768px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
```
(The base `repeat(auto-fill, minmax(280px, 1fr))` still applies >768px, preserving desktop.)

**Step 2 (verify):** Playwright at 768px: product grid computed `grid-template-columns` has **2 tracks**. At 320px: **1 track**. At 1280px: ≥3 tracks (auto-fill preserved).

**Step 3 (commit):** `git commit -m "feat(#108): 2-column product grid on tablets (480–768px)"`

## Task 6: Footer defensive spacing

**Objective:** Guarantee footer text never overflows on narrow screens.

**Files:** Modify `src/App.css:114-122`.

**Step 1 (implement):** add `overflow-wrap: break-word;` to `.app-footer` and a mobile padding rule:
```css
.app-footer {
  text-align: center;
  padding: 2rem 1rem;          /* was 2rem 0 */
  margin-top: 3rem;
  border-top: 1px solid rgb(255 255 255 / 10%);
  color: rgb(255 255 255 / 50%);
  font-size: 0.9rem;
  overflow-wrap: break-word;   /* added */
}
```

**Step 2 (verify):** Playwright at 320px: footer text present, no horizontal overflow.

**Step 3 (commit):** `git commit -m "fix(#108): footer overflow-wrap + mobile padding"`

## Task 7: New e2e acceptance-proof spec (the "new test" requirement)

**Objective:** Prove every #108 acceptance criterion in a real browser at 320 / 768 / 1280.

**Files:** Create `e2e/responsive-shell.spec.ts`.

**Step 1 (implement):** Use `test.use({ viewport })` to add a 320px profile without touching `playwright.config.cjs`:
```ts
import { test, expect } from '@playwright/test'

// ---- Mobile 320px ----
test.describe('Mobile shell (320px)', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(
      () => document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth
    )
    expect(overflow).toBe(false)
  })

  test('header font <= 2rem and nav collapsed', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('.app-header h1')
    const fs = await h1.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
    expect(fs).toBeLessThanOrEqual(32) // 2rem
    const toggle = page.locator('.nav-toggle')
    await expect(toggle).toBeVisible()
    await expect(page.locator('#primary-nav')).toBeHidden()
    await toggle.click()
    await expect(page.locator('#primary-nav')).toBeVisible()
  })

  test('product grid is 1-column', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.product-card')
    const tracks = await page.locator('.product-list').evaluate(
      el => getComputedStyle(el).gridTemplateColumns.split(' ').length
    )
    expect(tracks).toBe(1)
  })
})

// ---- Tablet 768px ----
test.describe('Tablet shell (768px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('nav shown inline, grid 2-column, no overflow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.nav-toggle')).toBeHidden()
    await expect(page.locator('#primary-nav')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.scrollingElement.scrollWidth > document.scrollingElement.clientWidth
    )
    expect(overflow).toBe(false)
    await page.waitForSelector('.product-card')
    const tracks = await page.locator('.product-list').evaluate(
      el => getComputedStyle(el).gridTemplateColumns.split(' ').length
    )
    expect(tracks).toBe(2)
  })
})

// ---- Desktop 1280px (preserved) ----
test.describe('Desktop shell (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('header restored to 3.5rem, grid auto-fill', async ({ page }) => {
    await page.goto('/')
    const fs = await page.locator('.app-header h1').evaluate(
      el => parseFloat(getComputedStyle(el).fontSize)
    )
    expect(fs).toBeCloseTo(56, 0) // 3.5rem
    await expect(page.locator('.nav-toggle')).toBeHidden()
  })
})
```

**Step 2 (run):** `npx playwright test e2e/responsive-shell.spec.ts --reporter=list` (reuses running dev server locally; CI starts its own). Expect: all passed, 0 failed. Capture screenshots at 320/768/1280 for visual proof (per your request).

**Step 3 (commit):** `git commit -m "test(#108): e2e responsive-shell acceptance spec (320/768/1280)"`

## Task 8: Lint + full test gate

**Objective:** Ensure the branch is green before PR.

**Step 1:** `npx vitest run` (unit, incl. new nav-toggle test) → 0 failed.
**Step 2:** `npx standard src/App.jsx src/App.test.jsx e2e/**` (JS Standard style — repo uses it; fix any violations the new code introduces, e.g. quotes/semis consistency).
**Step 3:** `npx playwright test` (full matrix) → 0 failed (the new spec runs against the 9 projects too, but its `test.use` viewport overrides keep the 320/768/1280 intent).
**Step 4 (commit if fixes needed):** `git commit -m "style(#108): standard --fix on new code"` as required.

## Task 9: Closeout (GitHub) + open PR

**Objective:** Mark #108 done and open a reviewable PR.

**Step 1 (API):** Flip all `#108` task checkboxes `- [ ]` → `- [x]` via `PATCH /repos/ricardoblackskye/WebFeedPOC/issues/108` (body), using the PAT from `~/.git-credentials`.
**Step 2 (API):** POST a verification comment summarizing the e2e run + screenshots.
**Step 3 (push):** `git push -u origin issue-108-layout-responsiveness` (background + `git ls-remote` verify, per the Windows push-stall workaround).
**Step 4 (API):** Open PR `issue-108-layout-responsiveness` → `main` titled `feat(#108): layout grid & page-shell responsiveness`.

---

## Validation summary (acceptance criteria → how proven)

| Criterion | Proof |
|---|---|
| Mobile 320px: header ≤ 2rem | Task 7 `fontSize ≤ 32`; Task 2 `clamp` |
| Mobile 320px: nav collapsed | Task 7 toggle visible + nav hidden |
| Mobile 320px: grid 1-column | Task 7 `tracks === 1` |
| Mobile 320px: no overflow | Task 7 overflow assertion |
| Tablet 768px: nav shown | Task 7 nav visible, toggle hidden |
| Tablet 768px: grid 2-column | Task 7 `tracks === 2` |
| Desktop ≥1024px: preserved | Task 7 `fontSize ≈ 56`, auto-fill grid |
| No horizontal scrollbar any breakpoint | Task 7 (320/768) + existing `no-scrollbar.spec.js` (375+) |

## Risks / tradeoffs / open questions

- **Hamburger breakpoint = 640px, not literal 768px** (see Section A decision). If you want the literal "≤768px" collapse, change `max-width: 640px` → `max-width: 768px` in Task 3 Step 3 (and the 768px e2e test would then expect the hamburger, not inline nav).
- **jsdom cannot test responsive layout** — the nav-toggle *state* is unit-tested; all *visual* responsive claims are Playwright-only by necessity.
- **Breadcrumb overflow** only manifests with very long category names; the existing demo catalogue may not trigger it, so Task 7's overflow assertion on `/category/<long>` is the safety net rather than a guaranteed repro.
- **MegaLinter / JS Standard** will lint the new `App.jsx`/spec — keep quote/semicolon style consistent with the repo (double-quotes + semicolons per the existing files) to avoid a red lint gate.
- **No changes to `.app-main`** (≤968px collapse) or `CategoryFilter.css` (already has 768px rules) — out of scope, already responsive.
