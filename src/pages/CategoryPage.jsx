import { useState, useEffect, useMemo } from 'react'
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ProductList from '../components/ProductList'
import SortControls from '../components/SortControls'
import Pagination from '../components/Pagination'
import { generateItemListSchema, generateBreadcrumbSchema, SITE_NAME } from '../utils/structuredData'

const PRODUCTS_PER_PAGE = 12

function CategoryPage() {
  const { categoryName } = useParams()
  const { products, loading, addToCart } = useOutletContext()
  const navigate = useNavigate()

  const [sortBy, setSortBy] = useState('name-asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const decodedCategory = decodeURIComponent(categoryName)

  // Filter products by this category and search term
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.category === decodedCategory)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      )
    }
    return result
  }, [products, decodedCategory, searchTerm])

  // Sort
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    switch (sortBy) {
      case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc': return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price)
      default: return sorted
    }
  }, [filteredProducts, sortBy])

  // Paginate
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE
    return sortedProducts.slice(start, start + PRODUCTS_PER_PAGE)
  }, [sortedProducts, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [decodedCategory, searchTerm, sortBy])

  const handleProductClick = (product) => {
    navigate(`/products/${product.slug}`)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const metaDescription = `Browse our ${decodedCategory} collection. ${filteredProducts.length} unique antiques available. Discover authentic vintage ${decodedCategory.toLowerCase()} pieces.`

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: decodedCategory },
  ])

  const itemListSchema = filteredProducts.length > 0
    ? generateItemListSchema(filteredProducts, decodedCategory)
    : null

  return (
    <>
      <Helmet>
        <title>{decodedCategory} | {SITE_NAME}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`/category/${encodeURIComponent(decodedCategory)}`} />
        <meta property="og:title" content={`${decodedCategory} — ${SITE_NAME}`} />
        <meta property="og:description" content={metaDescription} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {itemListSchema && (
          <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        )}
      </Helmet>

      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li aria-current="page">{decodedCategory}</li>
        </ol>
      </nav>

      <h2>
        {decodedCategory}
        <span className="product-count"> ({filteredProducts.length})</span>
      </h2>

      {!loading && filteredProducts.length > 0 && (
        <SortControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {loading && <div className="loading">Loading products...</div>}
      {!loading && paginatedProducts.length > 0 && (
        <>
          <ProductList
            products={paginatedProducts}
            onAddToCart={addToCart}
            onProductClick={handleProductClick}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
      {!loading && filteredProducts.length === 0 && (
        <div className="error">
          No products found in this category.
          <br />
          <Link to="/" style={{ color: '#646cff' }}>← Browse all products</Link>
        </div>
      )}
    </>
  )
}

export default CategoryPage
