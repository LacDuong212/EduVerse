import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, CardHeader, Col, Row, TabContainer } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import InstructorList from './InstructorList';
import PaginationBar from '@/components/PaginationBar';
import { getAllInstructors, blockInstructor, unblockInstructor } from '@/helpers/data';

const PAGE_SIZE = 5;

const AllInstructors = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [instructorsData, setInstructorsData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchInstructors = async () => {
      setIsLoading(true);
      const response = await getAllInstructors(page, debouncedSearch);
      if (response) {
        setInstructorsData(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalInstructors(response.pagination.total);
      }
      setIsLoading(false);
    };
    fetchInstructors();
  }, [page, debouncedSearch]);

  const handleBlock = async (id) => {
    const response = await blockInstructor(id);
    if (response.success) {
      setInstructorsData(prevData =>
        prevData.map(instructor =>
          instructor._id === id ? { ...instructor, isActivated: false } : instructor
        )
      );
    } else {
      console.error("Failed to block instructor");
    }
  };

  const handleUnblock = async (id) => {
    const response = await unblockInstructor(id);
    if (response.success) {
      setInstructorsData(prevData =>
        prevData.map(instructor =>
          instructor._id === id ? { ...instructor, isActivated: true } : instructor
        )
      );
    } else {
      console.error("Failed to unblock instructor");
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
          instructorsData={instructorsData}
          isLoading={isLoading}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
        />
      </CardBody>

    </TabContainer>
    <CardFooter className="bg-transparent pt-0 px-0">
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={totalInstructors}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </CardFooter>
  </Card>;
};
export default AllInstructors;
