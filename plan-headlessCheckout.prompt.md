# Plan: Custom React Checkout Page (Wix for Payment Only)

## Goal
Build a `/checkout` route in React that collects the shipping address and shows an order summary, then pre-fills that data into the Wix checkout via API before redirecting there for payment only. This keeps the user on the branded site (`giannadart.com`) for the majority of the checkout experience. Wix handles payment capture exclusively — no Stripe required.

---

## Phase 1 — New `/checkout` route

1. Create `src/pages/CheckoutPage.jsx` and `src/pages/CheckoutPage.css`
2. Register the route in `src/main.jsx`:
   ```jsx
   import CheckoutPage from './pages/CheckoutPage.jsx'
   // inside <Routes>:
   <Route path="checkout" element={<CheckoutPage />} />
   ```
3. Verify that `cart`, `totals`, and `useWixBackend` are available inside the page via `useOutletContext()` — they already are from `App.jsx`'s `<Outlet>` context

---

## Phase 2 — Checkout page UI

4. **Two-column layout** (stacks on mobile):
   - Left column: shipping address form
   - Right column: order summary (items + totals, read-only)
5. **Form fields**: firstName, lastName, email, phone, addressLine1, addressLine2 (optional), city, zipCode, country (default `"GB"`, dropdown for expansion later)
6. **"Continue to Payment" button**: disabled while form invalid or API call in-flight
7. **Client-side validation**: all required fields populated, basic email format check
8. **Loading state**: spinner/disabled button while creating checkout or updating it

---

## Phase 3 — Wix checkout update API (backend)

9. Add PATCH handler in `api/wix-checkout.js`:
   ```js
   if (req.method === 'PATCH') return await handlePatch(wixClient, req, res)
   ```
10. Implement `handlePatch(wixClient, req, res)` which calls:
    ```js
    wixClient.checkout.updateCheckout(checkoutId, {
      shippingInfo: {
        shippingDestination: {
          contactDetails: {
            firstName, lastName, email, phone
          },
          address: {
            addressLine, addressLine2, city, zipCode,
            country,   // ISO 3166-1 alpha-2, e.g. "GB"
            subdivision: ''
          }
        }
      },
      buyerInfo: { email, firstName, lastName, phone }
    })
    ```
11. Returns `{ success: true }` on success; structured error on failure

---

## Phase 4 — Frontend checkout service update

12. Add `updateCheckout(checkoutId, shippingData)` to `src/services/wixCheckoutService.js`:
    - PATCH to `/api/wix-checkout` with `{ checkoutId, shippingData }` in body
13. Add `getRedirectUrl(checkoutId)` (or overload `initiateCheckout`) to accept an existing `checkoutId` and skip `createCheckoutFromCurrentCart` — only calls `createRedirectSession` with the given ID
    - `createRedirectSession` returns the `fullUrl` for the Wix-hosted payment page

---

## Phase 5 — Change Cart.jsx checkout trigger

14. Import `useNavigate` from `react-router-dom` in `Cart.jsx`
15. Replace the current flow:
    ```js
    // OLD: immediately redirects to Wix
    const url = await initiateCheckout(...)
    globalThis.location.href = url
    ```
    with:
    ```js
    // NEW: creates checkout, then navigates to /checkout page
    const checkoutId = await createWixCheckout(useWixBackend ? undefined : items)
    navigate('/checkout', { state: { checkoutId } })
    ```
16. Add `createWixCheckout(localItems?)` to `wixCheckoutService.js` — calls `POST /api/wix-checkout` and returns only the `checkoutId` (not the redirect URL)

---

## Phase 6 — CheckoutPage submit flow

17. On mount: read `checkoutId` from `useLocation().state`; if absent (user navigated directly), call `createWixCheckout()` to create one
18. On form submit:
    1. Call `updateCheckout(checkoutId, formData)` → patches Wix checkout with address
    2. Call `getRedirectUrl(checkoutId)` → calls `createRedirectSession` → returns `checkoutUrl`
    3. `globalThis.location.href = checkoutUrl` → user lands on Wix payment page (address pre-filled)
19. Wix redirects back to `https://www.giannadart.com/order-confirmation?orderId=...` as today

---

## Phase 7 — Tests

20. Add tests in `src/services/wixCheckoutService.test.js` for:
    - `updateCheckout` (mock PATCH fetch, assert body shape)
    - `createWixCheckout` (mock POST, assert returns `checkoutId`)
    - `getRedirectUrl` (mock POST, assert returns `checkoutUrl`)
21. Add a stub test file `src/pages/CheckoutPage.test.jsx` covering:
    - Renders form fields
    - Disables button while form is incomplete
    - Calls `updateCheckout` + `getRedirectUrl` on submit

---

## Relevant Files

| File | Change |
|------|--------|
| `src/main.jsx` | Add `/checkout` route |
| `src/App.jsx` | Verify outlet context includes `cart`, `totals`, `useWixBackend` |
| `src/components/Cart.jsx` | Replace redirect with `navigate('/checkout', { state: { checkoutId } })` |
| `src/services/wixCheckoutService.js` | Add `createWixCheckout()`, `updateCheckout()`, `getRedirectUrl()` |
| `api/wix-checkout.js` | Add `handlePatch()` and PATCH method dispatch |
| `src/pages/CheckoutPage.jsx` | **New** — address form + order summary |
| `src/pages/CheckoutPage.css` | **New** — two-column responsive layout |
| `src/services/wixCheckoutService.test.js` | Add tests for new functions |
| `src/pages/CheckoutPage.test.jsx` | **New** — UI tests |

---

## Verification Steps

1. Add item → open cart → click "Proceed to Checkout" → browser stays on `giannadart.com/checkout` ✓
2. Fill address form → "Continue to Payment" → redirected to Wix checkout with address pre-populated (user only enters card details) ✓
3. Complete test payment → lands on `giannadart.com/order-confirmation` as today ✓
4. Direct navigation to `/checkout` with no state → checkout is created on mount, form works normally ✓
5. `npx vitest run` → 151+ tests pass ✓

---

## Out of Scope (this phase)

- Billing address collection (Wix handles if required by payment method)
- Login / guest-checkout distinction
- Full country dropdown (default GB; can be added post-MVP)
- Discount code entry on the custom page (available on the Wix payment page)

---

## Additional Quick Win

Customise the Wix checkout branding in the **Wix dashboard → Design → Checkout** to match `giannadart.com` colours and logo. This reduces the visual jump for the brief payment step that remains on the Wix page.
