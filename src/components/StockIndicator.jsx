import PropTypes from 'prop-types'
import './StockIndicator.css'

/**
 * Displays stock availability with appropriate styling and messaging
 */
function StockIndicator({ stock, className = '' }) {
  if (!stock) return null

  // If inventory tracking is disabled, show as in stock
  if (!stock.trackInventory) {
    return (
      <div className={`stock-indicator stock-available ${className}`}>
        <span className="stock-icon">✓</span>
        <span className="stock-text">In Stock</span>
      </div>
    )
  }

  // If tracking is enabled but product is not in stock
  if (!stock.inStock || stock.quantity === 0) {
    return (
      <div className={`stock-indicator stock-out ${className}`}>
        <span className="stock-icon">✕</span>
        <span className="stock-text">Out of Stock</span>
      </div>
    )
  }

  // Low stock warning (less than 5 items)
  if (stock.quantity <= 5) {
    return (
      <div className={`stock-indicator stock-low ${className}`}>
        <span className="stock-icon">⚠</span>
        <span className="stock-text">
          Only {stock.quantity} left in stock
        </span>
      </div>
    )
  }

  // Plenty of stock available
  return (
    <div className={`stock-indicator stock-available ${className}`}>
      <span className="stock-icon">✓</span>
      <span className="stock-text">
        In Stock ({stock.quantity} available)
      </span>
    </div>
  )
}

StockIndicator.propTypes = {
  stock: PropTypes.shape({
    trackInventory: PropTypes.bool,
    quantity: PropTypes.number,
    inStock: PropTypes.bool,
  }),
  className: PropTypes.string,
}

export default StockIndicator
