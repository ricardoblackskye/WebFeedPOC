import './CategoryFilter.css'

function CategoryFilter({ categories, selectedCategory, onCategoryChange, productCounts }) {
  return (
    <div className="category-filter">
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
    </div>
  )
}

export default CategoryFilter
