import { useState, useEffect, useMemo } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, Modal, Row, TabContainer } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import InstructorList from './InstructorList';
import PaginationBar from '@/components/PaginationBar';
import { getAllInstructors, blockInstructor, unblockInstructor } from '@/helpers/data';
import useSortableData from '@/hooks/useSortableData';

const AllInstructors = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [allInstructors, setAllInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockError, setBlockError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchInstructors = async () => {
      setIsLoading(true);
      const response = await getAllInstructors(1, debouncedSearch, 9999);
      if (response) {
        setAllInstructors(response.data);
      }
      setIsLoading(false);
    };
    fetchInstructors();
  }, [debouncedSearch]);

  const { sortedData, sortKey, sortDir, requestSort } = useSortableData(allInstructors, 'updatedAt', 'desc');

  const paginatedData = useMemo(
    () => sortedData.slice((page - 1) * pageSize, page * pageSize),
    [sortedData, page, pageSize]
  );
  const totalPages = Math.ceil(allInstructors.length / pageSize);

  const handlePageSizeChange = (size) => { setPageSize(size); setPage(1); };

  const handleBlockClick = (id) => { setBlockTarget(id); setBlockReason(''); setBlockError(''); };

  const confirmBlock = async () => {
    if (!blockReason.trim()) { setBlockError('Reason is required.'); return; }
    const response = await blockInstructor(blockTarget, blockReason.trim());
    if (response.success) {
      setAllInstructors(prev => prev.map(i => i._id === blockTarget ? { ...i, isActivated: false } : i));
      toast.success("Instructor blocked.");
    } else {
      toast.error(response.message || "Failed to block instructor.");
    }
    setBlockTarget(null);
  };

  const handleUnblock = async (id) => {
    const response = await unblockInstructor(id);
    if (response.success) {
      setAllInstructors(prev => prev.map(i => i._id === id ? { ...i, isActivated: true } : i));
    }
  };

  return <Card className="bg-transparent">
    <TabContainer defaultActiveKey={1}>
      <CardHeader className="bg-transparent border-bottom px-0">
        <Row className="g-3 align-items-center justify-content-between">
          <Col md={8}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <input
                  className="form-control"
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
        </Row>
      </CardHeader>

      <CardBody className="px-0">
        <InstructorList
          instructorsData={paginatedData}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={requestSort}
          onBlock={handleBlockClick}
          onUnblock={handleUnblock}
        />
      </CardBody>

    </TabContainer>
    <CardFooter className="bg-transparent pt-0 px-0">
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={allInstructors.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </CardFooter>

    <Modal show={!!blockTarget} onHide={() => setBlockTarget(null)} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Block Instructor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-body-secondary small mb-3">The instructor will be notified and lose access to their dashboard.</p>
        <Form.Group>
          <Form.Label className="fw-semibold small">Reason <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Explain why this instructor is being blocked..."
            value={blockReason}
            onChange={(e) => { setBlockReason(e.target.value); if (e.target.value.trim()) setBlockError(''); }}
            isInvalid={!!blockError}
          />
          <Form.Control.Feedback type="invalid">{blockError}</Form.Control.Feedback>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={() => setBlockTarget(null)}>Cancel</Button>
        <Button variant="danger" size="sm" onClick={confirmBlock}>Block</Button>
      </Modal.Footer>
    </Modal>
  </Card>;
};
export default AllInstructors;
