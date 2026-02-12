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
        <p className="product-description">{product.description}</p>
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
