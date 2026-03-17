# Plan: TanStack Query v5 Integration

## Goal
Replace the manual `useState`/`useEffect` data-fetching boilerplate in `useWixProducts` and `useWixContent` with TanStack Query v5. This gives automatic caching, deduplication, background refetching, stale-time control, and loading/error states — without changing any component code or the cart layer.

---

## Scope

| Layer | In scope | Reason |
|-------|----------|--------|
| `useWixProducts` | ✅ Yes | Simple fetch-on-mount, ideal candidate |
| `useWixContent` | ✅ Yes | Simple fetch-on-mount, ideal candidate |
| `useWixCart` | ❌ No | Complex hybrid local/Wix state, useCallback, initialized flag — not worth the risk |
| All page/component files | ❌ No | Hooks return the same `{ data, loading, error }` shape — no changes needed downstream |

---

## Implementation Status

| Step | Status |
|------|--------|
| Install packages | ✅ Done — `@tanstack/react-query` + `@tanstack/react-query-devtools` |
| Wrap app in `QueryClientProvider` (`src/main.jsx`) | ✅ Done |
| Add `QueryClientProvider` to test utils (`src/test-utils.jsx`) | ✅ Done |
| Migrate `useWixProducts` | ✅ Done |
| Update `useWixProducts.test.js` | ✅ Done |
| Migrate `useWixContent` | ✅ Done |
| Update `useWixContent.test.js` | ✅ Done |
| Verify all tests pass | ✅ Done — 163/163 unit, 57/57 E2E |

---

## Phase 1 — Infrastructure

### 1. Install packages
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```
`@tanstack/react-query-devtools` is a dev-only panel that shows cache state in the browser — useful during development, zero cost in production.

### 2. Update `src/main.jsx`
Wrap the existing tree in `QueryClientProvider`. The `QueryClient` is created once at module scope.

**Before:**
```jsx
import { HelmetProvider } from 'react-helmet-async'
// ...
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter> ... </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
```

**After:**
```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — products don't change often
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter> ... </BrowserRouter>
      </HelmetProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
)
```

### 3. Update `src/test-utils.jsx`
Every `renderHook` or `render` that uses a TanStack-powered hook needs a `QueryClientProvider` with a **fresh `QueryClient`** (prevents cache leaking between tests).

Add a new export alongside the existing `RouterWrapper`/`createRouterWrapper`:
```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // no retries in tests
  })
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}
```

---

## Phase 2 — Migrate `useWixProducts`

**File:** `src/hooks/useWixProducts.js`

The current hook uses ~30 lines of `useState`/`useEffect`. TanStack Query replaces this with a single `useQuery` call.

**Key decisions:**
- `queryKey: ['wix-products']` — single cache entry for all products
- `initialData: initialProducts || undefined` — honours the SSR/prerender path (if `initialProducts` is provided, no fetch occurs)
- `staleTime: 5 * 60 * 1000` — products cached for 5 min; navigating away and back won't refetch
- `retry: 1` — one retry on failure before falling back to mock data
- Mock data fallback: moved into the `queryFn` itself (throw path sets mock data via `onError` or handled in the return)

**Shape after migration:**
```js
import { useQuery } from '@tanstack/react-query'
import { fetchWixProducts } from '../services/wixService'

export function useWixProducts(initialProducts = null) {
  const { data, isPending, error } = useQuery({
    queryKey: ['wix-products'],
    queryFn: fetchWixProducts,
    initialData: initialProducts || undefined,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  return {
    products: data ?? getMockProducts(),
    loading: isPending,
    error: error?.message ?? null,
  }
}
```

> **Note on `initialData`:** When `initialProducts` is provided (SSR pre-render path), TanStack treats it as already-fetched cached data and skips the network call — identical behaviour to the current `if (initialProducts) return` guard in `useEffect`.

**Update `src/hooks/useWixProducts.test.js`:**
- Wrap each `renderHook` call with `wrapper: createQueryWrapper()` from `test-utils.jsx`
- Test names and assertions remain the same — the hook's return shape (`products`, `loading`, `error`) is unchanged
- Remove any test that relies on the manual `setLoading(true)` / `setProducts()` sequence; replace with `waitFor(() => expect(result.current.loading).toBe(false))`

---

## Phase 3 — Migrate `useWixContent`

**File:** `src/hooks/useWixContent.js`

The current hook accepts a `fetchFn` parameter. The query key must include a stable identifier for the function so different collections get separate cache entries.

**Key decisions:**
- `queryKey: ['wix-content', fetchFn.name]` — uses the function's `.name` property (e.g. `'fetchAboutUs'`) as the cache discriminator
- `staleTime: 10 * 60 * 1000` — CMS content changes even less often than products; 10 min is safe
- No mock fallback — `useWixContent` currently returns an empty array on error, maintained via `data ?? []`
- Cancellation: the current manual `cancelled` flag is no longer needed — TanStack handles in-flight request management internally

**Shape after migration:**
```js
import { useQuery } from '@tanstack/react-query'

export function useWixContent(fetchFn) {
  const { data, isPending, error } = useQuery({
    queryKey: ['wix-content', fetchFn.name],
    queryFn: fetchFn,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  return {
    data: data ?? [],
    loading: isPending,
    error: error?.message ?? null,
  }
}
```

> **Benefit:** `AboutPage` unmounts when the user navigates away. Currently `useWixContent` refetches every time the page is revisited (new component mount = new `useEffect`). With TanStack Query, the cached result is served instantly on re-visit for 10 minutes — the CMS fetch only happens once per session until the data goes stale.

**Update `src/hooks/useWixContent.test.js`:**
- Wrap each `renderHook` call with `wrapper: createQueryWrapper()`
- The "cancels fetch on unmount" test (if present) can be removed — TanStack manages this
- All other assertions (`loading`, `data`, `error`) remain identical

---

## Phase 4 — Verification

After each phase, run:

```powershell
cd C:\Dev\Feed\WebFeedPOC
npx vitest run --reporter=verbose
```

After all phases:
```powershell
node_modules\.bin\playwright test --config playwright.config.cjs --reporter=line
```

Expected: **163/163 unit tests** and **57/57 E2E tests** passing.

---

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Add `@tanstack/react-query` + `@tanstack/react-query-devtools` |
| `src/main.jsx` | Add `QueryClient`, `QueryClientProvider`, `ReactQueryDevtools` wrapper |
| `src/test-utils.jsx` | Add `createQueryWrapper()` export |
| `src/hooks/useWixProducts.js` | Replace `useState`/`useEffect` with `useQuery` |
| `src/hooks/useWixProducts.test.js` | Add `wrapper: createQueryWrapper()` to `renderHook` calls |
| `src/hooks/useWixContent.js` | Replace `useState`/`useEffect` with `useQuery` |
| `src/hooks/useWixContent.test.js` | Add `wrapper: createQueryWrapper()` to `renderHook` calls |

**Files NOT changed:** `App.jsx`, all page/component files, `useWixCart.js`, all CSS, all E2E tests.

---

## Why Not Cart?

`useWixCart` manages:
- A hybrid local + Wix backend state (items stored locally, synced to Wix on checkout)
- An `initialized` flag to prevent double-init
- `useCallback` for stable function references passed to components
- Manual merging of local and remote cart state

TanStack Query's mutation model (`useMutation`) could handle this eventually, but the migration is non-trivial and the cart works correctly today. Keeping it out of scope avoids risk.

---

## Pattern Reuse

Once `useWixContent` is migrated, any new CMS collection automatically benefits from caching via `queryKey: ['wix-content', fetchFn.name]`. No additional configuration per collection.
