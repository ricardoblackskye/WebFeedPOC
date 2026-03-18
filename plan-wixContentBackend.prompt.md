# Plan: Second Wix Headless Backend — CMS Content Integration

## Goal
Pull content from a second Wix Headless site (Client ID: `99689b25-cbea-4bdd-88b9-75ebfd5dc710`) into the React app. The second site hosts CMS collections managed via Wix Content Manager. Initially, the "About Us" collection is surfaced on a new `/about` page, establishing a reusable pattern for any further collections.

---

## Implementation Status

| Step | Status |
|------|--------|
| Install `@wix/data` | ✅ Done — `^1.0.426` in `package.json` |
| Add `VITE_WIX_CONTENT_CLIENT_ID` to `.env.example` | ✅ Done |
| Create `src/services/wixContentService.js` | ✅ Done |
| Create `src/hooks/useWixContent.js` | ✅ Done |
| Create `src/pages/AboutPage.jsx` + `AboutPage.css` | ✅ Done |
| Add `/about` route in `src/App.jsx` | ✅ Done |
| Add "About" nav link in `src/App.jsx` | ✅ Done |
| Unit tests (`wixContentService.test.js`, `useWixContent.test.js`) | ✅ Done |
| E2E tests (`e2e/about.spec.js`) | ✅ Done |
| Add `/about` to `scripts/prerender.mjs` | ⏳ Pending |

---

## Current State
- ✅ First Wix site: store products and collections (giannadart.com)
- ✅ Cart, checkout, orders via Wix ecom
- ✅ Second Wix site: integrated via `wixContentService.js`
- ✅ `@wix/data` SDK package installed
- ✅ `/about` route and `AboutPage` component live

---

## Phase 1 — Install & Configure ✅ Complete

### 1. Install `@wix/data` ✅
`@wix/data ^1.0.426` is in `package.json`.

### 2. Add environment variables ✅
`.env.example` contains:
```ini
# Second Wix Site — Content / CMS
VITE_WIX_CONTENT_CLIENT_ID=your_second_wix_client_id_here
```
> Note: No `VITE_WIX_CONTENT_API_KEY` is needed — public CMS collections are readable with just a Client ID via `OAuthStrategy`.

---

## Phase 2 — Service Layer ✅ Complete

### 3. `src/services/wixContentService.js` ✅
Implemented with:
- `createContentClient()` — creates a Wix client for the second (content) site using `VITE_WIX_CONTENT_CLIENT_ID`
- `fetchCollection(collectionId)` — generic function, queries any named CMS collection via `client.items.query(collectionId).find()`
- `fetchAboutUs()` — convenience wrapper: `fetchCollection('AboutUs')`
- Error handling: throws with a logged message on failure

### 4. `src/hooks/useWixContent.js` ✅
Implemented with:
- Accepts `fetchFn` as a parameter (reusable for any collection)
- `useState`/`useEffect` pattern with a cancellation flag (`let cancelled = false`)
- Returns `{ data, loading, error }`
- Cleans up on unmount (sets `cancelled = true` to prevent state updates)

---

## Phase 3 — About Page UI ✅ Complete

### 5. `src/pages/AboutPage.jsx` + `src/pages/AboutPage.css` ✅
- Calls `useWixContent(fetchAboutUsStable)` (stable ref via `useRef` to avoid effect re-runs)
- Shows a loading skeleton (`aria-label="Loading content"`) while fetching
- Shows an error message if the fetch fails
- Renders each CMS item as an `<AboutItem>` component with a collapsible bio section (`<details>`)
- PropTypes defined for `AboutItem` covering all known CMS field shapes

### 6. `/about` route in `src/App.jsx` ✅
`<Route path="about" element={<AboutPage />} />` is registered alongside existing routes.

### 7. "About" nav link in `src/App.jsx` ✅
`<Link to="/about">About</Link>` added to the site header navigation.

---

## Phase 4 — Tests ✅ Complete

### 8. Unit tests ✅
- `src/services/wixContentService.test.js` — covers `fetchCollection` and `fetchAboutUs`
- `src/hooks/useWixContent.test.js` — covers loading, success, error, cancellation states

### 9. E2E tests ✅
- `e2e/about.spec.js` — tests `/about` navigation, loading state, content render, and error state

---

## Phase 5 — Pre-rendering ⏳ Pending

### 10. Add `/about` to `scripts/prerender.mjs`
The prerender script currently hardcodes `const routes = ['/']` then discovers product routes dynamically. `/about` is CMS content that changes infrequently, so it's a good candidate for pre-rendering.

**Decision point**: Choose one approach:

**Option A — Static pre-render** (content baked in at build time):
```js
const routes = ['/', '/about']
```
- Pro: instant page load, best SEO
- Con: stale until next deploy if CMS content changes

**Option B — Exclude from pre-rendering** (dynamic, fetches on every visit):
- Leave `scripts/prerender.mjs` unchanged
- Pro: always shows latest CMS content without a redeploy
- Con: loading skeleton visible on first visit

> **Recommendation**: Use Option A for the initial version. Content on an About page rarely changes, and a simple redeploy updates it. If the client updates CMS content frequently, a Wix webhook (similar to the existing product webhook) can trigger re-deploys automatically.

---

## Open Questions / Notes

1. **CMS collection ID**: The collection is queried as `'AboutUs'`. If this returns empty items, verify the exact ID in the Wix dashboard under Content Manager → Collections → the URL slug.
2. **Multiple collections**: Other collections on the second Wix site can be added with one line in `wixContentService.js` plus a new page component. The `useWixContent` hook is fully generic.
3. **Private collections**: If a collection is set to "Private" in Wix CMS, a visitor access token will be needed (same auth flow as the cart). Current implementation assumes public read access.
4. **Pre-render trigger**: If CMS content updates should be reflected without a manual redeploy, add a webhook handler (similar to `api/wix-webhook.js`) that triggers a Vercel deploy hook when content changes.

---

## Files Changed / Created

| File | Action |
|------|--------|
| `package.json` | ✅ Added `@wix/data ^1.0.426` |
| `.env.example` | ✅ Added `VITE_WIX_CONTENT_CLIENT_ID` |
| `src/services/wixContentService.js` | ✅ Created |
| `src/services/wixContentService.test.js` | ✅ Created |
| `src/hooks/useWixContent.js` | ✅ Created |
| `src/hooks/useWixContent.test.js` | ✅ Created |
| `src/pages/AboutPage.jsx` | ✅ Created |
| `src/pages/AboutPage.css` | ✅ Created |
| `src/App.jsx` | ✅ Added `/about` route + nav link |
| `e2e/about.spec.js` | ✅ Created |
| `scripts/prerender.mjs` | ⏳ Pending — add `/about` to static routes |

---

## Pattern Reuse

Adding another collection (e.g. "Journal", "FAQs") follows this pattern:
1. Add `export const fetchJournal = () => fetchCollection('Journal')` to `wixContentService.js`
2. Create `src/pages/JournalPage.jsx` using `useWixContent(fetchJournal)`
3. Add `<Route path="journal" element={<JournalPage />} />` in `App.jsx`

No new packages, no new API routes, no new hooks needed.
