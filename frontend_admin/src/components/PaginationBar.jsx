import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

/**
 * PaginationBar — shared pagination component with ellipsis for large page counts.
 * Props:
 *  page         — current 1-based page number
 *  totalPages   — total number of pages
 *  totalItems   — total item count (for "Showing X to Y of Z entries" label)
 *  pageSize     — items per page
 *  onPageChange — callback(newPage)
 */
const PaginationBar = ({ page, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalPages <= 0) return null;

  const renderPageItems = () => {
    const pagesToShow = [...new Set(
      [1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages)
    )].sort((a, b) => a - b);

    const items = [];
    let lastPage = 0;

    pagesToShow.forEach((p) => {
      if (lastPage && p - lastPage > 1) {
        items.push(
          <li key={`ellipsis-${p}`} className="page-item mb-0 disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      items.push(
        <li key={p} className={`page-item mb-0 ${p === page ? 'active' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
        </li>
      );
      lastPage = p;
    });

    return items;
  };

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
      <p className="mb-0 text-center text-sm-start">
        Showing {from} to {to} of {totalItems} entries
      </p>
      <nav className="d-flex justify-content-center mb-0">
        <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
          <li className={`page-item mb-0 ${page === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <FaAngleLeft />
            </button>
          </li>
          {renderPageItems()}
          <li className={`page-item mb-0 ${page >= totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <FaAngleRight />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default PaginationBar;
