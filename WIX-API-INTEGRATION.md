# Wix Integration API Documentation

## Overview

The Wix cart and checkout integration uses serverless API routes to handle authentication and cart operations securely. This architecture ensures proper authentication with Wix's ecom APIs while maintaining a static frontend.

## Architecture

```
Frontend (React)
    ↓
wixSession.js (Session Manager)
    ↓
API Routes (/api/*.js)
    ↓
Wix ecom APIs
```

## API Endpoints

### 1. Authentication: `/api/wix-auth.js`

**Purpose:** Initialize Wix visitor session and obtain authentication tokens

**Method:** POST

**Request:**
```json
{
  "tokens": { // Optional: existing tokens to refresh
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "visitor_token_here",
    "refreshToken": "refresh_token_here"
  },
  "expiresAt": 1234567890000
}
```

**Sets Cookies:**
- `wix_visitor_token` (HttpOnly, Secure, 7 days)
- `wix_refresh_token` (HttpOnly, Secure, 30 days)

---

### 2. Cart Operations: `/api/wix-cart.js`

**Purpose:** Proxy for all cart operations with proper authentication

#### Get Current Cart
**Method:** GET  
**URL:** `/api/wix-cart?action=get`

**Response:**
```json
{
  "success": true,
  "cart": { /* Wix cart object */ }
}
```

#### Add to Cart
**Method:** POST  
**URL:** `/api/wix-cart?action=add`

**Body:**
```json
{
  "productId": "product_id_here",
  "quantity": 2,
  "options": {} // Optional product options
}
```

#### Update Cart Item
**Method:** PUT  
**URL:** `/api/wix-cart?action=update`

**Body:**
```json
{
  "lineItemId": "line_item_id",
  "newQuantity": 3
}
```

#### Remove from Cart
**Method:** DELETE  
**URL:** `/api/wix-cart?action=remove`

**Body:**
```json
{
  "lineItemId": "line_item_id"
}
```

#### Clear Cart
**Method:** DELETE  
**URL:** `/api/wix-cart?action=remove&clear=true`

---

### 3. Checkout & Orders: `/api/wix-checkout.js`

**Purpose:** Handle checkout creation and order retrieval

#### Create Checkout
**Method:** POST  
**URL:** `/api/wix-checkout`

**Response:**
```json
{
  "success": true,
  "checkout": { /* Wix checkout object */ },
  "checkoutUrl": "https://site.wix.com/_api/checkout/v1/checkout/checkout_id"
}
```

#### Get Checkout Details
**Method:** GET  
**URL:** `/api/wix-checkout?id=checkout_id`

#### Get Order Details
**Method:** GET  
**URL:** `/api/wix-checkout?orderId=order_id`

#### List Orders
**Method:** GET  
**URL:** `/api/wix-checkout?action=orders&limit=10&offset=0`

---

## Frontend Integration

### Session Manager (`wixSession.js`)

The session manager handles:
- Token storage and persistence (localStorage)
- Automatic token refresh
- Authentication retry on 401 errors
- Adding auth headers to requests

**Usage:**
```javascript
import { wixSession } from './services/wixSession'

//Make authenticated request
const response = await wixSession.makeAuthenticatedRequest('/api/wix-cart?action=get')
```

### Service Layers

#### Cart Service (`wixCartService.js`)
```javascript
import { getCurrentCart, addToWixCart, updateCartItemQuantity } from './services/wixCartService'

// Get cart
const cart = await getCurrentCart()

// Add item
await addToWixCart('product_id', 2)

// Update quantity
await updateCartItemQuantity('line_item_id', 3)
```

#### Checkout Service (`wixCheckoutService.js`)
```javascript
import { initiateCheckout, getOrder } from './services/wixCheckoutService'

// Start checkout
const checkoutUrl = await initiateCheckout()
window.location.href = checkoutUrl

// Get order after completion
const order = await getOrder('order_id')
```

---

## Environment Variables

### Frontend (.env or Vercel environment)
```bash
# For frontend Wix SDK calls (products, etc.)
VITE_WIX_CLIENT_ID=your_client_id
VITE_WIX_API_KEY=your_api_key
VITE_WIX_SITE_ID=your_site_id
VITE_WIX_SITE_URL=https://yoursite.wix.com
```

### Backend (Vercel environment variables)
```bash
# For API routes - NO VITE_ prefix
WIX_CLIENT_ID=your_client_id  # Same as VITE_ version
WIX_SITE_URL=https://yoursite.wix.com
```

**Important:** Backend variables must NOT have the `VITE_` prefix as they're used in serverless functions, not the frontend build.

---

## Setup Instructions

### 1. Get Wix Credentials

1. Go to https://dev.wix.com/
2. Create or select your site
3. Navigate to Settings → OAuth Apps
4. Create new OAuth client or use existing
5. Copy the **Client ID**
6. Note your site URL (e.g., https://yoursite.wix.com)

### 2. Configure Environment Variables

**Local development (.env.local):**
```bash
VITE_WIX_CLIENT_ID=your_client_id_here
WIX_CLIENT_ID=your_client_id_here
VITE_WIX_SITE_URL=https://yoursite.wix.com
WIX_SITE_URL=https://yoursite.wix.com
```

**Vercel deployment:**
Add these in Project Settings → Environment Variables:
- `VITE_WIX_CLIENT_ID`
- `WIX_CLIENT_ID` (same value, for backend)
- `VITE_WIX_SITE_URL`
- `WIX_SITE_URL` (same value, for backend)

### 3. Test the Integration

1. Start dev server: `npm run dev`
2. Add item to cart
3. Check browser console for authentication messages
4. Cart should show "🔗 Wix Cart" badge when connected
5. Click "Proceed to Checkout" to test checkout flow

---

## Troubleshooting

### Cart stays in localStorage mode
- **Check:** `WIX_CLIENT_ID` is set in backend environment (no `VITE_` prefix)
- **Check:** Browser console for auth errors
- **Try:** Clear localStorage and cookies, refresh page

### "Authentication required" error
- **Check:** Both `VITE_WIX_CLIENT_ID` and `WIX_CLIENT_ID` are set
- **Check:** Client ID is correct from Wix dashboard
- **Try:** Delete `wix_session` from localStorage and retry

### Checkout fails with "Invalid checkout response"
- **Check:** `WIX_SITE_URL` is set correctly
- **Check:** Cart has items before checkout
- **Check:** Wix site is published and live

### 401 Unauthorized errors
- Tokens may have expired
- Session manager should automatically refresh
- **Try:** Clear cookies and localStorage, authenticate again

---

## Security Notes

1. **HttpOnly Cookies:** Authentication tokens stored in HttpOnly cookies prevent XSS attacks
2. **SameSite=Strict:** Prevents CSRF attacks
3. **Secure Flag:** Tokens only sent over HTTPS in production
4. **Token Expiry:** Visitor tokens expire after 7 days, refresh tokens after 30 days
5. **API Routes:** All Wix API calls go through backend, keeping secrets secure

---

## Development vs Production

### Development (Local)
- Uses `http://localhost:5173`
- Cookies may not work properly (browser security)
- Falls back to localStorage token storage
- Auth headers used instead of cookies

### Production (Vercel)
- Uses HTTPS
- Cookies work correctly
- More secure token management
- Better session persistence

---

## Future Enhancements

- [ ] Implement member authentication (login/signup)
- [ ] Add refresh token rotation
- [ ] Implement cart merging (localStorage → Wix on auth)
- [ ] Add cart abandonment recovery
- [ ] Implement webhook for order status updates

---

## API Response Codes

- **200** - Success
- **400** - Bad Request (missing parameters)
- **401** - Unauthorized (authentication required)
- **405** - Method Not Allowed
- **500** - Server Error

## Support

For Wix API documentation: https://dev.wix.com/docs/sdk
For issues: Check browser console and network tab
