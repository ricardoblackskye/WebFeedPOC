import { useState, useMemo } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Cart from './components/Cart'
import { useWixProducts } from './hooks/useWixProducts'
import { generateOrganizationSchema, generateWebSiteSchema, SITE_NAME } from './utils/structuredData'
import './App.css'

function App({ initialProducts }) {
  const { products, loading, error } = useWixProducts(initialProducts)
  const [cart, setCart] = useState([])

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
    return uniqueCategories.sort()
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

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const orgSchema = generateOrganizationSchema()
  const webSiteSchema = generateWebSiteSchema()

  return (
    <div className="app">
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
      </header>

      <main className="app-main">
        <section className="products-section">
          <Outlet context={{ products, loading, error, categories, productCounts, addToCart }} />
        </section>

        <aside className="cart-section">
          <Cart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            totalPrice={getTotalPrice()}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
