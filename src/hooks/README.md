# Hooks Module

## Overview
`src/hooks/` houses custom React hooks managing application state, asynchronous data fetching via TanStack React Query, and hybrid shopping cart state synchronization (local `localStorage` fallback with remote Wix eCommerce backend).

## Interface
- `useWixProducts(initialProducts)` in [`useWixProducts.js`](./useWixProducts.js): Fetches and caches product catalog from Wix Stores (`['wix-products']`). Falls back to mock products on network failure.
- `useWixCart()` in [`useWixCart.js`](./useWixCart.js): Hybrid shopping cart manager handling cart items, totals, quantity adjustments, and remote Wix synchronization.
- `useWixContent(fetchFn)` in [`useWixContent.js`](./useWixContent.js): Generic TanStack Query wrapper hook for querying Wix CMS data collections (`['wix-content', fetchFn.name]`).

## Invariants
- `useWixProducts` caches catalog queries for 5 minutes (`staleTime: 5 * 60 * 1000`).
- If Wix product API fails, `useWixProducts` falls back to curated mock products (`getMockProducts`) without breaking rendering.
- `useWixCart` defers `localStorage.setItem` writes until initial load is complete (`initialized = true`) to prevent race conditions that could overwrite existing persisted carts.
- When Wix eCommerce API fails or returns unauthorized, `useWixCart` automatically degrades to offline `localStorage` cart mode without dropping user items.

## Side Effects
- Mutates `localStorage` (`antiques_cart`).
- Network requests via `/api/wix-cart` and Wix Data client.

## Verification
- Run: `npm test`
