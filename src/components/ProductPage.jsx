import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { stripHtml } from '../utils/helpers'
import { generateProductSchema, generateBreadcrumbSchema, SITE_NAME } from '../utils/structuredData'
import StockIndicator from './StockIndicator'
import './ProductPage.css'

function ProductPage({ products, onAddToCart }) {
  const { slug } = useParams()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  const product = products.find(p => p.slug === slug)

  if (!product) {
    return (
      <div className="product-page-not-found">
        <Helmet>
          <title>Product Not Found | {SITE_NAME}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="back-link">← Back to all products</Link>
      </div>
    )
  }

  const displayImages = product.images?.length > 0
    ? product.images
    : product.image ? [product.image] : []

  const plainDescription = stripHtml(product.description)
  const metaDescription = plainDescription.substring(0, 155)

  const productSchema = generateProductSchema(product)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: product.category || 'Products', url: product.category ? `/category/${encodeURIComponent(product.category)}` : '/' },
    { name: product.name },
  ])

  // Check if product is available for purchase
  const isOutOfStock = product.stock?.trackInventory && (!product.stock?.inStock || product.stock?.quantity === 0)

  // Determine structured data availability
  let availabilitySchema = 'https://schema.org/InStock'
  if (product.stock?.trackInventory) {
    if (!product.stock.inStock || product.stock.quantity === 0) {
      availabilitySchema = 'https://schema.org/OutOfStock'
    } else if (product.stock.quantity <= 5) {
      availabilitySchema = 'https://schema.org/LimitedAvailability'
    }
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return
    onAddToCart(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="product-page">
      <Helmet>
        <title>{product.name} | {SITE_NAME}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`/products/${product.slug}`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`/products/${product.slug}`} />
        {product.image && <meta property="og:image" content={product.image} />}
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="GBP" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:description" content={metaDescription} />
        {product.image && <meta name="twitter:image" content={product.image} />}
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          {product.category && (
            <li><Link to={`/category/${encodeURIComponent(product.category)}`}>{product.category}</Link></li>
          )}
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <article className="product-page-content" itemScope itemType="https://schema.org/Product">
        <div className="product-page-gallery">
          {displayImages.length > 0 ? (
            <>
              <img
                src={displayImages[selectedImageIndex]}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                className="product-page-main-image"
                width="600"
                height="600"
                itemProp="image"
              />
              {displayImages.length > 1 && (
                <div className="product-page-thumbnails">
                  {displayImages.map((imageUrl, index) => (
                    <button
                      key={index}
                      className={`product-page-thumb ${index === selectedImageIndex ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View ${product.name} image ${index + 1}`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} - view ${index + 1}`}
                        width="80"
                        height="80"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="product-page-no-image">No Image Available</div>
          )}
        </div>

        <div className="product-page-details">
          <h1 itemProp="name">{product.name}</h1>

          <div className="product-page-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span itemProp="price" content={product.price}>£{product.price.toFixed(2)}</span>
            <meta itemProp="priceCurrency" content="GBP" />
            <meta itemProp="availability" content={availabilitySchema} />
          </div>

          {product.sku && (
            <div className="product-page-sku">
              SKU: <span itemProp="sku">{product.sku}</span>
            </div>
          )}

          {/* Stock availability indicator */}
          {product.stock && <StockIndicator stock={product.stock} />}

          <div className="product-page-description" itemProp="description">
            <h2>Description</h2>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>

          {product.category && (
            <div className="product-page-meta">
              <strong>Category:</strong>{' '}
              <Link to={`/category/${encodeURIComponent(product.category)}`} itemProp="category">
                {product.category}
              </Link>
            </div>
          )}

          {product.condition && (
            <div className="product-page-meta">
              <strong>Condition:</strong> {product.condition}
            </div>
          )}

          {product.era && (
            <div className="product-page-meta">
              <strong>Era:</strong> {product.era}
            </div>
          )}

          {product.dimensions && (
            <div className="product-page-meta">
              <strong>Dimensions:</strong> {product.dimensions}
            </div>
          )}

          {product.material && (
            <div className="product-page-meta">
              <strong>Material:</strong> {product.material}
            </div>
          )}

          <button
            className={`product-page-add-to-cart ${addedToCart ? 'added' : ''} ${isOutOfStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
          </button>

          <Link to="/" className="product-page-back">← Continue Shopping</Link>
        </div>
      </article>
    </div>
  )
}

export default ProductPage
