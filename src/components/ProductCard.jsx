import { stripHtml, truncateWords } from '../utils/helpers'
import './ProductCard.css'

function ProductCard({ product, onAddToCart, onProductClick }) {
  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product)
    }
  }

  const handleAddToCart = (e) => {
    e.stopPropagation() // Prevent card click when clicking "Add to Cart"
    onAddToCart(product)
  }

  const plainDescription = stripHtml(product.description)
  const truncatedDescription = truncateWords(plainDescription, 50)
  const isTruncated = plainDescription.length > truncatedDescription.length

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
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
      </div>
    </div>
  )
}

export default ProductCard
