import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { stripHtml, truncateWords } from '../utils/helpers'
import './ProductCard.css'

function ProductCard({ product, onAddToCart }) {
  const handleAddToCart = (e) => {
    e.stopPropagation() // Prevent card click when clicking "Add to Cart"
    e.preventDefault()
    onAddToCart(product)
  }

  const plainDescription = stripHtml(product.description)
  const truncatedDescription = truncateWords(plainDescription, 50)
  const isTruncated = plainDescription.length > truncatedDescription.length

  // Prepare responsive image sources
  const getImageSources = () => {
    // If we have multiple images, create srcset
    if (product.images && product.images.length > 0) {
      // Create srcset with different widths
      const sources = product.images.map((img, index) => {
        // Use different widths for responsive images
        const width = 400 + (index * 400) // 400, 800, 1200, etc.
        return `${img} ${width}w`
      })
      return sources.join(', ')
    }
    // Fallback to single image with multiple densities
    return `${product.image} 400w, ${product.image} 800w, ${product.image} 1200w`
  }

  // Determine stock status for display
  const getStockStatus = () => {
    if (!product.stock) return null
    if (!product.stock.trackInventory) return <span className="stock-status unlimited">In Stock</span>
    if (product.stock.inStock) {
      if (product.stock.quantity <= 5) {
        return <span className="stock-status low">Low Stock ({product.stock.quantity} left)</span>
      }
      return <span className="stock-status in-stock">In Stock</span>
    }
    return <span className="stock-status out-of-stock">Out of Stock</span>
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card-link">
        <div className="product-image">
          {product.image ? (
            <img
              src={product.image}
              srcSet={getImageSources()}
              sizes="(max-width: 479px) 100vw, (max-width: 768px) 50vw, 33vw"
              alt={product.name}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="product-image-placeholder">No Image</div>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-description">
            {truncatedDescription}
            {isTruncated && (
              <span className="view-more"> View More</span>
            )}
          </div>
          {/* Stock indicator */}
          {getStockStatus()}
        </div>
      </Link>
      <div className="product-footer">
        <span className="product-price">
          £{product.price.toFixed(2)}
        </span>
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </article>
  )
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    category: PropTypes.string,
    stock: PropTypes.shape({
      trackInventory: PropTypes.bool,
      quantity: PropTypes.number,
      inStock: PropTypes.bool,
    }),
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
}

export default ProductCard
