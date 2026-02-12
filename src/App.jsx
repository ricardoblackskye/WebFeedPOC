import { useState, useEffect, useMemo } from 'react'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import ProductModal from './components/ProductModal'
import CategoryFilter from './components/CategoryFilter'
import { useWixProducts } from './hooks/useWixProducts'
import './App.css'

function App() {
  const { products, loading, error } = useWixProducts()
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

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

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return products
    }
    return products.filter(p => p.category === selectedCategory)
  }, [products, selectedCategory])

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

  const handleProductClick = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Antiques Marketplace</h1>
        <p>Discover unique treasures from the past</p>
      </header>

      <main className="app-main">
        <section className="products-section">
          {!loading && categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              productCounts={productCounts}
            />
          )}

          <h2>
            {selectedCategory === 'All' ? 'All Items' : selectedCategory}
            <span className="product-count"> ({filteredProducts.length})</span>
          </h2>
          
          {loading && <div className="loading">Loading products...</div>}
          {error && <div className="error">Using demo products (Wix not configured)</div>}
          {!loading && filteredProducts.length > 0 && (
            <ProductList 
              products={filteredProducts} 
              onAddToCart={addToCart}
              onProductClick={handleProductClick}
            />
          )}
          {!loading && filteredProducts.length === 0 && products.length > 0 && (
            <div className="error">No products found in this category</div>
          )}
          {!loading && products.length === 0 && (
            <div className="error">No products available</div>
          )}
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

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={addToCart}
        />
      )}
    </div>
  )
}

export default App
