import { useEffect, useState } from 'react'
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

  // Early return if no product provided (after all hooks)
  if (!product) return null

  // Determine which images to display - use images array if available, fallback to single image
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : []

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
            {displayImages.length > 0 ? (
              <>
                <img 
                  src={displayImages[selectedImageIndex]} 
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`} 
                  className="modal-image" 
                />
                {displayImages.length > 1 && (
                  <div className="modal-image-thumbnails">
                    {displayImages.map((imageUrl, index) => (
                      <button
                        key={index}
                        className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img src={imageUrl} alt={`${product.name} - view ${index + 1}`} />
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
