import React, { useState, useEffect } from 'react';
import PageMetaData from '@/components/PageMetaData';
import { Card, CardBody, CardHeader, Col, Row, Table } from 'react-bootstrap';
import { BsInfoCircleFill } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import CountUp from 'react-countup';
import axios from 'axios';


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
      <h2 className={`mb-0 fs-1 text-${variant}`}>
        <CountUp
          end={amount}
          duration={1.5}
        />
      </h2>
    </div>
  </Col>;
};
const InvoiceHistoryCard = ({
  name,
  paymentMethod,
  date,
  amount,
  status,
  _id
}) => {
  return <tr>
    <td>
      <h6 className="table-responsive-title mb-0">
        <a href="#">{name}</a>
      </h6>
    </td>
    <td>{new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    })}</td>
    <td>
      <img src={paymentMethod.image} className={` ${paymentMethod.type === 'vnpay' ? 'h-30px' : 'h-40px'}`} height={paymentMethod.type === 'momo' ? 30 : 40} alt="paymentMethodImg" />
    </td>
    <td>
      ₫{amount}&nbsp;
    </td>
    <td>
      <div className={`badge bg-${status === 'completed' ? 'success' : status === 'pending' ? 'orange' : 'danger'} bg-opacity-10 text-${status === 'completed' ? 'success' : status === 'pending' ? 'orange' : 'danger'}`}>
        {status}
      </div>
    </td>
  </tr>;
};
const EarningsPage = () => {
  const [earningsCards, setEarningsCards] = useState([]);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchEarningsData = async (page = 1) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const statsRes = await axios.get(`${backendUrl}/api/admin/earnings-stats`, config);
      if (statsRes.data.success) {
        setEarningsCards(statsRes.data.data);
      }

      const historyRes = await axios.get(`${backendUrl}/api/admin/earnings-history?page=${page}&limit=4`, config);
      if (historyRes.data.success) {
        setInvoiceHistory(historyRes.data.data);
        setPagination(historyRes.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    }
  };

  useEffect(() => {
    fetchEarningsData(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      items.push(
        <li key={i} className={`page-item mb-0 ${currentPage === i ? 'active' : ''}`}>
          <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }}>
            {i}
          </a>
        </li>
      );
    }
    return items;
  };

  return <>
    <PageMetaData title="Earning" />
    <div>
      <Row className="mb-3">
        <Col xs={12}>
          <h1 className="h3 mb-0">Earnings</h1>
        </Col>
      </Row>
      <Row className="g-4 mb-4">
        {earningsCards.map((item, idx) => <EarningsFastCard key={idx} {...item} />)}
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
                {invoiceHistory.map((item, index) => (
                  <InvoiceHistoryCard
                    key={`${item._id}-${index}`}
                    {...item}
                  />
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
        <CardHeader className="bg-transparent">
          <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
            <p className="mb-0 text-center text-sm-start">
              Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
              &nbsp;to {Math.min(pagination.page * pagination.limit, pagination.total)}
              &nbsp;of {pagination.total} entries
            </p>
            <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
              <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                <li className={`page-item mb-0 ${currentPage === 1 ? 'disabled' : ''}`}>
                  <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} tabIndex={-1}>
                    <FaAngleLeft />
                  </a>
                </li>

                {renderPaginationItems()}

                <li className={`page-item mb-0 ${currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                  <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}>
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
