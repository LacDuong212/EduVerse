import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { FaCaretLeft, FaCaretRight, FaHeartBroken, FaArrowRight } from "react-icons/fa";
import CourseCard from '@/components/CourseCard';
import useWishlist from '../useWishlist';
import { useNavigate } from 'react-router-dom';

const WishlistCard = () => {
  const navigate = useNavigate();

  const {
    currentItems,
    currentPage,
    totalItems,
    totalPages,
    status,
    handlePageChange,
  } = useWishlist();

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
                  <Col sm={6} lg={4} xl={3} key={item.courseId}>
                    <CourseCard course={item} />
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
            <div
              className="text-center py-5 px-4 shadow-sm border-0 rounded-4"
            >
              <div
                className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
                style={{
                  width: "82px",
                  height: "82px",
                }}
              >
                <FaHeartBroken size={34} />
              </div>

              <h4 className="mb-2 fw-bold">Your wishlist is empty!</h4>

              <p className="text-muted mb-4">
                Browse courses and save your favorites here for quick access later.
              </p>

              <Button
                variant="primary"
                type="button"
                onClick={() => navigate("/courses")}
                className="px-4 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
              >
                Explore Courses
                <FaArrowRight size={14} />
              </Button>
            </div>
          </Col>
        )}
      </Container>
    </section>
  );
};
export default WishlistCard;
