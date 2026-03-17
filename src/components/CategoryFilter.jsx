import PropTypes from 'prop-types'
import './CategoryFilter.css'

function CategoryFilter({ categories, selectedCategory, onCategoryChange, productCounts }) {
  return (
    <nav aria-label="Product categories" className="category-filter">
      <h3 className="category-filter-title">Categories</h3>
      <div className="category-list">
        <button
          className={`category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => onCategoryChange('All')}
        >
          All Items
          {productCounts['All'] && (
            <span className="category-count">{productCounts['All']}</span>
          )}
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
            {productCounts[category] && (
              <span className="category-count">{productCounts[category]}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCategory: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  productCounts: PropTypes.objectOf(PropTypes.number).isRequired,
}

export default CategoryFilter
