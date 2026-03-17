import { useState, useEffect, useMemo } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ProductList from '../components/ProductList'
import ProductModal from '../components/ProductModal'
import CategoryFilter from '../components/CategoryFilter'
import SortControls from '../components/SortControls'
import Pagination from '../components/Pagination'
import { generateItemListSchema } from '../utils/structuredData'

const PRODUCTS_PER_PAGE = 12

function HomePage() {
  const { products, loading, error, categories, productCounts, addToCart } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('name-asc')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter products by selected category and search term
  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory)
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      )
    }
    return result
  }, [products, selectedCategory, searchTerm])

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)
      default:
        return sorted
    }
  }, [filteredProducts, sortBy])

  // Paginate sorted products
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE
    return sortedProducts.slice(start, start + PRODUCTS_PER_PAGE)
  }, [sortedProducts, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm, sortBy])

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    if (value.trim()) {
      setSearchParams({ search: value })
    } else {
      setSearchParams({})
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const schemaProducts = selectedCategory === 'All' ? products : filteredProducts
  const schemaCategory = selectedCategory === 'All' ? 'All Antiques' : selectedCategory
  const itemListSchema = products.length > 0
    ? generateItemListSchema(schemaProducts, schemaCategory)
    : null

  return (
    <>
      {itemListSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        </Helmet>
      )}

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

      {!loading && products.length > 0 && (
        <SortControls
          sortBy={sortBy}
          onSortChange={handleSortChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      )}

      {loading && <div className="loading">Loading products...</div>}
      {error && <div className="error">Using demo products (Wix not configured)</div>}
      {!loading && paginatedProducts.length > 0 && (
        <>
          <ProductList
            products={paginatedProducts}
            onAddToCart={addToCart}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
      {!loading && filteredProducts.length === 0 && products.length > 0 && (
        <div className="error">No products found</div>
      )}
      {!loading && products.length === 0 && (
        <div className="error">No products available</div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={addToCart}
        />
      )}
    </>
  )
}

export default HomePage
