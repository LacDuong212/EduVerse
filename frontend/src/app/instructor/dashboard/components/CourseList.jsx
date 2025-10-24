import courses2 from '@/assets/images/courses/4by3/02.jpg';
import courses4 from '@/assets/images/courses/4by3/04.jpg';
import courses6 from '@/assets/images/courses/4by3/06.jpg';
import courses8 from '@/assets/images/courses/4by3/08.jpg';
import courses10 from '@/assets/images/courses/4by3/10.jpg';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaRegEdit, FaTimes } from 'react-icons/fa';


const CourseList = () => {
  return (
    <Row>
      <Col xs={12}>
        <Card className="border bg-transparent rounded-3 mt-5">
          <CardHeader className="bg-transparent border-bottom">
            <div className="d-sm-flex justify-content-sm-between align-items-center">
              <h3 className="mb-2 mb-sm-0">Most Selling Courses</h3>
              <Button variant="primary-soft" size="sm" className="mb-0">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="table-responsive border-0 rounded-3">
              <table className="table table-dark-gray align-middle p-4 mb-0">
                <thead>
                  <tr>
                    <th scope="col" className="border-0 rounded-start">
                      Course Name
                    </th>
                    <th scope="col" className="border-0">
                      Selling
                    </th>
                    <th scope="col" className="border-0">
                      Amount
                    </th>
                    <th scope="col" className="border-0">
                      Period
                    </th>
                    <th scope="col" className="border-0 rounded-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="w-60px">
                          <img src={courses8} className="rounded" alt="courses" />
                        </div>
                        <h6 className="mb-0 ms-2 table-responsive-title">
                          <a href="#">Building Scalable APIs with GraphQL</a>
                        </h6>
                      </div>
                    </td>
                    <td>34</td>
                    <td>$1,25,478</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">9 months</span>
                    </td>
                    <td>
                      <Button variant="success-soft" size="sm" className="btn-round me-1 mb-0">
                        <FaRegEdit className="fa-fw" />
                      </Button>
                      <button className="btn btn-sm btn-danger-soft btn-round mb-0">
                        <FaTimes className="fa-fw" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="w-60px">
                          <img src={courses10} className="rounded" alt="courses" />
                        </div>
                        <h6 className="mb-0 ms-2 table-responsive-title">
                          <a href="#">Bootstrap 5 From Scratch</a>
                        </h6>
                      </div>
                    </td>
                    <td>45</td>
                    <td>$2,85,478</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">6 months</span>
                    </td>
                    <td>
                      <Button variant="success-soft" size="sm" className="btn-round me-1 mb-0">
                        <FaRegEdit className="fa-fw" />
                      </Button>
                      <button className="btn btn-sm btn-danger-soft btn-round mb-0">
                        <FaTimes className="fa-fw" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="w-60px">
                          <img src={courses2} className="rounded" alt="courses" />
                        </div>
                        <h6 className="mb-0 ms-2 table-responsive-title">
                          <a href="#">Graphic Design Masterclass</a>
                        </h6>
                      </div>
                    </td>
                    <td>21</td>
                    <td>$85,478</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">4 months</span>
                    </td>
                    <td>
                      <Button variant="success-soft" size="sm" className="btn-round me-1 mb-0">
                        <FaRegEdit className="fa-fw" />
                      </Button>
                      <button className="btn btn-sm btn-danger-soft btn-round mb-0">
                        <FaTimes className="fa-fw" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="w-60px">
                          <img src={courses4} className="rounded" alt="courses" />
                        </div>
                        <h6 className="mb-0 ms-2 table-responsive-title">
                          <a href="#">Learn Invision</a>
                        </h6>
                      </div>
                    </td>
                    <td>28</td>
                    <td>$98,478</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">8 months</span>
                    </td>
                    <td>
                      <Button variant="success-soft" size="sm" className="btn-round me-1 mb-0">
                        <FaRegEdit className="fa-fw" />
                      </Button>
                      <button className="btn btn-sm btn-danger-soft btn-round mb-0">
                        <FaTimes className="fa-fw" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="w-60px">
                          <img src={courses6} className="rounded" alt="courses" />
                        </div>
                        <h6 className="mb-0 ms-2 table-responsive-title">
                          <a href="#">Angular – The Complete Guider</a>
                        </h6>
                      </div>
                    </td>
                    <td>38</td>
                    <td>$1,02,478</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">1 year</span>
                    </td>
                    <td>
                      <Button variant="success-soft" size="sm" className=" btn-round me-1 mb-0">
                        <FaRegEdit className="fa-fw" />
                      </Button>
                      <button className="btn btn-sm btn-danger-soft btn-round mb-0">
                        <FaTimes className="fa-fw" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-3">
              <p className="mb-0 text-center text-sm-start">Showing 1 to 8 of 20 entries</p>
              <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
                <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                  <li className="page-item mb-0">
                    <a className="page-link" href="#" tabIndex={-1}>
                      <FaAngleLeft className="fas fa-angle-left" />
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
                      <FaAngleRight className="fas fa-angle-right" />
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default CourseList;
