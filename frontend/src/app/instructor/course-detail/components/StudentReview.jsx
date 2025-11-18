import { studentReviewData } from '@/assets/data/other';
import { Button, Card, CardBody, CardFooter, CardHeader, Col } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const StudentReviewCard = ({
  avatar,
  name,
  time,
  rating
}) => {
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center position-relative">
          <div className="avatar avatar-xs mb-2 mb-md-0">
            <img src={avatar} className="rounded-circle" alt="avatar" />
          </div>
          <div className="mb-0 ms-2">
            <h6 className="mb-0">
              <Link to="#" className="stretched-link">
                {name}
              </Link>
            </h6>
          </div>
        </div>
      </td>
      <td className="text-center text-sm-start">
        <h6 className="mb-0">{time.toLocaleString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}</h6>
      </td>
      <td>
        <ul className="list-inline mb-0">
          {rating && <>
            {Array(Math.floor(rating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
              <FaStar size={14} className="text-warning" />
            </li>)}
            {!Number.isInteger(rating) && <li className="list-inline-item me-1 small">

              <FaStarHalfAlt size={14} className="text-warning" />
            </li>}
            {rating < 5 && Array(5 - Math.ceil(rating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
              <FaRegStar size={14} className="text-warning" />
            </li>)}
          </>}
        </ul>
      </td>
      <td>
        <Button variant="info-soft" size="sm" className="mb-0" data-bs-toggle="modal" data-bs-target="#viewReview">
          View
        </Button>
        &nbsp;
        <button className="btn btn-sm btn-danger-soft me-1 mb-1 mb-md-0">Delete</button>
      </td>
    </tr>
  );
};

const StudentReview = ({ col = 12 }) => {
  return (
    <Col xs={col}>
      <Card className="bg-transparent border">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0">Students all Reviews</h5>
        </CardHeader>
        <CardBody className="pb-0">
          <div className="table-responsive border-0">
            <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
              <thead>
                <tr>
                  <th scope="col" className="border-0 rounded-start">
                    Student Name
                  </th>
                  <th scope="col" className="border-0">
                    Date
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
                {studentReviewData.slice(0, 5).map((item, idx) => <StudentReviewCard key={idx} {...item} />)}
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
    </Col>
  );
};

export default StudentReview;
