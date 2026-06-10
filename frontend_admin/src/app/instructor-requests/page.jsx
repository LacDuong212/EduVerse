import { useState, useEffect } from "react";
import PageMetaData from '@/components/PageMetaData';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Modal, Row, Table } from 'react-bootstrap';
import { FaSearch, FaTimes, FaUserTie } from 'react-icons/fa';
import PaginationBar from '@/components/PaginationBar';

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
              {item.name}
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

const PAGE_SIZE = 5;

const InstructorRequests = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [requestsData, setRequestsData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);

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
        toast.success("Request approved successfully.");
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleRejectClick = (id) => setRejectTarget(id);

  const confirmReject = async () => {
    if (!rejectTarget) return;
    try {
      const response = await rejectInstructorRequest(rejectTarget);
      if (response && response.success) {
        setRequestsData(prev => prev.filter(item => item._id !== rejectTarget));
        setTotalRequests(prev => prev - 1);
        toast.success("Request rejected.");
      }
    } catch (error) {
      console.error("Failed to reject:", error);
    }
    setRejectTarget(null);
  };

  return (
    <>
      <PageMetaData title="Instructor Request" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaUserTie className="text-primary" size={22} /> Instructor Requests
          </h1>
          <p className="page-subtitle mb-0">Review and manage instructor applications</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <Row className="g-3 align-items-center justify-content-between">
            <Col md={8}>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="input-group">
                  <input
                    className="form-control bg-body"
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button type="button" className="btn btn-outline-secondary border-0" onClick={() => setSearch('')} aria-label="Clear search">
                      <FaTimes className="small" />
                    </button>
                  )}
                  <button type="submit" className="btn btn-outline-secondary border-0">
                    <FaSearch />
                  </button>
                </div>
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
                      onReject={handleRejectClick}
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
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalItems={totalRequests}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </CardFooter>
      </Card>

      <Modal show={!!rejectTarget} onHide={() => setRejectTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to reject and delete this request? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmReject}>Reject</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default InstructorRequests;
