import { instructorsData } from '@/assets/data/products';
import { Fragment } from 'react';
import { Button, Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { BsPatchCheckFill } from 'react-icons/bs';
import { FaBook, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const TopInstructorsCard = ({
  image,
  rating,
  totalCourses,
  name,
  verified
}) => {
  return <>
      <div className="d-sm-flex justify-content-between align-items-center">
        <div className="d-sm-flex align-items-center mb-1 mb-sm-0">
          <div className="avatar avatar-md flex-shrink-0">
            <img className="avatar-img rounded-circle" src={image} alt="avatar" />
          </div>
          <div className="ms-0 ms-sm-2 mt-2 mt-sm-0">
            <h6 className="mb-1">
              {name}
              {verified && <BsPatchCheckFill className="text-info small ms-1" />}
            </h6>
            <ul className="list-inline mb-0 small">
              <li className="list-inline-item fw-light me-2 mb-1 mb-sm-0">
                <FaBook className="text-purple me-1" />
                {totalCourses} Courses
              </li>
              <li className="list-inline-item fw-light me-2 mb-1 mb-sm-0">
                <FaStar className="text-warning me-1" />
                {rating}/5.0
              </li>
            </ul>
          </div>
        </div>
        <Button variant="light" size="sm" href="#" className="mb-0">
          View
        </Button>
      </div>
    </>;
};
const TopInstructors = () => {
  return <Col lg={6} xxl={4}>
      <Card className="shadow h-100">
        <CardHeader className="border-bottom d-flex justify-content-between align-items-center p-4">
          <h5 className="card-header-title">Top Instructors</h5>
          <Link to="#" className="btn btn-link p-0 mb-0">
            View all
          </Link>
        </CardHeader>
        <CardBody className="p-4">
          {instructorsData.slice(0, 5).map((item, idx) => <Fragment key={idx}>
              <TopInstructorsCard key={item.id} {...item} />
              {instructorsData.slice(0, 5).length - 1 != idx && <hr />}
            </Fragment>)}
        </CardBody>
      </Card>
    </Col>;
};
export default TopInstructors;
