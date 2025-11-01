import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import useCourseList from '../useCourseList';

const Pagination = () => {
  const { page, setPage, total, limit } = useCourseList();

  const totalPages = Math.ceil(total / limit) || 1;

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <nav className="mt-4 d-flex justify-content-center" aria-label="navigation">
      <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
        <li className={`page-item mb-0 ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => goToPage(page - 1)}>
            <FaAngleDoubleLeft />
          </button>
        </li>

        {Array.from({ length: totalPages }).map((_, idx) => (
          <li
            key={idx}
            className={`page-item mb-0 ${page === idx + 1 ? 'active' : ''}`}
          >
            <button className="page-link" onClick={() => goToPage(idx + 1)}>
              {idx + 1}
            </button>
          </li>
        ))}

        <li className={`page-item mb-0 ${page === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => goToPage(page + 1)}>
            <FaAngleDoubleRight />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
