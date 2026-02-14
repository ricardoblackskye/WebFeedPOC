import { useEffect } from 'react'
import './ProductModal.css'

function ProductModal({ product, onClose, onAddToCart }) {
  useEffect(() => {
    // Close modal on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  if (!product) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAddToCart = () => {
    onAddToCart(product)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <div className="modal-body">
          <div className="modal-image-section">
            {product.image ? (
              <img src={product.image} alt={product.name} className="modal-image" />
            ) : (
              <div className="modal-image-placeholder">No Image Available</div>
            )}
          </div>
          
          <div className="modal-details-section">
            <h2 className="modal-title">{product.name}</h2>
            
            <div className="modal-price">
              £{product.price.toFixed(2)}
            </div>
            
            <div className="modal-description">
              <h3>Description</h3>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
            
            {product.category && (
              <div className="modal-info">
                <strong>Category:</strong> {product.category}
              </div>
            )}
            
            {product.sku && (
              <div className="modal-info">
                <strong>SKU:</strong> {product.sku}
              </div>
            )}
            
            {product.condition && (
              <div className="modal-info">
                <strong>Condition:</strong> {product.condition}
              </div>
            )}
            
            {product.era && (
              <div className="modal-info">
                <strong>Era:</strong> {product.era}
              </div>
            )}
            
            {product.dimensions && (
              <div className="modal-info">
                <strong>Dimensions:</strong> {product.dimensions}
              </div>
            )}
            
            {product.material && (
              <div className="modal-info">
                <strong>Material:</strong> {product.material}
              </div>
            )}
            
            <button className="modal-add-to-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
