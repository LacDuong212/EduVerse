import { coursesData } from '@/assets/data/products';
import { Button, Card, CardBody, CardFooter, CardHeader, Col } from 'react-bootstrap';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
const TopRatedCoursesCard = ({
  image,
  title,
  enrolled,
  rating
}) => {
  return <tr>
      <td>
        <div className="text-center text-sm-start d-flex align-items-center position-relative">
          <div className="w-60px">
            <img src={image} className="rounded" alt="image" />
          </div>
          <h6 className="mb-0 ms-2">
            <a href="#" className="stretched-link">
              {title}
            </a>
          </h6>
        </div>
      </td>
      <td>{enrolled}</td>
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
      <td>
        <Button variant="success-soft" className="btn-round me-1 mb-1 mb-md-0" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Edit">
          <BsPencilSquare />
        </Button>
        <button className="btn btn-danger-soft btn-round me-1 mb-1 mb-md-0" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Delete">
          <BsTrash />
        </button>
        <Button variant="info-soft" size="sm" className=" mb-0" data-bs-toggle="modal" data-bs-target="#viewReview">
          View
        </Button>
      </td>
    </tr>;
};
const TopRatedCourses = () => {
  return <Col xxl={7}>
      <Card className="bg-transparent border h-100">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0">Top Rated Courses</h5>
        </CardHeader>
        <CardBody className="pb-0">
          <div className="table-responsive border-0">
            <table className="table table-dark-gray text-nowrap align-middle p-4 mb-0 table-hover">
              <thead>
                <tr>
                  <th scope="col" className="border-0 rounded-start">
                    Course Name
                  </th>
                  <th scope="col" className="border-0">
                    Enrolled
                  </th>
                  <th scope="col" className="border-0">
                    Rating
                  </th>
                  <th scope="col" className="border-0 rounded-end">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {coursesData.slice(0, 5).map((item, idx) => <TopRatedCoursesCard key={idx} {...item} />)}
              </tbody>
            </table>
          </div>
        </CardBody>
        <CardFooter className="bg-transparent">
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
    </Col>;
};
export default TopRatedCourses;
