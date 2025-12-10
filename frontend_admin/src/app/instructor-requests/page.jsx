import { useState, useEffect } from "react";
import PageMetaData from '@/components/PageMetaData';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row, Table } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';

import { getInstructorRequests, approveInstructorRequest, rejectInstructorRequest } from '@/helpers/data';
import { toast } from 'react-toastify';


const InstructorRequestRow = ({ item, onAccept, onReject }) => {
  const renderActionButtons = () => {
    if (item.status === 'approved') {
      return (
        <Button variant="success" className="me-1 mb-1 mb-md-0 disabled" size="sm">
          Accepted
        </Button>
      );
    } else if (item.status === 'rejected') {
      return (
        <Button variant="secondary" className="me-1 mb-1 mb-md-0 disabled" size="sm">
          Rejected
        </Button>
      );
    } else {
      return (
        <>
          <Button
            variant="success-soft"
            className="me-1 mb-1 mb-lg-0"
            size="sm"
            onClick={() => onAccept(item._id)}
          >
            Accept
          </Button>
          <Button
            variant="secondary-soft"
            className="me-1 mb-1 mb-lg-0"
            size="sm"
            onClick={() => onReject(item._id)}
          >
            Reject
          </Button>
        </>
      );
    }
  };

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center position-relative">
          <div className="avatar avatar-md">
            {item?.pfpImg ? (
              <img src={item.pfpImg} className="rounded-circle" alt="avatar" />
            ) : (
              <div className="avatar-img rounded-circle border-white border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-4">
                {(item?.name?.[0] || "U").toUpperCase()}
              </div>
            )}
          </div>
          <div className="mb-0 ms-2">
            <h6 className="mb-0">
              <a href="#" className="stretched-link">
                {item.name}
              </a>
            </h6>
          </div>
        </div>
      </td>
      <td className="text-center text-sm-start">
        <h6 className="mb-0 fw-normal">{item.email}</h6>
      </td>
      <td>
        {new Date(item.createdAt).toLocaleString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </td>
      <td>
        {renderActionButtons()}
      </td>
    </tr>
  );
};

const InstructorRequests = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [requestsData, setRequestsData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (page !== 1) setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const response = await getInstructorRequests(page, debouncedSearch);
        if (response && response.success) {
          const mappedData = response.data.map(req => ({ ...req, status: 'pending' }));
          setRequestsData(mappedData);
          setTotalPages(response.pagination.totalPages);
          setTotalRequests(response.pagination.total);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
      setIsLoading(false);
    };
    fetchRequests();
  }, [page, debouncedSearch]);

  const handleAccept = async (id) => {
    try {
      const response = await approveInstructorRequest(id);
      if (response && response.success) {
        setRequestsData(prev => prev.map(item =>
          item._id === id ? { ...item, status: 'approved' } : item
        ));
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this request?")) return;

    try {
      const response = await rejectInstructorRequest(id);
      if (response && response.success) {
        setRequestsData(prev => prev.filter(item => item._id !== id));
        setTotalRequests(prev => prev - 1);
      }
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };
  return (
    <>
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
              <form className="rounded position-relative" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="form-control bg-body"
                  type="text"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
                  <th scope="col" className="border-0 rounded-start">Instructor Name</th>
                  <th scope="col" className="border-0">Email</th>
                  <th scope="col" className="border-0">Requested Date</th>
                  <th scope="col" className="border-0 rounded-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">Loading...</td>
                  </tr>
                ) : requestsData && requestsData.length > 0 ? (
                  requestsData.map((item) => (
                    <InstructorRequestRow
                      key={item._id}
                      item={item}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">No pending requests found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>

        <CardFooter className="bg-transparent pt-0">
          <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
            <p className="mb-0 text-center text-sm-start">
              Showing {totalRequests === 0 ? 0 : (page - 1) * 5 + 1} to {Math.min(page * 5, totalRequests)} of {totalRequests} entries
            </p>
            <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
              <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                <li className={`page-item mb-0 ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    <FaAngleLeft />
                  </button>
                </li>

                {getPageNumbers().map(pageNum => (
                  <li key={pageNum} className={`page-item mb-0 ${pageNum === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(pageNum)}>
                      {pageNum}
                    </button>
                  </li>
                ))}

                <li className={`page-item mb-0 ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)} disabled={page === totalPages || totalPages === 0}>
                    <FaAngleRight />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};
export default InstructorRequests;
