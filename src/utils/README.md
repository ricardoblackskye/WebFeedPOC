# Utilities Module

## Overview
`src/utils/` contains pure utility functions and TypeScript interfaces for data normalization, currency formatting, text sanitization, and SEO JSON-LD schema generation.

## Interface
- `formatPrice(price)` in [`helpers.ts`](./helpers.ts): Formats numbers into GBP currency strings (`£X.XX`).
- `isValidEmail(email)` in [`helpers.ts`](./helpers.ts): Validates email address format.
- `generateId()` in [`helpers.ts`](./helpers.ts): Generates unique identifier string.
- `stripHtml(html)` in [`helpers.ts`](./helpers.ts): Strips HTML tags and decodes entities (safe in both Node.js SSR and browser DOM environments).
- `generateSlug(text)` in [`helpers.ts`](./helpers.ts): Converts arbitrary strings into URL-safe slugs.
- `truncateWords(text, maxWords)` in [`helpers.ts`](./helpers.ts): Truncates text to word limit with ellipsis.
- `generateProductSchema(product)` in [`structuredData.ts`](./structuredData.ts): Emits `schema.org/Product` structured data.
- `generateOrganizationSchema()` in [`structuredData.ts`](./structuredData.ts): Emits `schema.org/Organization` structured data.
- `generateWebSiteSchema()` in [`structuredData.ts`](./structuredData.ts): Emits `schema.org/WebSite` structured data with search action.
- `generateBreadcrumbSchema(items)` in [`structuredData.ts`](./structuredData.ts): Emits `schema.org/BreadcrumbList` structured data.
- `generateItemListSchema(products, listName)` in [`structuredData.ts`](./structuredData.ts): Emits `schema.org/ItemList` structured data.

## Invariants
- All helper functions safely handle `null` and `undefined` arguments without throwing runtime errors.
- `stripHtml` detects environment and avoids `document` references when executed under Node.js SSR.

## Side Effects
- None. All functions in this module are pure.

## Verification
- Run: `npm test`
