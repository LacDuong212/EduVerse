import { coursesData } from '@/assets/data/products';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import PageMetaData from '@/components/PageMetaData';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row, Table } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';
const InstructorRequestsCard = ({
  avatar,
  subject,
  date,
  name,
  action
}) => {
  return <tr>
      <td>
        <div className="d-flex align-items-center position-relative">
          <div className="avatar avatar-md">
            <img src={avatar} className="rounded-circle" alt="avatar" />
          </div>
          <div className="mb-0 ms-2">
            <h6 className="mb-0">
              <a href="#" className="stretched-link">
                {name}
              </a>
            </h6>
          </div>
        </div>
      </td>
      <td className="text-center text-sm-start">
        <h6 className="mb-0">{subject}</h6>
      </td>
      <td>{date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}</td>
      {action === 'accept' ? <td>
          <Button variant="success" className=" me-1 mb-1 mb-md-0 disabled">
            Accepted
          </Button>
          <Button variant="primary-soft" className="me-1 mb-0" data-bs-toggle="modal" data-bs-target="#appDetail">
            View App
          </Button>
        </td> : action === 'pending' ? <td>
          <Button variant="success-soft" className=" me-1 mb-1 mb-lg-0">
            Accept
          </Button>
          <Button variant="secondary-soft" className=" me-1 mb-1 mb-lg-0">
            Reject
          </Button>
          <Button variant="primary-soft" className=" me-1 mb-0" data-bs-toggle="modal" data-bs-target="#appDetail">
            View App
          </Button>
        </td> : <td>
          <Button variant="secondary" className=" me-1 mb-1 mb-md-0 disabled">
            Rejected
          </Button>
          <Button variant="primary-soft" className=" me-1 mb-0" data-bs-toggle="modal" data-bs-target="#appDetail">
            View App
          </Button>
        </td>}
    </tr>;
};
const InstructorRequests = () => {
  return <>
      <PageMetaData title="Instructor Request" />
      <Row className="mb-3">
        <Col xs={12}>
          <h1 className="h3 mb-2 mb-sm-0">Instructor Requests</h1>
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
                <ChoicesFormInput className="form-select js-choice border-0 z-index-9 bg-transparent" aria-label=".form-select-sm">
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
          <div className="table-responsive border-0">
            <Table className="table-dark-gray align-middle p-4 mb-0 table-hover">
              <thead>
                <tr>
                  <th scope="col" className="border-0 rounded-start">
                    Instructor name
                  </th>
                  <th scope="col" className="border-0">
                    Subject
                  </th>
                  <th scope="col" className="border-0">
                    Requested Date
                  </th>
                  <th scope="col" className="border-0 rounded-end">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {coursesData.slice(0, 7).map((item, idx) => <InstructorRequestsCard key={idx} {...item} />)}
              </tbody>
            </Table>
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
    </>;
};
export default InstructorRequests;
