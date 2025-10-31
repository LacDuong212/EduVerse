import { coursesData } from '@/assets/data/products';
import PageMetaData from '@/components/PageMetaData';
import { Card, CardBody, CardFooter, CardHeader, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { BsEnvelopeFill, BsPencilSquare, BsThreeDots, BsTrash } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaBook, FaListUl, FaRegStar, FaSearch, FaStar, FaStarHalfAlt, FaThLarge, FaUserGraduate } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const InstructorsCard = ({
  name,
  category,
  avatar,
  students,
  totalCourses,
  rating
}) => {
  return <Col md={6} xxl={4}>
      <Card className="bg-transparent border h-100">
        <CardHeader className="bg-transparent border-bottom d-flex align-items-sm-center justify-content-between">
          <div className="d-sm-flex align-items-center">
            <div className="avatar avatar-md flex-shrink-0">
              <img className="avatar-img rounded-circle" src={avatar} alt="avatar" />
            </div>
            <div className="ms-0 ms-sm-2 mt-2 mt-sm-0">
              <h5 className="mb-0">
                <a href="#">{name}</a>
              </h5>
              <p className="mb-0 small">{category}</p>
            </div>
          </div>
          <Dropdown drop="down" align="end">
            <DropdownToggle className="btn btn-sm btn-light btn-round small mb-0 arrow-none">
              <BsThreeDots />
            </DropdownToggle>
            <DropdownMenu className="dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded">
              <DropdownItem href="#">
                <BsPencilSquare className="me-2" />
                Edit
              </DropdownItem>
              <DropdownItem href="#">
                <BsTrash className="me-2" />
                Remove
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div className="icon-md bg-orange bg-opacity-10 text-orange rounded-circle flex-shrink-0">
                <FaUserGraduate />
              </div>
              <h6 className="mb-0 ms-2 fw-light">Total Students</h6>
            </div>
            <span className="mb-0 fw-bold">{students}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="icon-md bg-purple bg-opacity-10 text-purple rounded-circle flex-shrink-0">
                <FaBook />
              </div>
              <h6 className="mb-0 ms-2 fw-light">Total Courses</h6>
            </div>
            <span className="mb-0 fw-bold">{totalCourses}</span>
          </div>
        </CardBody>
        <CardFooter className="bg-transparent border-top">
          <div className="d-flex justify-content-between align-items-center">
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
            <Link to="#" className="btn btn-link text-body p-0 mb-0" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Message" aria-label="Message">
              <BsEnvelopeFill />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </Col>;
};
const InstructorsPage = () => {
  return <>
      <PageMetaData title="Instructors" />
      <Row>
        <Col xs={12}>
          <h1 className="h3 mb-2 mb-sm-0">Instructors</h1>
        </Col>
      </Row>
      <Card className="bg-transparent">
        <CardHeader className="bg-transparent border-bottom px-0">
          <Row className=" g-3 align-items-center justify-content-between">
            <Col md={8}>
              <form className="rounded position-relative">
                <input className="form-control bg-transparent" type="search" placeholder="Search" aria-label="Search" />
                <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="submit">
                  <FaSearch />
                </button>
              </form>
            </Col>
            <Col md={3}>
              <ul className="list-inline mb-0 nav nav-pills nav-pill-dark-soft border-0 justify-content-end" id="pills-tab" role="tablist">
                <li className="nav-item">
                  <a href="#nav-preview-tab-1" className="nav-link mb-0 me-2 active" data-bs-toggle="tab">
                    <FaThLarge />
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#nav-html-tab-1" className="nav-link mb-0" data-bs-toggle="tab">
                    <FaListUl />
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="px-0">
          <div className="tab-content">
            <div className="tab-pane fade show active" id="nav-preview-tab-1">
              <Row className=" g-4">
                {coursesData.slice(0, 8).map((item, idx) => <InstructorsCard key={idx} {...item} />)}
              </Row>
            </div>
          </div>
        </CardBody>
        <CardFooter className="bg-transparent p-0">
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
    </>;
};
export default InstructorsPage;
