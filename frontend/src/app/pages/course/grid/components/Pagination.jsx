import { Link } from 'react-router-dom';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
const Pagination = () => {
  return <nav className="mt-4 d-flex justify-content-center" aria-label="navigation">
      <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
        <li className="page-item mb-0">
          <Link className="page-link" to="" tabIndex={-1}>
            <FaAngleDoubleLeft />
          </Link>
        </li>
        <li className="page-item mb-0">
          <Link className="page-link" to="">
            1
          </Link>
        </li>
        <li className="page-item mb-0 active" aria-current="page">
          <Link className="page-link" to="">
            2
          </Link>
        </li>
        <li className="page-item mb-0">
          <Link className="page-link" to="">
            ..
          </Link>
        </li>
        <li className="page-item mb-0">
          <Link className="page-link" to="">
            6
          </Link>
        </li>
        <li className="page-item mb-0">
          <Link className="page-link" to="">
            <FaAngleDoubleRight />
          </Link>
        </li>
      </ul>
    </nav>;
};
export default Pagination;
