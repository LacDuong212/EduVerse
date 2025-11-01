import { coursesData } from '@/assets/data/products';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const CourseCard = ({
  image,
  title,
  avatar,
  name,
  date,
  price,
  status,
  badge
}) => {
  return <tr>
      <td>
        <div className="d-flex align-items-center position-relative">
          <div className="w-60px">
            <img src={image} className="rounded" alt="image" />
          </div>
          <h6 className="table-responsive-title mb-0 ms-2">
            <Link to="#" className="stretched-link">
              {title}
            </Link>
          </h6>
        </div>
      </td>
      <td>
        <div className="d-flex align-items-center mb-3">
          <div className="avatar avatar-xs flex-shrink-0">
            <img className="avatar-img rounded-circle" src={avatar} alt="avatar" />
          </div>
          <div className="ms-2">
            <h6 className="mb-0 fw-light">{name}</h6>
          </div>
        </div>
      </td>
      <td>{date.toLocaleDateString()}</td>
      <td>
        <span className={`badge text-bg-${badge.text === 'Beginner' ? 'primary' : badge.text === 'All level' ? 'orange' : 'purple'}`}>
          {badge.text}
        </span>
      </td>
      <td>{price}</td>
      <td>

        <span className={`badge text-${status === 'pending' ? 'warning' : 'success'} bg-${status === 'pending' ? 'warning' : 'success'} bg-opacity-15 `}>
          {status}
        </span>
      </td>
      {status === 'pending' ? <td>
          <Button variant="success-soft" size="sm" className="me-1 mb-1 mb-md-0">
            Approve
          </Button>
          <button className="btn btn-sm btn-secondary-soft mb-0">Reject</button>
        </td> : <td>
          <Button variant="dark" size="sm" className="me-1 mb-1 mb-md-0">
            Edit
          </Button>
        </td>}
    </tr>;
};
const Courses = () => {
  return <Card className="bg-transparent border">
      <CardHeader className="bg-light border-bottom">
        <Row className="g-3 align-items-center justify-content-between">
          <Col md={8}>
            <form className="rounded position-relative">
              <input className="form-control bg-body" type="search" placeholder="Search" aria-label="Search" />
              <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="submit">
                <FaSearch />
              </button>
            </form>
          </Col>
          <Col md={3}>
            <form>
              <ChoicesFormInput className="form-select js-choice border-0 z-index-9" aria-label=".form-select-sm">
                <option>Sort by</option>
                <option>Newest</option>
                <option>Oldest</option>
                <option>Accepted</option>
                <option>Rejected</option>
              </ChoicesFormInput>
            </form>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <div className="table-responsive border-0 rounded-3">
          <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
            <thead>
              <tr>
                <th scope="col" className="border-0 rounded-start">
                  Course Name
                </th>
                <th scope="col" className="border-0">
                  Instructor
                </th>
                <th scope="col" className="border-0">
                  Added Date
                </th>
                <th scope="col" className="border-0">
                  Type
                </th>
                <th scope="col" className="border-0">
                  Price
                </th>
                <th scope="col" className="border-0">
                  Status
                </th>
                <th scope="col" className="border-0 rounded-end">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {coursesData.slice(0, 8).map((item, idx) => <CourseCard key={idx} {...item} />)}
            </tbody>
          </table>
        </div>
      </CardBody>
      <CardFooter className="bg-transparent pt-0">
        <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
          <p className="mb-0 text-center text-sm-start">Showing 1 to 8 of 20 entries</p>
          <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
            <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
              <li className="page-item mb-0">
                <a className="page-link" href="#" tabIndex={-1}>
                  <FaAngleLeft />
                </a>
              </li>
              <li className="page-item mb-0">
                <a className="page-link" href="#">
                  1
                </a>
              </li>
              <li className="page-item mb-0 active">
                <a className="page-link" href="#">
                  2
                </a>
              </li>
              <li className="page-item mb-0">
                <a className="page-link" href="#">
                  3
                </a>
              </li>
              <li className="page-item mb-0">
                <a className="page-link" href="#">
                  <FaAngleRight />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </CardFooter>
    </Card>;
};
export default Courses;
