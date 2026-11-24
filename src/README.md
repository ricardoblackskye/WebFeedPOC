# Source Root (`src/`)

## Overview
`src/` encapsulates the client-side single page application and server-side rendering (SSR) frontend for the Antiques Marketplace. Built with React 18, Vite, and TanStack React Query, it coordinates layout shells, global cart state, route navigation, and headless Wix eCommerce integration.

## Interface
- `<App />`: Root application component and layout in [`App.jsx`](./App.jsx). Provides routing shell, cart drawer dialog, and React Router outlet context (`products`, `categories`, `productCounts`, `addToCart`).
- `main.jsx`: Browser DOM entrypoint in [`main.jsx`](./main.jsx) mounting `<App />` within `StrictMode`, `QueryClientProvider`, `HelmetProvider`, and `BrowserRouter`.
- `render(url, data)`, `fetchWixProducts`: SSR prerender entrypoint in [`entry-server.jsx`](./entry-server.jsx) utilized by `scripts/prerender.mjs` for static route pre-rendering.
- `RouterWrapper`, `createRouterWrapper(initialEntries)`, `createQueryWrapper()`: Test harness wrappers in [`test-utils.jsx`](./test-utils.jsx).
- Vitest configuration and global DOM stubs in [`test-setup.ts`](./test-setup.ts).
- Subdirectory contracts:
  - [components/](./components/README.md): Reusable UI presentation and modal components.
  - [hooks/](./hooks/README.md): React hooks managing server state, caching, and hybrid cart synchronization.
  - [pages/](./pages/README.md): Route view components mounted under React Router.
  - [services/](./services/README.md): Wix Headless SDK adapters, serverless API proxies, and session management.
  - [utils/](./utils/README.md): Utility functions, slug generation, currency formatting, and JSON-LD schema builders.
  - [test-utils/](./test-utils/README.md): Strongly typed fixture generators and test helpers.

## Invariants
- SSR Safety: All browser API access (`window`, `document`, `localStorage`) is guarded by `typeof window !== 'undefined'` checks.
- Outlet context always provides valid array values for `products` and `categories` (never undefined).
- Cart drawer dialog implements accessibility semantics (`role="dialog"`, `aria-modal="true"`) and closes on Escape key press.
- When `initialProducts` is provided during hydration, `useWixProducts` bypasses initial loading state to eliminate layout shift.

## Side Effects
- Registers global keyboard listeners (`keydown`) on `window` for Escape key cart dismissal.
- Persists cart data to `localStorage` under `antiques_cart`.
- Performs network requests to serverless API proxy endpoints (`/api/wix-*`).

## Verification
- Run: `npm test`
