import { FaCaretLeft, FaCaretRight, FaFastBackward, FaFastForward } from "react-icons/fa";

const Pagination = ({ page, limit, total, onChangePage }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) onChangePage(p);
  };

  const getVisiblePages = () => {
    let pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (page >= totalPages - 2) {
        pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", page - 1, page, page + 1, "...", totalPages];
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="mt-4 d-flex justify-content-center" aria-label="navigation">
      <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">

        <li className={`page-item mb-0 ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => goToPage(1)}>
            <FaFastBackward />
          </button>
        </li>

        <li className={`page-item mb-0 ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => goToPage(page - 1)}>
            <FaCaretLeft />
          </button>
        </li>

        {visiblePages.map((p, idx) =>
          p === "..." ? (
            <li key={idx} className="page-item mb-0 disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li
              key={idx}
              className={`page-item mb-0 ${page === p ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(p)}>
                {p}
              </button>
            </li>
          )
        )}

        <li className={`page-item mb-0 ${page === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => goToPage(page + 1)}>
            <FaCaretRight />
          </button>
        </li>

        <li className={`page-item mb-0 ${page === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => goToPage(totalPages)}>
            <FaFastForward />
          </button>
        </li>

      </ul>
    </nav>
  );
};

export default Pagination;