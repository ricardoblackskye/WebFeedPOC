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

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card-link">
        <div className="product-image">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              width="400"
              height="400"
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
