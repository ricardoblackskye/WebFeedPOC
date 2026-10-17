import PropTypes from 'prop-types'
import ProductCard from './ProductCard'
import './ProductList.css'

function ProductList({ products, onAddToCart }) {
  return (
    <>
      <h2 style={{ fontWeight: 'bold' }}>Welcome to the site</h2>
      <div className="product-list">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </>
  )
}

ProductList.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAddToCart: PropTypes.func.isRequired,
}

export default ProductList
