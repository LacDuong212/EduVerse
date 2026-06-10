import { useState, useEffect } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Modal, Row, TabContainer } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import StudentList from './StudentList';
import PaginationBar from '@/components/PaginationBar';
import { getAllStudents, blockStudent, unblockStudent, deleteStudent } from '@/helpers/data';

const PAGE_SIZE = 5;

const AllStudents = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [studentsData, setStudentsData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (page !== 1) {
        setPage(1);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      const response = await getAllStudents(page, debouncedSearch);
      if (response) {
        setStudentsData(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalStudents(response.pagination.total);
      }
      setIsLoading(false);
    };
    fetchStudents();
  }, [page, debouncedSearch]);

  const handleBlock = async (id) => {
    const response = await blockStudent(id);
    if (response.success) {
      setStudentsData(prevData =>
        prevData.map(student =>
          student._id === id ? { ...student, isActivated: false } : student
        )
      );
    } else {
      console.error("Failed to block student");
    }
  };

  const handleUnblock = async (id) => {
    const response = await unblockStudent(id);
    if (response.success) {
      setStudentsData(prevData =>
        prevData.map(student =>
          student._id === id ? { ...student, isActivated: true } : student
        )
      );
    } else {
      console.error("Failed to unblock student");
    }
  };

  const handleDeleteClick = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const response = await deleteStudent(deleteTarget);
    if (response.success) {
      setStudentsData(prevData => prevData.filter(s => s._id !== deleteTarget));
      setTotalStudents(prev => prev - 1);
    } else {
      console.error("Failed to delete student");
    }
    setDeleteTarget(null);
  };

  return <>
    <Card className="bg-transparent">
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
          <StudentList
            studentsData={studentsData}
            isLoading={isLoading}
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
          totalItems={totalStudents}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
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
