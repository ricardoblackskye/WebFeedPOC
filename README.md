# Antiques Microsite

A modern e-commerce microsite for selling antiques, built with React, Vite, and integrating with Wix for product feeds and Stripe for payments.

## Features

- 🛍️ Product catalog fetched from Wix.com
- 💳 Secure payment processing via Stripe
- ⚡ Fast development with Vite
- 🧪 Comprehensive testing with Vitest
- 📱 Responsive design

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Testing**: Vitest
- **Payments**: Stripe
- **Product Feed**: Wix.com API

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
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_WIX_API_KEY=your_wix_api_key
VITE_WIX_SITE_ID=your_wix_site_id
```

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
