import { useOutletContext } from 'react-router-dom'
import ProductPage from '../components/ProductPage'

function ProductPageWrapper() {
  const { products, addToCart } = useOutletContext()
  return <ProductPage products={products} onAddToCart={addToCart} />
}

export default ProductPageWrapper
