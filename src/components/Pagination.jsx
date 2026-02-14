import './Pagination.css'

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <div className="pagination-pages">
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={page}
              className={`pagination-page ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
