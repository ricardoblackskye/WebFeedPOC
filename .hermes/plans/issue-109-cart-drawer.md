# #109 Cart Sidebar → Slide-Over Drawer on Mobile — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task. Strict TDD (RED → GREEN → REFACTOR) per the AI SDLC workflow; two human gates (plan approval, then PR authorization).

**Goal:** On ≤768px the shopping cart becomes a slide-over drawer (off-canvas from the right, toggle button + item-count badge in the header, backdrop overlay, focus trap, ESC-to-close, swipe-to-dismiss); on >768px the existing sticky sidebar is preserved unchanged.

**Architecture:** Plain CSS + two small accessible controls in `App.jsx` (`cartToggleOpen` state, a header cart button with an `aria-expanded`/badge, the existing `.cart-section` re-skinned as a drawer via a `data-drawer-open` attribute). The `Cart` component is **controlled** — its `items`/`onUpdateQuantity`/`onRemoveItem`/`totalPrice`/`totals`/`useWixBackend` all come from `App.jsx` via `useWixCart()`. Because the header badge must show `items.length`, the drawer open/close state **must** live in `App.jsx` and be threaded down to `Cart` as a `isDrawerOpen` / `onCloseDrawer` pair (Cart already owns its internal checkout/quantity handlers, so it keeps them). No new runtime dependencies. Responsive visuals are Playwright-only (jsdom doesn't compute `@media`); focus-trap/ESC/keyboard are covered by jsdom unit tests.

**Tech Stack:** React 18 + react-router-dom 7, plain CSS (`src/**.css`), Vite 6, Vitest + @testing-library/react (unit), Playwright 1.58.2 (e2e, device projects in `playwright.config.cjs`).

**Branch naming rule (repo convention):** branches and plan filenames must NOT contain `#`. Branch = `feat/cart-drawer-109`; plan filename = `issue-109-cart-drawer.md`.

---

## Current context / facts (verified against `main`, tip `8cae042`)

Read the real files before planning. Findings:

- **Cart render site** — `src/App.jsx:94-105`: `<aside className="cart-section">` wraps `<Cart .../>`. `Cart` receives `items={cart}`, `onUpdateQuantity={updateQuantity}`, `onRemoveItem={removeFromCart}`, `totalPrice={totals.total}`, `error`/`loading`/`useWixBackend`/`totals` from `useWixCart()`. There is **no** cart toggle, badge, or drawer markup anywhere.
- **Cart CSS** — `src/components/Cart.css:1-7`: `.cart { background; border-radius; padding:1.5rem; position: sticky; top: 2rem; }`. This sticky behaviour is exactly the desktop sidebar behaviour to **preserve** on >768px and **suppress** on ≤768px.
- **Page shell grid** — `src/App.css:115-119`: `.app-main { display:grid; grid-template-columns: 1fr 350px; gap:2rem }`. At `width <= 968px` (`:155-163`) it collapses to a single column and reorders `.cart-section` to `order:-1` (cart shows full-width **above** products).
- **Header** — `src/App.jsx:67-87`: `.app-header` holds the title `<h1>`, the existing `.nav-toggle` (hamburger, appears ≤640px), and `#primary-nav`. The cart button + badge will be added here.
- **Breakpoint scale** — `src/index.css:13-27` documents the repo scale: phone ≤479, hamburger ≤640, tablet ≤768, sm-desktop ≤1024. `App.css` media queries use range notation (`width <= 968px`, `width <= 640px`) — the established style. New queries must use the same `width <= Npx` notation to pass stylelint `media-feature-range-notation`.
- **Accessibility precedent** — the existing hamburger (`App.jsx:72-81`) uses `aria-expanded`, `aria-controls`, `aria-label`, and a native `<button>` — I'll mirror that exactly for the cart toggle.
- **Tests present** — `src/components/Cart.test.jsx` (jsdom, mocks `wixCheckoutService`), `src/App.test.jsx` (jsdom), `e2e/cart.spec.ts` (desktop interactions), `e2e/responsive-shell.spec.ts` (320/768/1280 shells), `e2e/helpers.ts` (`waitForProducts`, `revealPrimaryNav`). The `chromium-mobile-*` device projects run at 360/375/393/440px viewports.
- **No e2e test currently covers the cart drawer.** `e2e/cart.spec.ts` only asserts cart content/quantity/checkout, and runs at desktop viewport (`@playwright/test` default 1280×720). The #109 acceptance criteria ("open cart on mobile viewport → verify overlay visible → dismiss → verify hidden") need a new spec (or `test.use({ viewport })` overrides inside `cart.spec.ts`).
- **`useWixCart` exposes `cart`** (`src/hooks/useWixCart.js:225-237`) — `App.jsx` already has `cart.length` available for the badge.

### Section A: Issue #109 task → code-location audit

| # | Issue task | Real location | Status |
|---|---|---|---|
| 1 | Audit `.cart` component (sticky `top:2rem`) | `src/components/Cart.css:1-7` | ✅ Confirmed sticky sidebar; to suppress ≤768px, keep base + add `width <= 768px` override |
| 2 | Drawer pattern: cart hidden off-screen, toggled by header icon/badge | `src/App.jsx:67-105` + `src/App.css` + `Cart.css` | ⬜ New `.cart-btn` + badge in header; `.cart-section` becomes drawer ≤768px |
| 3 | Backdrop overlay when drawer open | `src/App.jsx` (new element) + `App.css` | ⬜ `.cart-backdrop` with `aria-hidden`, click-to-close |
| 4 | Cart icon in header shows item-count badge | `src/App.jsx:67-87` | ⬜ `.cart-btn .cart-badge` = `cart.length` |
| 5 | Swipe-to-dismiss on touch devices | `Cart.css` / drawer container (pointer/touch events) | ⬜ `touchstart`/`touchend` handler on drawer; CSS transition |
| 6 | Playwright: open cart mobile → overlay visible → dismiss → hidden | `e2e/cart.spec.ts` | ⬜ Add mobile viewport describe block |
| 7 | A11y: focus trap, ESC to close, `aria-expanded` on toggle | `src/App.jsx` + `Cart.jsx` | ⬜ Effect trap + ESC handler; `aria-expanded` on `.cart-btn` |

**Decision — drawer breakpoint (flagged deviation from literal issue text):** The issue's acceptance criteria say "On ≤768px: cart is a slide-over drawer" and "On >768px: cart remains sticky sidebar." But `.app-main` **already collapses the cart to full-width single-column at ≤968px** (App.css:155, shipped in #108). If the drawer were only ≤768px, then at **769–968px** the cart would be full-width single-column (per #108) yet *not* a drawer (per a 768px-only rule) — an awkward full-width block with no sticky context. Two coherent options:
  - **(A) Align the drawer to the existing grid-collapse at 768px boundary but keep the 969–1024 gap as full-width single column** → ambiguous.
  - **(B, chosen) Set the drawer breakpoint at `width <= 768px`** (matching the issue's literal AC and the documented `--bp-tablet-max: 768px`) **and** accept that 769–968px shows the cart as a full-width single-column block (current #108 behaviour, unchanged). On ≤768px it is the drawer; on >768px (the `1fr 350px` two-column grid) it is the sticky sidebar. This keeps the issue's AC literally true ("≤768px = drawer, >768px = sticky sidebar") and does **not** alter the #108 grid collapses. The 769–968px full-width block is pre-existing #108 behaviour, not introduced here. Documented in code comments + `index.css` note.

  If you'd rather the drawer extend up to 968px (so it's never a full-width block), say so at approval and I'll change the breakpoint from 768 to 968 (one media-query value).

---

## Section B: SPELL / MegaLinter issues (evidence + fix)

**Evidence gathered (this session):**
1. Ran `npx cspell@10.2.2 "**/*.{ts,tsx,js,jsx,md,json,yml,yaml,css}" --no-progress` against `main` → **`Files checked: 132, Issues found: 0`**. So there is **no current SPELL failure** on `main`. The "SPELL megalinter issues" are therefore (a) a latent config defect and (b) the recurring cspell-vocabulary churn that will re-fire once #109 adds new technical terms.
2. **Duplicate cspell config (config defect).** The repo ships **two** dictionaries:
   - `cspell.json` (root, **non-hidden**, 65 words) — older/smaller list.
   - `.cspell.json` (root, **hidden**, 91 words) — the canonical one; `git log` shows it's the actively maintained file (e.g. #139 added `SDLC`, `tweetsodium`, `minmax` to `.cspell.json`).
   cspell auto-detects config by walking up from each file; a root non-hidden `cspell.json` can be picked up and mask the hidden `.cspell.json`, causing inconsistent/duplicated dictionary behaviour and confusing future lint runs. **Consolidate to the single canonical `.cspell.json` and delete the stray `cspell.json`.**
3. **Vocabulary churn (the recurring cause of SPELL failures).** #109 introduces terms cspell does not yet know: `slide-over`, `off-canvas`, `offcanvas`, `drawer` (as UI term), `swipe-to-dismiss`, `focus-trap`/`focustrap`, `backdrop`, `aria-expanded`, `aria-controls`, `toggleable`, `toggleable`, `trap-focus`, `body-scroll-lock`/`scroll-lock`, `vconsole` (if any). A fresh MegaLinter run on the #109 diff would flag these as unknown words. **Pre-seed them into `.cspell.json`** so the PR diff is cspell-clean (matching the repo's established pattern — see #108 which added `minmax`).

**SPELL fix tasks (low risk, config + dictionary only):**
- B1. Delete the stray duplicate `cspell.json` (keep `.cspell.json` as the sole dictionary).
- B2. Add the #109 vocabulary to `.cspell.json` `words[]` (alphabetised, no dupes of existing entries already present: `behaviour`, `minmax`, `vite`, `vercel`, `webfeed`, `ecom` already there).
- B3. Local lint gate: re-run `npx cspell "**/*"` after the #109 code lands and confirm **0 issues** (this is the MANDATORY pre-push gate from the AI SDLC workflow). Also run `npx standard` stylelint-equivalent (the repo uses `standard` for JS + stylelint via MegaLinter; `npm test` runs vitest — see note below) and confirm no new findings on changed files.

> Note on the lint command: the repo's `npm test` is `vitest` (unit only). MegaLinter (in CI) is the actual SPELL/style gate. Locally I will run `npx cspell` directly (the SPELL descriptor) and, for the changed `.css`, ensure range-notation media queries (stylelint `media-feature-range-notation`) — already the established style — are used. The `DISABLE_LINTERS` in `.mega-linter.yml` already turns off `TYPESCRIPT_STANDARD` and `REPOSITORY_DEVSKIM`; SPELL_CSPELL stays enabled (policy from `plans/fix-cspell-lychee-findings.md` — never disable it).

---

## Files likely to change

- Modify: `src/App.jsx` (header `.cart-btn` + badge; `cartDrawerOpen` state; `aria-expanded`; pass `isDrawerOpen`/`onCloseDrawer` to `Cart`; backdrop element; ESC + focus-trap effect; swipe handlers live in `Cart`)
- Modify: `src/components/Cart.jsx` (accept `isDrawerOpen`, `onCloseDrawer`; render drawer header "Close" button + `aria-modal`/`role="dialog"`; swipe-to-dismiss touch handlers on the drawer surface)
- Modify: `src/components/Cart.css` (keep base sticky sidebar; add `width <= 768px` drawer transform/off-canvas + transition; `.cart-backdrop`; badge styles live in `App.css`)
- Modify: `src/App.css` (`.cart-btn`, `.cart-badge`, `.cart-backdrop` styles; `width <= 768px` rule that turns `.cart-section` into a fixed off-canvas panel)
- Modify: `.cspell.json` (add #109 words)
- Delete: `cspell.json` (stray duplicate)
- Modify: `src/App.test.jsx` (add: toggle opens/closes drawer, badge shows count, ESC closes, `aria-expanded` toggles)
- Modify: `src/components/Cart.test.jsx` (add: close button calls `onCloseDrawer`; swipe handler present/guarded; `role="dialog"` + `aria-modal` when drawer)
- Modify: `e2e/cart.spec.ts` (add mobile-viewport describe block: open → overlay visible → dismiss → hidden; keyboard operable)
- Possibly modify: `e2e/responsive-shell.spec.ts` (assert no horizontal overflow with cart drawer present at 320/768)

---

## Preparation (execution start, after approval)

1. `git checkout main && git pull --ff-only && git checkout feat/cart-drawer-109` (already branched).
2. `npm install` (node_modules absent; required for vitest + cspell local gate). Use the repo's `npm` (the host has python=3.11 but node toolchain via npm). Run in background; verify with `npm ls vitest`.
3. Keep `npm run dev` (Vite :5173) available for local Playwright; under CI `playwright.config.cjs` `webServer` starts its own.

---

## TDD Tasks (RED → GREEN → REFACTOR, one behaviour per cycle)

### Task 1: Header cart toggle button + item-count badge (desktop + a11y)
**Objective:** A header button shows the cart item count and toggles drawer open state; exposes `aria-expanded`.

**Files:** `src/App.jsx`, `src/App.css`, `src/App.test.jsx`

**Step 1 (RED) — write failing unit test** in `src/App.test.jsx`:
```jsx
it('renders a cart toggle button with aria-expanded false when closed', () => {
  render(<App initialProducts={[]} />)
  const btn = screen.getByRole('button', { name: /cart/i })
  expect(btn).toHaveAttribute('aria-expanded', 'false')
})
it('cart badge shows the number of items', () => {
  render(<App initialProducts={[{ id:'1', name:'A', price:10, quantity:3, category:'x' }]} />)
  // seed cart via context is complex; instead assert the badge element exists with count after adding
  // (use the existing add-to-cart path or a test hook — see plan note)
})
```
Run `npm test -- App.test.jsx`; expect FAIL ("Unable to find role button name /cart/").

**Step 2 (GREEN):** In `App.jsx` add `const [cartDrawerOpen, setCartDrawerOpen] = useState(false)`. Render in `.app-header`:
```jsx
<button type="button" className="cart-btn" aria-expanded={cartDrawerOpen}
  aria-controls="cart-drawer" aria-label={`Cart, ${cart.length} items`}
  onClick={() => setCartDrawerOpen(o => !o)}>
  🛒 <span className="cart-badge" aria-hidden="true">{cart.length}</span>
</button>
```
Add `.cart-btn` / `.cart-badge` base styles in `App.css` (visible at all widths; on >768px it still works as an alternative opener but the sticky sidebar is also visible — see Task 4 for the >768px rule that hides the button).

**Step 3:** Run `npm test -- App.test.jsx`; expect PASS. Commit (RED+GREEN together per cycle: `git commit -m "test/feat(#109): cart toggle button + badge"`).

> Plan note on cart seeding in jsdom: `App` pulls `cart` from `useWixCart` which reads `localStorage` on mount. For the badge-count test, set `localStorage.setItem('antiques_cart', JSON.stringify([...]))` before render, or test the badge via the existing `Cart` unit tests. Keep it simple: assert `aria-expanded` toggling on click (the core a11y contract) and that the badge text equals `cart.length` after seeding localStorage.

### Task 2: Drawer open/close state + ESC-to-close (jsdom)
**Objective:** Clicking the button toggles `aria-expanded`; pressing ESC closes; `onCloseDrawer` prop reaches `Cart`.

**Step 1 (RED):** In `App.test.jsx`:
```jsx
it('toggles aria-expanded on click', () => { /* click → 'true', click → 'false' */ })
it('closes the drawer on Escape', () => { /* fireEvent.keyDown(document, {key:'Escape'}) → aria-expanded 'false' */ })
```
Expect FAIL (no toggle/ESC handler yet).

**Step 2 (GREEN):** Add ESC handler via `useEffect` in `App.jsx`:
```jsx
useEffect(() => {
  if (!cartDrawerOpen) return
  const onKey = (e) => { if (e.key === 'Escape') setCartDrawerOpen(false) }
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
}, [cartDrawerOpen])
```
Thread `isDrawerOpen={cartDrawerOpen} onCloseDrawer={() => setCartDrawerOpen(false)}` into `<Cart>`.

**Step 3:** Run tests; PASS. Commit.

### Task 3: Drawer CSS — off-canvas slide-over ≤768px, sticky sidebar >768px
**Objective:** At ≤768px `.cart-section` is fixed off the right edge (translateX(100%)) and slides in when open; backdrop visible. At >768px it stays the sticky sidebar (existing look).

**Step 1 (RED):** In `e2e/cart.spec.ts` add a **mobile** describe block (this is the visual oracle; jsdom can't compute transform):
```ts
test.describe('Cart drawer on mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 } })
  test.beforeEach(async ({ page }) => { await page.goto('/'); await waitForLoadingToFinish(page); await waitForProducts(page) })
  test('cart drawer is off-screen and hidden until toggled', async ({ page }) => {
    await expect(page.locator('#cart-drawer')).toBeHidden()
    await page.locator('.cart-btn').click()
    await expect(page.locator('#cart-drawer')).toBeVisible()
    await expect(page.locator('.cart-backdrop')).toBeVisible()
    await page.locator('.cart-backdrop').click()
    await expect(page.locator('#cart-drawer')).toBeHidden()
  })
})
```
Run `npx playwright test e2e/cart.spec.ts --project chromium-mobile-se`; expect FAIL (no `#cart-drawer`/`.cart-backdrop`, `.cart-btn` not present).

**Step 2 (GREEN):** Add `id="cart-drawer"` to the `<aside className="cart-section">` in `App.jsx`. In `Cart.css` keep base sticky; in `App.css` add:
```css
/* >768px: existing sticky sidebar (do not touch base .cart) */
.cart-btn { /* always visible header control */ }
@media (width <= 768px) {
  .cart-section {
    position: fixed; top: 0; right: 0; height: 100dvh; width: min(85vw, 360px);
    transform: translateX(100%); transition: transform 0.3s ease; z-index: 1000;
    overflow-y: auto; background: var(--color-gold, #1a1a1a); /* matches theme */
  }
  .cart-section[data-drawer-open='true'] { transform: translateX(0); }
  .cart-backdrop {
    position: fixed; inset: 0; background: rgb(0 0 0 / 50%); z-index: 999;
    opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
  }
  .cart-backdrop[data-open='true'] { opacity: 1; pointer-events: auto; }
  /* On <=768px the static sticky sidebar is replaced by the drawer; hide the
     full-width single-column block from #108 grid collapse by keeping .cart-section
     fixed (it's taken out of flow). No change to .app-main grid. */
}
```
Bind `data-drawer-open={cartDrawerOpen}` on the aside (App.jsx) and render `{cartDrawerOpen && <div className="cart-backdrop" data-open="true" aria-hidden="true" onClick={close} />}` before the aside.

**Step 3:** Run the mobile e2e (real browser computes the transform); also run `npm test` for regressions. Expect PASS. Commit.

> Note: `App.css` already has `@media (width <= 968px)` reordering `.cart-section` to `order:-1`. Because the drawer is `position: fixed` it's removed from grid flow, so `order` is irrelevant there — no conflict. Kept as-is.

### Task 4: Cart component — dialog role, close button, focus trap
**Objective:** `Cart` renders as a `role="dialog"` `aria-modal="true"` surface when in drawer mode, with a "Close" button calling `onCloseDrawer`; focus is trapped while open.

**Step 1 (RED):** In `src/components/Cart.test.jsx`:
```jsx
it('renders a close button that calls onCloseDrawer', () => {
  render(<Cart items={[...]} ... isDrawerOpen onCloseDrawer={mockClose} />)
  fireEvent.click(screen.getByRole('button', { name: /close/i }))
  expect(mockClose).toHaveBeenCalled()
})
it('has dialog semantics when in drawer mode', () => {
  render(<Cart items={[...]} ... isDrawerOpen />)
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
})
```
Expect FAIL.

**Step 2 (GREEN):** In `Cart.jsx`, accept `isDrawerOpen`, `onCloseDrawer`. Wrap root in conditional `role="dialog" aria-modal="true" aria-label="Shopping cart"` when `isDrawerOpen`. Add a header `<button className="cart-close" onClick={onCloseDrawer} aria-label="Close cart">✕</button>`. Add a focus-trap `useEffect` (when `isDrawerOpen`, move focus into the drawer on open, trap Tab within it, restore focus to the toggle on close — implement a small trap, no new dep; guard against missing `useRef`).

**Step 3:** Run `npm test -- Cart.test.jsx`; PASS. Commit.

### Task 5: Swipe-to-dismiss on touch devices
**Objective:** On touch (mobile/tablet device projects), a leftward swipe on the drawer dismisses it.

**Step 1 (RED):** e2e in `e2e/cart.spec.ts` mobile block:
```ts
test('swipe left on the drawer dismisses it', async ({ page }) => {
  await page.locator('.cart-btn').click()
  await expect(page.locator('#cart-drawer')).toBeVisible()
  const box = await page.locator('#cart-drawer').boundingBox()
  await page.touchscreen?.(...) // Playwright: use page.touchscreen.tap or locator drag with hasTouch
  // Use mouse drag emulating touch via { hasTouch:true } project:
  await page.locator('#cart-drawer').dispatchEvent('touchstart', { touches:[{x:box.x+box.width-20,y:box.y+200}] })
  await page.locator('#cart-drawer').dispatchEvent('touchend', { changedTouches:[{x:box.x-40,y:box.y+200}] })
  await expect(page.locator('#cart-drawer')).toBeHidden()
})
```
(Concretely: attach `touchstart`/`touchmove`/`touchend` listeners in `Cart.jsx`; if horizontal delta < -threshold, call `onCloseDrawer`.) Expect FAIL initially.

**Step 2 (GREEN):** In `Cart.jsx` add swipe handlers on the drawer root:
```jsx
const startX = useRef(null)
const onTouchStart = (e) => { startX.current = e.touches[0].clientX }
const onTouchEnd = (e) => {
  if (startX.current == null) return
  const dx = e.changedTouches[0].clientX - startX.current
  if (dx < -50) onCloseDrawer?.()
  startX.current = null
}
```
Bind `onTouchStart`/`onTouchEnd` on the drawer container (only meaningful on touch devices; harmless on desktop).

**Step 3:** Run mobile e2e; PASS. Commit.

### Task 6: SPELL / cspell remediation (config + dictionary)
**Objective:** Remove the duplicate config and pre-seed #109 vocabulary so MegaLinter SPELL_CSPELL passes on the diff.

**Step 1 (RED/prove):** Run `npx cspell "**/*.{ts,tsx,js,jsx,md,json,yml,yaml,css}" --no-progress` → confirm 0 issues now, and confirm the duplicate `cspell.json` exists (`git ls-files cspell.json`).

**Step 2 (GREEN):**
- Delete `cspell.json` (`git rm cspell.json`); keep `.cspell.json`.
- Patch `.cspell.json` `words[]` (alphabetical, no dupes) to add: `offcanvas`, `off-canvas`, `slide-over`, `slideover`, `backdrop`, `swipe`, `focustrap`, `focus-trap`, `drawer` (verify not already present — `drawer` is NOT in current list), `trap-focus`, `scroll-lock`, `aria-expanded` (cspell parses camelCase/kebab fine but add if flagged). Only add words the diff actually introduces; re-run cspell to verify each.
- Re-run `npx cspell "**/*" --no-progress` → **0 issues**.

**Step 3:** Commit: `git commit -m "ci(#109): consolidate cspell config + seed drawer vocabulary"`.

### Task 7: Full validation & lint gate (MANDATORY before push)
**Objective:** Prove GREEN end-to-end and clear the local lint gate.

1. `npm install` (if not done) → `npm test` (vitest) → **all unit tests pass, no NEW regressions**.
2. `npx cspell "**/*" --no-progress` → **0 issues** (SPELL gate).
3. `npx playwright test e2e/cart.spec.ts e2e/responsive-shell.spec.ts` (or full `npm run test:e2e` if time permits; at minimum the cart + responsive suites) against `npm run dev` on :5173 → **0 failed**; capture the passed/failed/skipped tally from real output.
4. `tsc --noEmit` (type-check) → clean (note: `TYPESCRIPT_STANDARD` is disabled in MegaLinter, but `tsc` build gate still applies).
5. No horizontal overflow with the drawer: `e2e/responsive-shell.spec.ts` still green at 320/768/1280.

---

## Validation summary (acceptance criteria map)

| #109 AC | Where verified |
|---|---|
| ≤768px: cart is a slide-over drawer from right edge | Task 3 e2e (mobile viewport) + Task 4 dialog role |
| >768px: cart remains sticky sidebar | Task 3 CSS (base `.cart` sticky untouched; drawer only ≤768px) + desktop e2e |
| Cart badge in header shows current item count | Task 1 unit (badge = `cart.length`) |
| Drawer fully operable via keyboard | Task 2 (ESC) + Task 4 (focus trap, close button, `aria-expanded`) + e2e keyboard assertions |
| Backdrop overlay present | Task 3 e2e |
| Swipe-to-dismiss on touch | Task 5 e2e (touch device project) |
| Accessibility: focus trap, ESC, aria-expanded | Tasks 2 + 4 unit + e2e |

---

## Risks / open questions
- **Drawer breakpoint 768 vs 968:** chosen 768 per issue AC + `--bp-tablet-max`; 769–968px stays the #108 full-width single-column block (pre-existing, not changed). Switch to 968 if you prefer the drawer to cover that band.
- **`.cart-section` `order:-1` at ≤968px (#108):** with the drawer `position:fixed` it's out of flow, so `order` is moot — no conflict, left as-is.
- **Focus trap without a dependency:** implement a minimal trap (query focusable elements, wrap Tab). If it proves flaky in jsdom, fall back to asserting focus *moves into* the drawer on open and *returns to toggle* on close (the contract that matters for a11y), rather than a full keydown trap in the unit test.
- **cspell word list:** only add words the #109 diff actually surfaces; verify each with a re-run so we don't add unused entries.
- **No backend needed:** cart drawer is pure UI; Wix/local cart logic (`useWixCart`) is untouched, so existing checkout/local-mode behaviour is preserved.
- **`npm install` network/time:** host has npm; install may take minutes — run in background and verify before tests.

---

## Commits (suggested, per cycle)
- `test/feat(#109): cart toggle button + badge (RED+GREEN)`
- `feat(#109): drawer open/close + ESC (RED+GREEN)`
- `feat(#109): off-canvas drawer CSS ≤768px + backdrop (RED+GREEN)`
- `feat(#109): Cart dialog role, close button, focus trap (RED+GREEN)`
- `feat(#109): swipe-to-dismiss on touch (RED+GREEN)`
- `ci(#109): consolidate cspell config + seed drawer vocabulary`
- final: `chore(#109): validation green — unit + e2e + cspell + tsc`
