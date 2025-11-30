import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, CardHeader, Col, Row, TabContainer } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';
import InstructorList from './InstructorList';
import { getAllInstructors, blockInstructor, unblockInstructor } from '@/helpers/data';

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

    const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return <Card className="bg-transparent">
    <TabContainer defaultActiveKey={1}>
      <CardHeader className="bg-transparent border-bottom px-0">
        <Row className="g-3 align-items-center justify-content-between">
          <Col md={8}>
            <form className="rounded position-relative" onSubmit={(e) => e.preventDefault()}>
              <input
                className="form-control bg-transparent"
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="submit">
                <FaSearch className="fs-6 " />
              </button>
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
      <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
        <p className="mb-0 text-center text-sm-start">
          Showing {totalInstructors === 0 ? 0 : (page - 1) * 5 + 1} to {Math.min(page * 5, totalInstructors)} of {totalInstructors} entries
        </p>

        <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
          <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
            <li className={`page-item mb-0 ${page === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                tabIndex={-1}
              >
                <FaAngleLeft />
              </button>
            </li>

            {getPageNumbers().map(pageNum => (
              <li key={pageNum} className={`page-item mb-0 ${pageNum === page ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            ))}

            <li className={`page-item mb-0 ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages || totalPages === 0}
              >
                <FaAngleRight />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </CardFooter>
  </Card>;
};
export default AllInstructors;
