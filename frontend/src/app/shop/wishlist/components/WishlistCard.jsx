import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux';
import CourseCard from '@/components/CourseCard';

const ITEMS_PER_PAGE = 12;

const WishlistCard = () => {
  const { items, status } = useSelector((state) => state.wishlist);

  const [currentPage, setCurrentPage] = useState(1);

  const validItems = Array.isArray(items)
    ? items.filter(item => item.courseId && typeof item.courseId === 'object')
    : [];

  const totalItems = validItems?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, totalPages, currentPage]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = validItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === 'loading' && totalItems === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <section className="pt-5 pb-5">
      <Container>
        <div className="d-sm-flex justify-content-sm-between align-items-center mb-4">
          <h5 className="mb-2 mb-sm-0">
            You have {totalItems} item{totalItems !== 1 && 's'} in wishlist
          </h5>
        </div>

        {totalItems > 0 ? (
          <>
            <Row className="g-4 mb-5">
              {currentItems.map((item) => {
                return (
                  <Col sm={6} lg={4} xl={3} key={item._id}>
                    <CourseCard course={item.courseId} />
                  </Col>
                );
              })}
            </Row>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav aria-label="navigation">
                  <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">

                    <li className={`page-item mb-0 ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <FaCaretLeft />
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <li
                        key={p}
                        className={`page-item mb-0 ${currentPage === p ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => handlePageChange(p)}>
                          {p}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item mb-0 ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <FaCaretRight />
                      </button>
                    </li>

                  </ul>
                </nav>
              </div>
            )}
          </>
        ) : (
          <Col xs={12}>
            <Alert variant="black" className="text-center py-5 shadow-sm border-0">
              <div className="mb-3">
                <i className="bi bi-heart-break fs-1"></i>
              </div>
              <h4>Your wishlist is empty!</h4>
              <p>Browse courses and add your favorites here.</p>
            </Alert>
          </Col>
        )}
      </Container>
    </section>
  );
};
export default WishlistCard;
