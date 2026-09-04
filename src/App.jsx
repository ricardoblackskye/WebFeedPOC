import { useMemo, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'
import Cart from './components/Cart'
import { useWixProducts } from './hooks/useWixProducts'
import { useWixCart } from './hooks/useWixCart'
import { generateOrganizationSchema, generateWebSiteSchema, SITE_NAME } from './utils/structuredData'
import './App.css'

function App({ initialProducts }) {
  const { products, loading, error, refreshing } = useWixProducts(initialProducts)
  const { 
    cart, 
    loading: cartLoading, 
    error: cartError,
    useWixBackend,
    addToCart, 
    removeFromCart, 
    updateQuantity,
    totals,
  } = useWixCart()

  const [navOpen, setNavOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
    return uniqueCategories.sort((a, b) => a.localeCompare(b))
  }, [products])

  // Get product counts per category
  const productCounts = useMemo(() => {
    const counts = { 'All': products.length }
    products.forEach(product => {
      if (product.category) {
        counts[product.category] = (counts[product.category] || 0) + 1
      }
    })
    return counts
  }, [products])

  const orgSchema = generateOrganizationSchema()
  const webSiteSchema = generateWebSiteSchema()

  // Total item count (sum of line-item quantities) for the header cart badge.
  const totalCartItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <div className="app">
      {refreshing && (
        <output className="refresh-bar" aria-label="Refreshing products" />
      )}
      <Helmet>
        <title>{SITE_NAME} — Discover Unique Antiques &amp; Vintage Treasures</title>
        <meta name="description" content="Browse our curated collection of authentic antiques and vintage treasures. Furniture, timepieces, decorative arts, ceramics, and more. Free delivery on selected items." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="/" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${SITE_NAME} — Discover Unique Antiques & Vintage Treasures`} />
        <meta property="og:description" content="Browse our curated collection of authentic antiques and vintage treasures. Furniture, timepieces, decorative arts, ceramics, and more." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_NAME} />
        <meta name="twitter:description" content="Discover unique antiques and vintage treasures." />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>
      </Helmet>

      <header className="app-header">
        <Link to="/" className="app-header-link">
          <h1>Antiques Marketplace</h1>
          <p>Discover unique treasures from the past</p>
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={navOpen}
          aria-controls="primary-nav"
          aria-label="Toggle navigation menu"
          onClick={() => setNavOpen((open) => !open)}
        >
          &#9776;
        </button>
        <button
          type="button"
          className="cart-btn"
          aria-expanded={cartDrawerOpen}
          aria-controls="cart-drawer"
          aria-label={`Cart, ${totalCartItems} item${totalCartItems === 1 ? '' : 's'}`}
          onClick={() => setCartDrawerOpen((open) => !open)}
        >
          <span aria-hidden="true">&#128722;</span>
          <span className="cart-badge" aria-hidden="true">{totalCartItems}</span>
        </button>
        <nav id="primary-nav" className="app-nav" data-open={navOpen} aria-label="Site navigation">
          <Link to="/">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/architecture">Architecture</Link>
        </nav>
      </header>

      <main className="app-main">
        <section className="products-section">
          <Outlet context={{ products, loading, error, categories, productCounts, addToCart }} />
        </section>

        <aside className="cart-section" id="cart-drawer" data-drawer-open={cartDrawerOpen}>
          <Cart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            totalPrice={totals.total}
            loading={cartLoading}
            error={cartError}
            useWixBackend={useWixBackend}
            totals={totals}
            isDrawerOpen={cartDrawerOpen}
            onCloseDrawer={() => setCartDrawerOpen(false)}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
      </footer>
    </div>
  )
}

App.propTypes = {
  initialProducts: PropTypes.array,
}

export default App
