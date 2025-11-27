import { coursesData } from '@/assets/data/products';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import PageMetaData from '@/components/PageMetaData';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaRegStar, FaSearch, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const CourseCategoryCard = ({
  image,
  title,
  name,
  avatar,
  enrolled,
  rating
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
        <div className="d-flex align-items-center">
          <div className="avatar avatar-xs flex-shrink-0">
            <img className="avatar-img rounded-circle" src={avatar} alt="avatar" />
          </div>
          <div className="ms-2">
            <h6 className="mb-0 fw-light">{name}</h6>
          </div>
        </div>
      </td>
      <td>
        <ul className="list-inline mb-0">
          {Array(Math.floor(rating.star)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                <FaStar size={14} className="text-warning" />
              </li>)}
          {!Number.isInteger(rating.star) && <li className="list-inline-item me-1 small">

              <FaStarHalfAlt size={14} className="text-warning" />
            </li>}
          {rating.star < 5 && Array(5 - Math.ceil(rating.star)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                  <FaRegStar size={14} className="text-warning" />
                </li>)}
        </ul>
      </td>
      <td> {enrolled}</td>
      <td>
        <Button variant="success" size="sm" className="me-1 mb-1 mb-md-0">
          Edit
        </Button>
        <button className="btn btn-sm btn-danger mb-0">Delete</button>
      </td>
    </tr>;
};
const CourseCategory = () => {
  return <>
      <PageMetaData title="Course Category" />
      <div>
        <Row className="mb-3">
          <Col xs={12} className="d-sm-flex justify-content-between align-items-center">
            <h1 className="h3 mb-2 mb-sm-0">
              Web design <span className="badge bg-orange bg-opacity-10 text-orange">245</span>
            </h1>
            <Link to="/instructor/create-course" className="btn btn-sm btn-primary mb-0">
              Create a Course
            </Link>
          </Col>
        </Row>
        <Card className="bg-transparent border">
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
                      Rating
                    </th>
                    <th scope="col" className="border-0">
                      Enrolled
                    </th>
                    <th scope="col" className="border-0 rounded-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coursesData.slice(0, 7).map((item, idx) => <CourseCategoryCard key={idx} {...item} />)}
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
        </Card>
      </div>
    </>;
};
export default CourseCategory;
