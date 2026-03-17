import PropTypes from 'prop-types'
import './SortControls.css'

function SortControls({ sortBy, onSortChange, searchTerm, onSearchChange }) {
  return (
    <div className="sort-controls">
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="sort-box">
        <label htmlFor="sort-select" className="sort-label">Sort by:</label>
        <select
          id="sort-select"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="name-asc">Name (A–Z)</option>
          <option value="name-desc">Name (Z–A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>
    </div>
  )
}

SortControls.propTypes = {
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
}

export default SortControls
