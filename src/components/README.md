# Components Module

## Overview
`src/components/` provides reusable UI presentation and interaction components for the Antiques Marketplace frontend. All components enforce strict PropTypes validation, semantic HTML5 structure, responsive layout styling, and accessibility standards (keyboard focus trapping, escape key listeners, ARIA dialog roles).

## Interface
- `Cart`: Component in [`Cart.jsx`](./Cart.jsx). Manages cart drawer/dialog, line item updates, quantity modifications, touch swipes on mobile, and checkout redirects.
- `CategoryFilter`: Component in [`CategoryFilter.jsx`](./CategoryFilter.jsx). Category selector with item count badges and category switching callbacks.
- `ImageModal`: Component in [`ImageModal.jsx`](./ImageModal.jsx). Fullscreen lightbox image viewer with keyboard navigation.
- `OrderConfirmation`: Component in [`OrderConfirmation.jsx`](./OrderConfirmation.jsx). Order details view displaying confirmation, shipping, billing, and line items from Wix order IDs.
- `Pagination`: Component in [`Pagination.jsx`](./Pagination.jsx). Sliding 5-page window pagination controls.
- `ProductCard`: Component in [`ProductCard.jsx`](./ProductCard.jsx). Catalog product card with responsive image `srcSet`, stock pill, and add-to-cart trigger.
- `ProductList`: Component in [`ProductList.jsx`](./ProductList.jsx). Responsive CSS grid container rendering product cards.
- `ProductModal`: Component in [`ProductModal.jsx`](./ProductModal.jsx). Quick-view overlay modal for product details with image thumbnail carousel.
- `ProductPage`: Component in [`ProductPage.jsx`](./ProductPage.jsx). Detailed product view with gallery, breadcrumbs, JSON-LD metadata, and add-to-cart action.
- `SortControls`: Component in [`SortControls.jsx`](./SortControls.jsx). Search input field and sorting criteria dropdown.
- `StockIndicator`: Component in [`StockIndicator.jsx`](./StockIndicator.jsx). Badge indicating stock availability ("In Stock", "Only X left", or "Out of Stock").

## Invariants
- Prop validation is strictly enforced across components via `prop-types`.
- Modal and drawer components trap keyboard focus and dismiss on `Escape`.
- Out-of-stock items disable purchase actions and display warning badges.
- `ProductCard` truncates descriptions exceeding 50 words to maintain visual grid alignment.

## Side Effects
- `Cart.jsx`: Directly modifies `globalThis.location.href` when redirecting to Wix hosted checkout.
- `ProductModal.jsx`: Mutates `document.body.style.overflow` to `'hidden'` to prevent background scroll while open.
- Event listeners for `keydown` (Escape key) and touch events (`touchstart`, `touchend`).

## Verification
- Run: `npm test`
