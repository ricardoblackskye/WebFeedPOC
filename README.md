# Antiques Microsite

A modern e-commerce microsite for selling antiques, built with React, Vite, and integrating with Wix for product feeds and Stripe for payments.

## Features

- 🛍️ Product catalog fetched from Wix.com
- � Real-time inventory management with stock indicators
- 🛒 Shopping cart with Wix ecom integration
- 💳 Wix Checkout integration with order management
- 📋 Order confirmation and history pages
- ⚡ Fast development with Vite
- 🧪 Comprehensive testing with Vitest (160+ tests passing)
- 📱 Responsive design with custom typography
- 🎨 Brand styling with Garamond and gold accents

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Testing**: Vitest
- **Payments**: Wix Checkout (formerly Stripe)
- **Product Feed**: Wix.com API
- **Cart & Orders**: Wix ecom API with localStorage fallback
- **Fonts**: EB Garamond (primary), Lato (secondary)

## Recent Additions

### Inventory Management (Phase 1)
- Real-time stock level indicators
- Color-coded availability (green/gold/red)
- Out-of-stock handling with disabled add-to-cart
- SEO-optimized structured data with availability status

### Wix Cart Integration (Phase 3)
- Full cart service layer (`wixCartService.js`)
- Custom React hook (`useWixCart`) with hybrid backend strategy
- Cart totals breakdown (subtotal, tax, shipping, discount)
- Visual indicators for Wix backend sync status
- Graceful fallback to localStorage when Wix API unavailable
- Comprehensive test coverage (27 cart-related tests)

### Wix Checkout & Orders (Phase 2)
- Complete checkout service layer (`wixCheckoutService.js`) 
- Wix hosted checkout integration - redirects to secure Wix payment page
- Order confirmation page with detailed order summary
- Order history page to view past orders
- Order transformation utilities for simplified data handling
- Support for order status tracking (payment and fulfillment)
- Print-friendly order confirmation view

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

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

## Configuration

Create a `.env.local` file with the following variables:

```
# Frontend Environment Variables (VITE_ prefix for build-time access)
VITE_WIX_CLIENT_ID=your_wix_client_id
VITE_WIX_SITE_URL=https://your-site.wixsite.com/your-site

# Backend Environment Variables (for serverless API routes in /api)
WIX_CLIENT_ID=your_wix_client_id      # Same value as VITE_WIX_CLIENT_ID
WIX_SITE_URL=https://your-site.wixsite.com/your-site  # Same value as VITE_WIX_SITE_URL

# Deprecated (replaced by backend architecture)
# VITE_WIX_API_KEY=your_wix_api_key
# VITE_WIX_SITE_ID=your_wix_site_id
# VITE_WIX_STORES_APP_ID=1380b703-ce81-ff05-f115-39571d94dfcd
```

**For detailed setup instructions, see [WIX-API-INTEGRATION.md](WIX-API-INTEGRATION.md)**

### Architecture Overview

The application uses a serverless backend architecture for secure Wix integration:

- **Frontend** → React app with session management (`wixSession.js`)
- **API Routes** → Serverless functions in `/api` folder handle Wix authentication
  - `/api/wix-auth.js` - Generates visitor tokens via OAuth
  - `/api/wix-cart.js` - Proxies cart operations (add/update/remove)
  - `/api/wix-checkout.js` - Handles checkout and order queries
- **Backend** → API routes authenticate with Wix using OAuth and return tokens to frontend
- **Session** → Tokens stored in localStorage with automatic refresh and retry logic

### Cart & Checkout Integration

The site features a hybrid cart system with automatic fallback:

- **With Wix Backend**: Cart and checkout use Wix ecom API via secure backend
  - Visitor tokens generated server-side for proper authentication
  - Cart syncs to Wix for checkout integration
  - Checkout redirects to Wix hosted checkout page
- **Without Backend (Development)**: Cart stores locally in browser localStorage
  - Useful for development without Wix credentials
  - Shows local mode badge: 📦 Local Cart
- **Automatic Fallback**: If API is unavailable, cart automatically uses localStorage

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── services/       # API services (Wix, Stripe)
├── utils/          # Utility functions
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

