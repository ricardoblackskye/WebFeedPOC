import PropTypes from 'prop-types'

function ImageModal({ images, currentIndex, onClose, onNavigate, productName }) {
  const safeIndex = ((currentIndex % images.length) + images.length) % images.length

  const handlePrev = () => onNavigate((safeIndex - 1 + images.length) % images.length)
  const handleNext = () => onNavigate((safeIndex + 1) % images.length)

  return (
    <div className="image-modal-backdrop" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <img
          src={images[safeIndex]}
          alt={productName}
          className="image-modal-image"
        />
        {images.length > 1 && (
          <div className="image-modal-nav">
            <button onClick={handlePrev} aria-label="Previous image">‹</button>
            <button onClick={handleNext} aria-label="Next image">›</button>
          </div>
        )}
      </div>
    </div>
  )
}

ImageModal.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  productName: PropTypes.string,
}

export default ImageModal