# Antiques Microsite Blueprint

## System Overview
A modern e-commerce web application for selling antiques, built with React 18, Vite, and TanStack React Query, integrating with Wix Headless eCommerce (Stores, Cart, Checkout, and CMS) via secure Vercel serverless functions.

The system features:
- **Product Catalog & CMS**: Curated antique items fetched from Wix Stores and Wix Headless CMS (`AboutUs`), with responsive image sets and SEO-optimized structured data (`schema.org`).
- **Hybrid Cart & Checkout Flow**: Client cart state synchronized with `/api/wix-cart`, with automatic fallback to browser `localStorage` if backend credentials or services are unavailable.
- **Serverless API Proxy Layer**: `/api` routes that prevent client-side credential exposure and issue secure `HttpOnly` visitor cookies.
- **SSR Pre-rendering**: Build-time static generation (`scripts/prerender.mjs`) for search engine crawlability and sitemap generation.

## Subdirectories & System Boundaries
- **[api/](./api/README.md)**: Serverless backend API routes (Vercel Functions) proxying Wix Headless OAuth visitor token issuance, cart CRUD operations, and hosted checkout redirect sessions.
- **[scripts/](./scripts/README.md)**: Node.js automation and build tooling, including dual client/SSR static site pre-rendering (`prerender.mjs`) and CI pull request code review pipelines (`pr-reviewer.js`).
- **[src/](./src/README.md)**: Frontend single-page application and SSR entrypoint, housing UI components, TanStack Query hooks, route pages, Wix service integrations, and utility helpers.

## Global Invariants
- **Credential Isolation**: Client code bundle accesses only `VITE_`-prefixed environment variables. Server secrets (`WIX_CLIENT_ID`, `WIX_SITE_URL`) are isolated to `/api` serverless routes.
- **SSR Hydration Safety**: All references to browser global APIs (`window`, `document`, `localStorage`) are guarded by runtime environment checks (`typeof window !== 'undefined'`) to prevent Node.js static generation failures.
- **Cart Availability Invariant**: Unauthenticated or network-failing cart requests gracefully degrade to offline browser `localStorage` state without dropping user line items or throwing unhandled errors.
- **Deterministic SEO Pre-rendering**: Static pre-rendering must succeed for 100% of discovered dynamic routes; any rendering failure aborts the build process.

## Global Side Effects
- **Client Storage**: Persistent local storage keys `antiques_cart` (cart items) and `wix_session` (visitor authentication tokens).
- **HTTP Cookies**: Issues `wix_visitor_token` (7 days) and `wix_refresh_token` (30 days) cookies with `HttpOnly`, `Secure`, `SameSite=Strict`.
- **Third-Party Integrations**:
  - Wix Headless eCommerce REST and SDK endpoints (Stores, eCom Cart, Checkout redirects, Data CMS).
  - GitHub REST API and OpenRouter AI API (during CI pull request review execution).

## System Verification
- Run: `npm test`

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build & Pre-render
```bash
npm run build
npm run build:prerender
```

### Test
```bash
npm test
```

### Configuration
Configure environment variables in `.env.local`:
```ini
# Frontend variables (Vite build-time access)
VITE_WIX_CLIENT_ID=your_wix_client_id
VITE_WIX_SITE_URL=https://your-site.wixsite.com/your-site

# Backend variables (for serverless API routes in /api)
WIX_CLIENT_ID=your_wix_client_id
WIX_SITE_URL=https://your-site.wixsite.com/your-site
```
For detailed setup instructions, see [WIX-API-INTEGRATION.md](./WIX-API-INTEGRATION.md).
