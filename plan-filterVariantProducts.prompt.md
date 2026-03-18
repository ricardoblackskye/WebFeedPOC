# Plan: Filter Out Products With Variants

## Problem
Products with options (e.g. "Condition: Excellent / Good / Fair") have multiple variants in Wix. Adding such a product to the basket requires a `variantId` to be selected and submitted — the current cart implementation does not support this. These products break silently: the add-to-cart action either fails or adds an unspecified variant, depending on the Wix API's behaviour.

## Goal
Hide all products that have at least one product option from the storefront — shop, category pages, product pages — until proper variant selection is built. The fix must be:
- In one place only (service layer)
- Transparent to all downstream components
- Easily reversible when variant support is added

---

## Implementation Status

| Step | Status |
|------|--------|
| Filter in `fetchWixProducts()` | ⏳ Pending |
| Add `hasVariants` field to mapped shape | ⏳ Pending |
| Update `wixService.test.js` | ⏳ Pending |
| Update existing test for `toEqual` shape | ⏳ Pending |
| Run unit + E2E tests | ⏳ Pending |

---

## Technical Background

The Wix product object returned by `@wix/stores` `queryProducts()` includes:
- `product.productOptions` — an array of option definitions (e.g. `[{ name: 'Condition', optionType: 'DROP_DOWN', choices: [...] }]`)
- Empty array (`[]`) or absent field = simple product with no variants → safe to add to cart as-is
- Populated array = product has variants → `variantId` required

This is confirmed by the Wix SDK type definitions at:
`node_modules/@wix/auto_sdk_stores_products/build/internal/es/index.d.mts`

---

## Phase 1 — Filter at Service Layer

### 1. `src/services/wixService.js` — `fetchWixProducts()`

**Before** (current, line ~46):
```js
// Transform Wix product data to our format
return allItems.map(product => {
```

**After:**
```js
// Exclude products that have variants — adding them to cart requires a variantId
// which the current checkout flow does not support. Remove this filter when
// variant selection UI is implemented.
return allItems
  .filter(product => !product.productOptions?.length)
  .map(product => {
```

Also add `hasVariants` to the mapped shape (inside the `return { ... }` object) for explicitness and to make reversal self-documenting:

```js
return {
  id: product._id,
  name: product.name,
  // ... existing fields ...
  hasVariants: (product.productOptions?.length ?? 0) > 0,
}
```

> After the filter, `hasVariants` will always be `false`. It is retained so that when the filter is removed, each product already carries the flag that the future variant-selection UI will need to conditionally render a selector.

---

## Phase 2 — Tests

### 2. `src/services/wixService.test.js`

**Add new test** inside `describe('fetchWixProducts', ...)`:

```js
it('filters out products with productOptions (variants)', async () => {
  mockFind.mockResolvedValueOnce({
    items: [
      {
        _id: '1',
        name: 'Simple Product',
        description: '',
        price: { price: 100 },
        media: null,
        collectionIds: [],
        sku: null,
        stock: { trackInventory: false, quantity: 0, inStock: true },
        productOptions: [],           // no variants — keep
      },
      {
        _id: '2',
        name: 'Variant Product',
        description: '',
        price: { price: 200 },
        media: null,
        collectionIds: [],
        sku: null,
        stock: { trackInventory: false, quantity: 0, inStock: true },
        productOptions: [{ name: 'Condition', optionType: 'DROP_DOWN' }],  // has variants — filter out
      },
    ],
    hasNext: () => false,
  })

  const products = await fetchWixProducts()

  expect(products).toHaveLength(1)
  expect(products[0].id).toBe('1')
  expect(products[0].hasVariants).toBe(false)
})
```

**Update existing 'fetches products successfully' test** — add `hasVariants: false` to the `toEqual` assertion, since the mapped shape now includes that field.

---

## Files Changed

| File | Change |
|------|--------|
| `src/services/wixService.js` | Add `.filter()` before `.map()`, add `hasVariants` to shape |
| `src/services/wixService.test.js` | Add new filter test; add `hasVariants: false` to existing shape assertion |

**Files NOT changed:** `useWixProducts.js`, `App.jsx`, `HomePage.jsx`, `CategoryPage.jsx`, all components, all CSS, all E2E tests.

---

## Reversal Path

When variant selection is built:
1. Remove the `.filter(product => !product.productOptions?.length)` line from `wixService.js`
2. `hasVariants: true` products will now appear in the shop
3. `ProductCard` / `ProductPage` can check `product.hasVariants` to conditionally render an option selector before enabling "Add to Cart"

No other files need to change for the reversal.

---

## Open Questions

1. **Does `fetchWixProduct()` (single product by ID) also need filtering?** The single-product fetch is used by `ProductPageWrapper` for the product detail page. If a user navigates directly to a variant product's URL (e.g. via a bookmark), they could still land on the page and attempt to add to cart. Consider: redirect to 404 / home if `product.productOptions?.length > 0`, or just leave the page non-functional for now since variant products won't be linked from anywhere in the shop.

2. **`prerender.mjs`** calls `fetchWixProducts()` to discover product routes. After this change, variant product routes will not be pre-rendered. This is correct behaviour — they won't be accessible from the shop UI either.
