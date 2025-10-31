import { billingHistoryData } from '@/assets/data/products';
import PageMetaData from '@/components/PageMetaData';
import { Card, CardBody, CardHeader, Col, Row, Table } from 'react-bootstrap';
import { BsDownload, BsFillInfoCircleFill, BsInfoCircleFill } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { earningsData } from './data';
const EarningsFastCard = ({
  amount,
  title,
  variant,
  isInfo
}) => {
  return <Col sm={6} lg={4}>
      <div className={`p-4 bg-${variant} bg-opacity-10 rounded-3`}>
        <h6>
          {title}
          {isInfo && <a tabIndex={0} className="h6 mb-0" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-placement="top" data-bs-content="After US royalty withholding tax" data-bs-original-title>
              <BsInfoCircleFill className="small" />
            </a>}
        </h6>
        <h2 className={`mb-0 fs-1 text-${variant}`}>${amount}</h2>
      </div>
    </Col>;
};
const InvoiceHistoryCard = ({
  name,
  paymentMethod,
  date,
  amount,
  status,
  id
}) => {
  return <tr>
      <td>{id}</td>
      <td>
        <h6 className="table-responsive-title mb-0">
          <a href="#">{name}</a>
        </h6>
      </td>
      <td>{date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      })}</td>
      <td>
        <img src={paymentMethod.image} className={` ${paymentMethod.type === 'vnpay' ? 'h-30px' : 'h-40px'}`} height={paymentMethod.type === 'momo' ? 30 : 40} alt="paymentMethodImg" />
      </td>
      <td>
        ${amount}&nbsp;
      </td>
      <td>
        <div className={`badge bg-${status === 'paid' ? 'success' : status === 'pending' ? 'orange' : 'danger'} bg-opacity-10 text-${status === 'paid' ? 'success' : status === 'pending' ? 'orange' : 'danger'}`}>
          {status}
        </div>
      </td>
    </tr>;
};
const EarningsPage = () => {
  return <>
      <PageMetaData title="Earning" />
      <div>
        <Row className="mb-3">
          <Col xs={12}>
            <h1 className="h3 mb-0">Earnings</h1>
          </Col>
        </Row>
        <Row className="g-4 mb-4">
          {earningsData.map((item, idx) => <EarningsFastCard key={idx} {...item} />)}
        </Row>
        <Card className="bg-transparent border">
          <CardHeader className="bg-light border-bottom">
            <h5 className="mb-0">Invoice History</h5>
          </CardHeader>
          <CardBody className="pb-0">
            <div className="table-responsive border-0">
              <Table className="table-dark-gray align-middle p-4 mb-0 table-hover">
                <thead>
                  <tr>
                    <th scope="col" className="border-0 rounded-start">
                      Invoice ID
                    </th>
                    <th scope="col" className="border-0">
                      Course Name
                    </th>
                    <th scope="col" className="border-0">
                      Date
                    </th>
                    <th scope="col" className="border-0">
                      Payment Method
                    </th>
                    <th scope="col" className="border-0">
                      Amount
                    </th>
                    <th scope="col" className="border-0">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistoryData.map((item, idx) => <InvoiceHistoryCard key={idx} {...item} />)}
                </tbody>
              </Table>
            </div>
          </CardBody>
          <CardHeader className="bg-transparent">
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
          </CardHeader>
        </Card>
      </div>
    </>;
};
export default EarningsPage;
