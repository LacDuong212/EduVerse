import { useState, useEffect } from 'react';
import PageMetaData from '@/components/PageMetaData';
import { Card, CardBody, CardHeader, Col, Row, Table } from 'react-bootstrap';
import { BsInfoCircleFill } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaMoneyBillWave } from 'react-icons/fa';
import CountUp from 'react-countup';
import axios from 'axios';
import { formatCurrency } from '@/utils/currency';


const CURRENCY_TITLES = ['total sales', 'pending revenue'];

const EarningsFastCard = ({
  amount,
  title,
  variant,
  isInfo
}) => {
  const isCurrency = CURRENCY_TITLES.includes(title?.toLowerCase());
  return <Col sm={6} lg={3}>
    <div className={`p-4 bg-${variant} bg-opacity-10 rounded-3 border border-${variant} border-opacity-25 shadow-sm stat-card-hover`}>
      <h6 className="text-muted small fw-semibold text-uppercase mb-2">
        {title}
        {isInfo && <a tabIndex={0} className="h6 mb-0 ms-1" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-placement="top" data-bs-content="After US royalty withholding tax" data-bs-original-title>
          <BsInfoCircleFill className="small" />
        </a>}
      </h6>
      <h2 className={`mb-0 fs-2 fw-bold text-${variant}`}>
        <CountUp
          end={amount}
          duration={1.5}
          formattingFn={isCurrency ? (val) => formatCurrency(val) : undefined}
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
        <span>{name}</span>
      </h6>
    </td>
    <td>{new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    })}</td>
    <td>
      <img
        src={paymentMethod.image}
        className="d-inline-block"
        style={{
          height: paymentMethod.type === 'vnpay'
            ? '30px'
            : paymentMethod.type === 'momo'
              ? '50px'
              : '35px',
          width: 'auto'
        }}
        alt="paymentMethodImg"
      />
    </td>
    <td>
      {formatCurrency(amount)}
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
      const statsRes = await axios.get(
        `${backendUrl}/api/earnings/stats`,
        { withCredentials: true }
      );
      if (statsRes.data.success) {
        setEarningsCards(statsRes.data.data);
      }

      const historyRes = await axios.get(
        `${backendUrl}/api/earnings/history?page=${page}&limit=4`,
        { withCredentials: true }
      );
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
    const totalPages = pagination.totalPages;

    const siblingsCount = 1;

    for (let i = 1; i <= totalPages; i++) {
      const isFirstPage = i === 1;
      const isLastPage = i === totalPages;
      const isWithinRange = i >= currentPage - siblingsCount && i <= currentPage + siblingsCount;

      if (isFirstPage || isLastPage || isWithinRange) {
        items.push(
          <li key={i} className={`page-item mb-0 ${currentPage === i ? 'active' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(i)}
            >
              {i}
            </button>
          </li>
        );
      } else if (i === 2 && currentPage - siblingsCount > 2) {
        items.push(
          <li key="left-ellipsis" className="page-item mb-0 disabled">
            <span className="page-link">...</span>
          </li>
        );
      } else if (i === totalPages - 1 && currentPage + siblingsCount < totalPages - 1) {
        items.push(
          <li key="right-ellipsis" className="page-item mb-0 disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    return items;
  };

  return <>
    <PageMetaData title="Earning" />
    <div className="page-title-box d-sm-flex align-items-start justify-content-between">
      <div>
        <h1 className="h3 mb-1 d-flex align-items-center gap-2">
          <FaMoneyBillWave className="text-success" size={22} /> Earnings
        </h1>
        <p className="page-subtitle mb-0">Revenue overview &amp; payment history</p>
      </div>
    </div>
    <Row className="g-4 mb-4">
      {earningsCards.map((item, idx) => <EarningsFastCard key={idx} {...item} />)}
    </Row>
      <Card className="bg-transparent border">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0 fw-semibold">Invoice History</h5>
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
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <FaAngleLeft />
                  </button>
                </li>

                {renderPaginationItems()}

                <li className={`page-item mb-0 ${currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>
                    <FaAngleRight />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </CardHeader>
      </Card>
  </>;
};
export default EarningsPage;
