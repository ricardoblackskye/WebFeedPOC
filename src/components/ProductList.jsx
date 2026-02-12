import ProductCard from './ProductCard'
import './ProductList.css'

function ProductList({ products, onAddToCart, onProductClick }) {
  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  )
}

export default ProductList
