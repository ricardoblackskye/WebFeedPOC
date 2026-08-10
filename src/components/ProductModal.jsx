import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import StockIndicator from './StockIndicator'
import './ProductModal.css'

function ProductModal({ product, onClose, onAddToCart }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    // Reset to first image when product changes
    if (product?.id) {
      setSelectedImageIndex(0)
    }
  }, [product?.id])

  useEffect(() => {
    // Close modal on Escape key and lock page scrolling in the browser only.
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    globalThis.addEventListener('keydown', handleEscape)

    if (typeof document === 'undefined') {
      return () => globalThis.removeEventListener('keydown', handleEscape)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      globalThis.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  // Early return if no product provided (after all hooks)
  if (!product) return null

  // Determine which images to display - use images array if available, fallback to single image
  let displayImages = []
  if (product.images && product.images.length > 0) {
    displayImages = product.images
  } else if (product.image) {
    displayImages = [product.image]
  }

  // Check if product is available for purchase
  const isOutOfStock = product.stock?.trackInventory && (!product.stock?.inStock || product.stock?.quantity === 0)

  const handleAddToCart = () => {
    if (isOutOfStock) return
    onAddToCart(product)
    onClose()
  }

  return (
    <dialog
      open
      className="modal-backdrop"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <div className="modal-body">
          <div className="modal-image-section">
            {displayImages.length > 0 ? (
              <>
                <img 
                  src={displayImages[selectedImageIndex]} 
                  alt={displayImages.length > 1 ? `${product.name} (${selectedImageIndex + 1} of ${displayImages.length})` : product.name} 
                  className="modal-image" 
                />
                {displayImages.length > 1 && (
                  <div className="modal-image-thumbnails">
                    {displayImages.map((imageUrl, index) => (
                      <button
                        key={imageUrl}
                        className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                        aria-label={`View ${index + 1} of ${displayImages.length}`}
                      >
                        <img src={imageUrl} alt={`${product.name}, view ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="modal-image-placeholder">No Image Available</div>
            )}
          </div>
          
          <div className="modal-details-section">
            <h2 id="modal-title" className="modal-title">{product.name}</h2>
            
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
            
            {product.stock && <StockIndicator stock={product.stock} />}
            
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
            
            <button 
              className={`modal-add-to-cart ${isOutOfStock ? 'disabled' : ''}`} 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

ProductModal.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    image: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.string,
    sku: PropTypes.string,
    condition: PropTypes.string,
    era: PropTypes.string,
    dimensions: PropTypes.string,
    material: PropTypes.string,
    stock: PropTypes.shape({
      trackInventory: PropTypes.bool,
      quantity: PropTypes.number,
      inStock: PropTypes.bool,
    }),
  }),
  onClose: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
}

export default ProductModal
