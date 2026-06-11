import { useState, useRef, useEffect } from 'react';
import { FaAngleLeft, FaAngleRight, FaCaretUp, FaCaretDown } from 'react-icons/fa';

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const ITEM_HEIGHT = 37; // px — matches padding:8px top+bottom + ~21px line height

const PageSizeDropdown = ({ pageSize, pageSizeOptions, onPageSizeChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedIndex = pageSizeOptions.indexOf(pageSize);
  // Shift dropdown up so selected item aligns with the trigger
  const topOffset = -selectedIndex * ITEM_HEIGHT;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px 4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.875rem',
          color: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        Rows per page: <strong>{pageSize}</strong>
        {open ? <FaCaretUp size={11} /> : <FaCaretDown size={11} />}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: `calc(100% + ${topOffset}px)`,
          left: 130,
          background: '#fff',
          borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
          minWidth: '80px',
          zIndex: 1050,
          overflow: 'hidden',
        }}>
          {pageSizeOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { onPageSizeChange(s); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 20px',
                textAlign: 'center',
                background: s === pageSize ? 'var(--bs-primary, #6366f1)' : 'transparent',
                color: s === pageSize ? '#fff' : 'inherit',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: s === pageSize ? 600 : 400,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * PaginationBar — shared pagination component with ellipsis for large page counts.
 * Props:
 *  page             — current 1-based page number
 *  totalPages       — total number of pages
 *  totalItems       — total item count (for "Showing X to Y of Z entries" label)
 *  pageSize         — items per page
 *  onPageChange     — callback(newPage)
 *  onPageSizeChange — optional callback(newSize); if provided, shows page size dropdown
 *  pageSizeOptions  — optional array of sizes; defaults to [20, 50, 100]
 */
const PaginationBar = ({ page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange, pageSizeOptions = PAGE_SIZE_OPTIONS }) => {
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
    <div className="d-sm-flex justify-content-sm-between align-items-sm-center gap-2">
      <div className="d-flex align-items-center gap-3">
        <p className="mb-0 text-center text-sm-start">
          Showing {from} to {to} of {totalItems} entries
        </p>
        {onPageSizeChange && (
          <PageSizeDropdown
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
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
