import { useState, useEffect, useMemo } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Modal, Row, TabContainer } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import StudentList from './StudentList';
import PaginationBar from '@/components/PaginationBar';
import { getAllStudents, blockStudent, unblockStudent, deleteStudent } from '@/helpers/data';
import useSortableData from '@/hooks/useSortableData';

const AllStudents = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [allStudents, setAllStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      const response = await getAllStudents(1, debouncedSearch, 9999);
      if (response) {
        setAllStudents(response.data);
      }
      setIsLoading(false);
    };
    fetchStudents();
  }, [debouncedSearch]);

  const { sortedData, sortKey, sortDir, requestSort } = useSortableData(allStudents, 'updatedAt', 'desc');

  const paginatedData = useMemo(
    () => sortedData.slice((page - 1) * pageSize, page * pageSize),
    [sortedData, page, pageSize]
  );
  const totalPages = Math.ceil(allStudents.length / pageSize);

  const handlePageSizeChange = (size) => { setPageSize(size); setPage(1); };

  const handleBlock = async (id) => {
    const response = await blockStudent(id);
    if (response.success) {
      setAllStudents(prev => prev.map(s => s._id === id ? { ...s, isActivated: false } : s));
    }
  };

  const handleUnblock = async (id) => {
    const response = await unblockStudent(id);
    if (response.success) {
      setAllStudents(prev => prev.map(s => s._id === id ? { ...s, isActivated: true } : s));
    }
  };

  const handleDeleteClick = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const response = await deleteStudent(deleteTarget);
    if (response.success) {
      setAllStudents(prev => prev.filter(s => s._id !== deleteTarget));
    }
    setDeleteTarget(null);
  };

  return <>
    <Card className="bg-transparent">
      <TabContainer defaultActiveKey={1}>
        <CardHeader className="bg-transparent border-bottom px-0">
          <Row className="g-3 align-items-center justify-content-between">
            <Col md={12}>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="input-group">
                  <input
                    className="form-control bg-light"
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button type="button" className="btn btn-outline-secondary mb-0" onClick={() => setSearch('')} aria-label="Clear search">
                      <FaTimes className="small" />
                    </button>
                  )}
                  <button type="submit" className="btn btn-outline-secondary mb-0">
                    <FaSearch />
                  </button>
                </div>
              </form>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="px-0">
          <StudentList
            studentsData={paginatedData}
            isLoading={isLoading}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={requestSort}
            onBlock={handleBlock}
            onUnblock={handleUnblock}
            onDelete={handleDeleteClick}
          />
        </CardBody>

      </TabContainer>
      <CardFooter className="bg-transparent pt-0 px-0">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalItems={allStudents.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </CardFooter>
    </Card>

    <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this student? This action cannot be undone.</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
      </Modal.Footer>
    </Modal>
  </>;
};
export default AllStudents;
