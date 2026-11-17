import PropTypes from 'prop-types'
import ProductCard from './ProductCard'
import './ProductList.css'

const CREDIT_LINE = (
  <p className="product-list-footer">
    <em>Built by the Dark Factory - by the Developer Agent</em>
  </p>
)

function ProductList({ products, onAddToCart }) {
  return (
    <>
      <div className="product-list">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
      {CREDIT_LINE}
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
