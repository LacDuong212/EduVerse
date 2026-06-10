import { useState, useEffect, useMemo } from "react";
import { Card, CardBody, CardFooter, CardHeader, Col, Row, TabContainer } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
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

  const handleBlock = async (id) => {
    const response = await blockInstructor(id);
    if (response.success) {
      setAllInstructors(prev => prev.map(i => i._id === id ? { ...i, isActivated: false } : i));
    }
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
          onBlock={handleBlock}
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
  </Card>;
};
export default AllInstructors;
