# Architecture — Antiques Marketplace

A React 18 single-page application with server-side rendering support, deployed on Vercel. The frontend communicates with Wix eCommerce via a thin layer of Vercel serverless functions that hold service credentials and handle authentication token exchange.

---

## 1. System Overview

```mermaid
C4Context
  title System Context

  Person(user, "Shopper", "Browses antiques, manages cart, places orders")

  System_Boundary(app, "Antiques Marketplace (Vercel)") {
    System(spa, "React SPA", "Vite + React 18, react-router-dom v7")
    System(api, "Serverless API", "Vercel Functions (Node.js)")
  }

  System_Ext(wix, "Wix eCommerce", "Products, Cart, Checkout, Orders APIs")
  System_Ext(cdn, "Image CDN", "Unsplash / Wix media URLs")

  Rel(user, spa, "HTTPS")
  Rel(spa, api, "REST /api/*")
  Rel(api, wix, "Wix SDK + OAuth")
  Rel(spa, cdn, "img src")
```

---

## 2. Deployment & Routing (Vercel)

```mermaid
flowchart LR
  subgraph Vercel["Vercel Edge"]
    direction TB
    SPA["Static SPA\n(dist/)"]
    FN1["/api/wix-auth"]
    FN2["/api/wix-cart"]
    FN3["/api/wix-checkout"]
    FN4["/api/wix-webhook"]
  end

  Browser -->|"GET /*"| SPA
  Browser -->|"POST /api/wix-auth"| FN1
  Browser -->|"GET|POST|PUT|DELETE\n/api/wix-cart"| FN2
  Browser -->|"GET|POST /api/wix-checkout"| FN3
  Wix -->|"Webhook event"| FN4

  FN1 & FN2 & FN3 -->|"Wix SDK"| WixAPI[(Wix eCommerce)]
```

All `/api/*` rewrites are defined in `vercel.json`. CORS is handled per-function.

---

## 3. Frontend Module Map

```mermaid
flowchart TD
  main["main.jsx\nReactDOM root\nBrowserRouter"] --> App

  App --> useWixProducts
  App --> useWixCart
  App --> Cart

  App -->|Outlet| HomePage
  App -->|Outlet| ProductPageWrapper
  App -->|Outlet| CategoryPage
  App -->|Outlet| OrderConfirmation
  App -->|Outlet| OrderHistory

  HomePage --> CategoryFilter
  HomePage --> SortControls
  HomePage --> ProductList
  HomePage --> Pagination
  HomePage --> ProductModal

  ProductPageWrapper --> ProductPage
  ProductPage --> StockIndicator

  ProductList --> ProductCard

  CategoryPage --> SortControls
  CategoryPage --> ProductList
  CategoryPage --> Pagination

  useWixProducts --> wixService["wixService.js\nfetchWixProducts()"]
  useWixCart --> wixCartService["wixCartService.js"]
  useWixCart --> wixSession["wixSession.js\nWixSessionManager"]

  wixCartService --> wixSession
  wixCheckoutService["wixCheckoutService.js"] --> wixSession

  Cart --> wixCheckoutService

  OrderConfirmation --> wixCheckoutService
  OrderHistory --> wixCheckoutService
```

---

## 4. React Component Tree

```mermaid
flowchart TD
  Root["&lt;HelmetProvider&gt;\n&lt;BrowserRouter&gt;"]
  Root --> Routes

  Routes --> AppRoute["Route path='/'"]
  AppRoute --> AppComp["&lt;App&gt;\nheader · main · footer\nprovides Outlet context"]

  AppComp --> CartSidebar["&lt;Cart&gt;\nshown on all pages"]

  AppComp -->|index| HP["&lt;HomePage&gt;"]
  AppComp -->|"products/:slug"| PPW["&lt;ProductPageWrapper&gt;\n→ &lt;ProductPage&gt;"]
  AppComp -->|"category/:name"| CP["&lt;CategoryPage&gt;"]
  AppComp -->|order-confirmation| OC["&lt;OrderConfirmation&gt;"]
  AppComp -->|orders| OH["&lt;OrderHistory&gt;"]

  HP --> CF["&lt;CategoryFilter&gt;"]
  HP --> SC1["&lt;SortControls&gt;"]
  HP --> PL1["&lt;ProductList&gt;"]
  HP --> PG1["&lt;Pagination&gt;"]
  HP --> PM["&lt;ProductModal&gt; (optional)"]

  CP --> SC2["&lt;SortControls&gt;"]
  CP --> PL2["&lt;ProductList&gt;"]
  CP --> PG2["&lt;Pagination&gt;"]

  PL1 & PL2 --> PC["&lt;ProductCard&gt; ×N"]
  PPW --> SI["&lt;StockIndicator&gt;"]
  PM --> SI2["&lt;StockIndicator&gt;"]
```

---

## 5. Data Flow — Product Loading

```mermaid
sequenceDiagram
  participant Browser
  participant useWixProducts
  participant wixService
  participant WixSDK as Wix SDK (client-side)
  participant WixAPI as Wix Products API

  Browser->>useWixProducts: mount (no initialProducts)
  useWixProducts->>wixService: fetchWixProducts()
  wixService->>WixSDK: createClient(OAuthStrategy)
  wixService->>WixSDK: queryCollections().find()
  WixSDK->>WixAPI: HTTP
  WixAPI-->>WixSDK: collections[]
  wixService->>WixSDK: queryProducts().limit(100).find()
  WixSDK->>WixAPI: HTTP
  WixAPI-->>WixSDK: products[] (paginated)
  loop hasNext()
    wixService->>WixSDK: result.next()
    WixSDK->>WixAPI: HTTP
    WixAPI-->>WixSDK: more products[]
  end
  wixService-->>useWixProducts: transformed products[]
  useWixProducts-->>Browser: products, loading:false

  note over wixService,WixAPI: On error → falls back to getMockProducts()
```

---

## 6. Cart Strategy — Hybrid Local / Wix

```mermaid
flowchart TD
  Mount["useWixCart mounts"] --> TryWix["GET /api/wix-cart"]
  TryWix -->|200 OK| WixMode["Wix Backend Mode\nuseWixBackend=true\ncart synced with Wix"]
  TryWix -->|"error / 401"| LocalMode["Local Mode\nuseWixBackend=false\ncart from localStorage"]

  WixMode --> OpW{"Cart operation"}
  OpW -->|add| AddWix["POST /api/wix-cart?action=add"]
  OpW -->|update qty| UpdWix["PUT /api/wix-cart?action=update"]
  OpW -->|remove| RemWix["DELETE /api/wix-cart?action=remove"]
  AddWix & UpdWix & RemWix -->|error| FallLocal["Downgrade to Local Mode"]
  AddWix & UpdWix & RemWix -->|200| UpdateState["setCart(transformWixCart())"]

  LocalMode --> OpL{"Cart operation"}
  OpL -->|"add / update / remove"| StateUpdate["setState()\nuseEffect persists to localStorage"]

  WixMode --> Totals["getCartTotals(wixCart)\nsubtotal + tax + shipping − discount"]
  LocalMode --> LocalTotals["sum(price × qty)\ntax / shipping / discount = 0"]
```

---

## 7. Session & Authentication Flow

```mermaid
sequenceDiagram
  participant App
  participant WixSession as WixSessionManager (singleton)
  participant LS as localStorage
  participant Auth as /api/wix-auth
  participant WixOAuth as Wix OAuth

  App->>WixSession: new WixSessionManager()
  WixSession->>LS: load 'wix_session'
  alt session valid and not expired
    WixSession-->>App: tokens ready
  else no session or expired
    WixSession-->>App: tokens = null
  end

  App->>WixSession: makeAuthenticatedRequest(url)
  WixSession->>WixSession: hasValidSession()?
  alt no valid session
    WixSession->>Auth: POST /api/wix-auth {tokens?}
    Auth->>WixOAuth: generateVisitorTokens / refreshToken
    WixOAuth-->>Auth: accessToken + refreshToken
    Auth-->>WixSession: success + tokens + expiresAt
    WixSession->>LS: save 'wix_session'
  end
  WixSession->>API: fetch(url) with X-Wix-Tokens header
  alt 401 returned
    WixSession->>WixSession: clearSession()
    WixSession->>Auth: re-authenticate
    WixSession->>API: retry request
  end
  API-->>App: response
```

---

## 8. Checkout Flow

```mermaid
sequenceDiagram
  participant User
  participant Cart as Cart component
  participant CheckoutSvc as wixCheckoutService
  participant WixSession as WixSessionManager
  participant CheckoutAPI as /api/wix-checkout
  participant WixEcom as Wix eCommerce

  User->>Cart: click "Proceed to Checkout"
  Cart->>CheckoutSvc: initiateCheckout(localItems?)
  CheckoutSvc->>WixSession: makeAuthenticatedRequest POST /api/wix-checkout
  note over CheckoutSvc,CheckoutAPI: Body includes localItems when in local mode so the API can sync them first
  CheckoutAPI->>WixEcom: currentCart.addToCurrentCart (if localItems)
  CheckoutAPI->>WixEcom: checkout.createCheckoutFromCurrentCart
  WixEcom-->>CheckoutAPI: checkout._id
  CheckoutAPI->>WixEcom: redirects.getRedirectSession
  WixEcom-->>CheckoutAPI: checkoutUrl
  CheckoutAPI-->>Cart: checkoutUrl
  Cart->>User: window.location.href = checkoutUrl

  note over User,WixEcom: User completes payment on Wix hosted checkout
  WixEcom->>User: redirect to /order-confirmation?orderId=...
  User->>OrderConfirmation: page load
  OrderConfirmation->>CheckoutSvc: getOrder(orderId)
  CheckoutSvc->>CheckoutAPI: GET /api/wix-checkout?orderId=...
  CheckoutAPI->>WixEcom: orders.getOrder(orderId)
  WixEcom-->>OrderConfirmation: order details
```

---

## 9. URL Routing

```mermaid
flowchart LR
  root["/"]:::route --> HomePage:::page
  root --> ps["/products/:slug"]:::route --> ProductPage:::page
  root --> cat["/category/:categoryName"]:::route --> CategoryPage:::page
  root --> oc["/order-confirmation?orderId="]:::route --> OrderConfirmation:::page
  root --> oh["/orders"]:::route --> OrderHistory:::page

  classDef route fill:#334,stroke:#88f,color:#fff
  classDef page fill:#343,stroke:#8f8,color:#fff
```

---

## 10. SEO & Structured Data

Each page injects `<head>` metadata via `react-helmet-async` and emits JSON-LD `<script>` blocks generated by `structuredData.js`.

```mermaid
flowchart LR
  SD["structuredData.js"]
  SD --> OrgSchema["Organization\n(App level)"]
  SD --> WebSiteSchema["WebSite + SearchAction\n(App level)"]
  SD --> ItemListSchema["ItemList\n(HomePage / CategoryPage)"]
  SD --> ProductSchema["Product\n(ProductPage)"]
  SD --> BreadcrumbSchema["BreadcrumbList\n(ProductPage / CategoryPage)"]

  OrgSchema & WebSiteSchema --> AppHelmet["Helmet in App.jsx"]
  ItemListSchema --> HomeHelmet["Helmet in HomePage / CategoryPage"]
  ProductSchema & BreadcrumbSchema --> ProductHelmet["Helmet in ProductPage"]
```

---

## 11. State Management Summary

There is no global state library. All state is owned at two levels and passed via React Router's Outlet context.

| Scope | Mechanism | What it holds |
|---|---|---|
| App-wide | `useWixProducts` in `App` → Outlet context | `products[]`, `categories[]`, `productCounts`, `loading`, `error` |
| App-wide | `useWixCart` in `App` → Outlet context | `cart[]`, `addToCart`, `removeFromCart`, `updateQuantity`, `totals` |
| Page-local | `useState` in `HomePage` / `CategoryPage` | `selectedCategory`, `sortBy`, `searchTerm`, `currentPage` |
| Persistent | `localStorage` | Cart items (local mode), Wix session tokens |

---

## 12. Key Dependencies

```mermaid
mindmap
  root((Antiques\nMarketplace))
    Frontend
      react 18
      react-router-dom v7
      react-helmet-async
      prop-types
    Wix SDK
      @wix/sdk
      @wix/stores
      @wix/ecom
      @wix/redirects
    Payments
      @stripe/stripe-js
    Build & Dev
      vite 6
      @vitejs/plugin-react
    Testing
      vitest
      @testing-library/react
      @playwright/test
```
