import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import ProductCard from './ProductCard'
import './ProductList.css'

function ProductList({ products, onAddToCart }) {
  const { pathname } = useLocation()

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
      {pathname === '/' && (
        <footer className="product-list-footer">
          <p><em>Built by the Dark Factory - by the Developer Agent</em></p>
        </footer>
      )}
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
