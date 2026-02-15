# Antiques Microsite

A modern e-commerce microsite for selling antiques, built with React, Vite, and integrating with Wix for product feeds and Stripe for payments.

## Features

- 🛍️ Product catalog fetched from Wix.com
- � Real-time inventory management with stock indicators
- 🛒 Shopping cart with Wix ecom integration
- 💳 Secure payment processing via Stripe
- ⚡ Fast development with Vite
- 🧪 Comprehensive testing with Vitest (138 tests passing)
- 📱 Responsive design with custom typography
- 🎨 Brand styling with Garamond and gold accents

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Testing**: Vitest
- **Payments**: Stripe
- **Product Feed**: Wix.com API
- **Cart**: Wix ecom API with localStorage fallback
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
# Stripe Payment Processing
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Wix API Configuration
VITE_WIX_API_KEY=your_wix_api_key
VITE_WIX_SITE_ID=your_wix_site_id

# Wix Cart Integration (optional - uses localStorage fallback if not configured)
VITE_WIX_CLIENT_ID=your_wix_client_id
VITE_WIX_STORES_APP_ID=1380b703-ce81-ff05-f115-39571d94dfcd  # Default Wix Stores app ID
```

### Cart Integration

The site features a hybrid cart system:
- **With Wix Authentication**: Cart persists across devices and sessions via Wix ecom API
- **Without Authentication**: Cart stores locally in browser localStorage
- The cart automatically falls back to localStorage if Wix API is unavailable

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
