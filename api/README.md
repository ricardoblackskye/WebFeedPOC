# API Module

## Overview
The `/api` module provides serverless API route handlers (Vercel Functions) serving as a secure backend proxy between the client application and the Wix Headless E-Commerce Platform. It isolates credentials (such as OAuth secrets), manages visitor tokens via HTTP-only cookies, and handles cart, checkout redirection, and order lookup operations.

## Interface
- `POST /api/wix-auth`: `default(req, res)` in [`wix-auth.js`](./wix-auth.js). Initiates visitor session and emits `wix_visitor_token` / `wix_refresh_token` cookies.
- `GET|POST|PUT|DELETE /api/wix-cart`: `default(req, res)` in [`wix-cart.js`](./wix-cart.js). Cart operations (fetch, add item, update quantity, remove item, clear cart).
- `GET|POST /api/wix-checkout`: `default(req, res)` in [`wix-checkout.js`](./wix-checkout.js). Checkout creation, redirect URL generation, and order history queries.
- `GET /api/testapi`: `default(req, res)` in [`testapi.js`](./testapi.js). Edge routing diagnostic health check.

## Invariants
- `wix-auth.js` enforces HTTP POST, rejecting other methods with `405 Method Not Allowed`.
- `testapi.js` enforces HTTP GET, rejecting other methods with `405 Method Not Allowed`.
- `wix-checkout.js` rejects methods other than GET and POST with `405 Method Not Allowed`.
- Missing cart lookup returns an empty cart structure `{ success: true, cart: { lineItems: [] } }` rather than throwing errors.
- Token resolution strictly checks: (1) `X-Wix-Tokens` header, (2) `wix_visitor_token` cookie, (3) request body tokens.
- Server-side environment variables `WIX_CLIENT_ID` and `WIX_SITE_URL` are not exposed to the client bundle.

## Side Effects
- Issues `Set-Cookie` headers for `wix_visitor_token` and `wix_refresh_token` (`HttpOnly`, `Secure`, `SameSite=Strict`).
- Network requests to Wix Headless APIs (`@wix/sdk`, `@wix/ecom`, `@wix/stores`, `@wix/redirects`).
- Modifies server-side visitor cart state and initiates checkout redirection sessions.

## Verification
- Run: `npm test`
