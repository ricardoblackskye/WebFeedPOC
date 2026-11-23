# Pages Module

## Overview
`src/pages/` provides the top-level route views rendered within the application's root layout `<Outlet />`. Each page manages its respective route parameters, query strings, document head SEO metadata via `react-helmet-async`, and page-level sorting or filtering states.

## Interface
- `HomePage`: Component in [`HomePage.jsx`](./HomePage.jsx). Main storefront with search, category filtering, sorting, pagination, and `schema.org/ItemList` JSON-LD structured data. Mounted at `/`.
- `CategoryPage`: Component in [`CategoryPage.jsx`](./CategoryPage.jsx). Filtered catalog view with breadcrumb navigation and structured metadata. Mounted at `/category/:categoryName`.
- `ProductPageWrapper`: Component in [`ProductPageWrapper.jsx`](./ProductPageWrapper.jsx). Route bridge extracting products and cart actions from router outlet context and delegating to `ProductPage`. Mounted at `/products/:slug`.
- `OrderHistory`: Component in [`OrderHistory.jsx`](./OrderHistory.jsx). Order list view for members querying `queryOrders` via Wix Checkout Service. Mounted at `/orders`.
- `AboutPage`: Component in [`AboutPage.jsx`](./AboutPage.jsx). CMS-driven company information page querying Wix CMS `AboutUs` collection. Mounted at `/about`.
- `ArchitecturePage`: Component in [`ArchitecturePage.jsx`](./ArchitecturePage.jsx). Interactive architecture documentation viewer parsing `ARCHITECTURE.md` and rendering Mermaid diagrams via CDN module loader. Mounted at `/architecture`.
- `ReleasenotesPage`: Component in [`ReleasenotesPage.jsx`](./ReleasenotesPage.jsx). Formatted changelog view rendering repository `releasenotes.md`. Mounted at `/releasenotes`.

## Invariants
- Every route updates page title, canonical link, OpenGraph tags, and structured data via `<Helmet>`.
- Category changes and pagination state changes trigger smooth scrolling to top (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
- Search term inputs on `HomePage` synchronize with URL query parameters (`?search=...`).

## Side Effects
- Mutates browser history and URL search params via `react-router-dom`.
- Dynamic script injection for Mermaid CDN library in `ArchitecturePage`.
- Smooth scrolling invocations on window object.

## Verification
- Run: `npm test`
