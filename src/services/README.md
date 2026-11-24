# Services Module

## Overview
`src/services/` encapsulates all network communication with Wix Headless SDKs, serverless API route proxies (`/api/*`), and client session token persistence.

## Interface
- `fetchWixProducts()`, `fetchWixProduct(productId)` in [`wixService.js`](./wixService.js): Queries Wix Stores catalog, recursively paginates collections, filters variant items, and maps items to standard `Product` records.
- `getCurrentCart()`, `addToWixCart(productId, quantity, options)`, `updateCartItemQuantity(lineItemId, quantity)`, `removeFromWixCart(lineItemId)`, `clearWixCart()`, `transformWixCart(wixCart)`, `getCartTotals(wixCart)` in [`wixCartService.js`](./wixCartService.js): Client proxy interface communicating with `/api/wix-cart`.
- `initiateCheckout(localItems)`, `getOrder(orderId)`, `queryOrders(options)`, `transformOrder(wixOrder)` in [`wixCheckoutService.js`](./wixCheckoutService.js): Manages checkout creation, remote cart synchronization, hosted checkout URLs, and order queries.
- `fetchCollection(collectionId)`, `fetchAboutUs()` in [`wixContentService.js`](./wixContentService.js): Queries headless CMS collections via `@wix/data`.
- `wixSession`: Singleton manager in [`wixSession.js`](./wixSession.js) with `hasValidSession()`, `getAuthHeader()`, `authenticate()`, and `makeAuthenticatedRequest()`.

## Invariants
- Visitor session tokens are persisted in `localStorage` under `wix_session` and validated with a 5-minute expiry buffer.
- Outbound serverless calls automatically supply credentials via the `X-Wix-Tokens` header.
- Upon receiving HTTP 401 Unauthorized, `wixSession` automatically attempts a single re-authentication before propagating errors.

## Side Effects
- Mutates `localStorage` (`wix_session`).
- Outbound HTTP requests to `/api/wix-auth`, `/api/wix-cart`, `/api/wix-checkout`, and Wix Cloud SDK endpoints.

## Verification
- Run: `npm test`
