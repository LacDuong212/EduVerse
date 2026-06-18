import { Col, ProgressBar, Row, Button } from "react-bootstrap";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { DEFAULT_AVATAR_IMG } from "@/context/constants";
import useCourseReviews from "./useCourseReviews";

const StarRating = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  return (
    <div className="text-warning">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={size} />
      ))}

      {hasHalf && <FaStarHalfAlt size={size} />}

      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <FaRegStar key={`empty-${i}`} size={size} />
      ))}
    </div>
  );
};

const Reviews = ({ rating = {} }) => {
  const {
    reviews,
    pagination,
    page,
    loading,
    error,
    limit,
    setLimit,
    handlePageChange,
  } = useCourseReviews(5);

  const totalCount = rating.count || 0;
  const averageRating = totalCount > 0 ? rating.total / totalCount : 0;
  const distribution = rating.stars || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const starRows = [5, 4, 3, 2, 1];

  const { totalPages } = pagination;
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  const getPageNumbers = () => {
    const items = [];
    const maxVisible = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    return items;
  };

  return (
    <>
      <Row className="mb-4 align-items-center">
        <Col>
          <h5 className="mb-0">Student Reviews</h5>
        </Col>

        <Col xs="auto">
          <div className="d-flex align-items-center">
            <span className="me-2 small text-nowrap">Show:</span>

            <select
              className="form-select form-select-sm"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[5, 10, 25, 50].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="text-center">
          <h2 className="mb-0">{averageRating.toFixed(1)}</h2>
          <StarRating rating={averageRating} />
          <p className="mb-0 small">({totalCount} reviews)</p>
        </Col>

        <Col md={8}>
          {starRows.map((star) => {
            const count = distribution[star] || 0;
            const percent = totalCount > 0 ? (count / totalCount) * 100 : 0;

            return (
              <Row key={star} className="align-items-center g-2 mb-1">
                <Col xs={2} className="small">
                  {star} star
                </Col>

                <Col xs={8}>
                  <ProgressBar
                    variant="warning"
                    now={percent}
                    className="progress-sm"
                  />
                </Col>

                <Col xs={2} className="small text-end">
                  {percent.toFixed(0)}%
                </Col>
              </Row>
            );
          })}
        </Col>
      </Row>

      {loading && (
        <p className="text-center text-muted my-4">Loading reviews...</p>
      )}

      {error && (
        <p className="text-center text-danger my-4">{error}</p>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-center text-muted my-4">
          No reviews yet.
        </p>
      )}

      <div className="review-list">
        {reviews.map((review) => (
          <div
            key={review.reviewId}
            className="d-flex mb-4 border-bottom pb-3"
          >
            {review?.userAvatar ? (
              <img
                src={review.userAvatar}
                className="avatar avatar-sm rounded-circle me-3 border border-light border-1"
                alt="avatar"
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR_IMG;
                }}
              />
            ) : (
              <div className="avatar-img avatar-sm rounded-circle me-3 border border-light border-1 d-flex align-items-center justify-content-center fw-bold fs-4">
                {(review?.userName?.[0] || "S").toUpperCase()}
              </div>
            )}

            <div className="flex-grow-1">
              <div className="d-flex justify-content-between">
                <h6 className="mb-0">{review.userName}</h6>
              </div>

              <StarRating rating={review.rating} size={12} />

              <p className="text-muted small mb-1">
                {review.updatedAt
                  ? new Date(review.updatedAt).toLocaleDateString()
                  : ""}
              </p>

              <p className="mb-0">{review.description}</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={!hasPrevPage || loading}
            onClick={() => handlePageChange(page - 1)}
          >
            Prev
          </Button>

          {getPageNumbers().map((pageNumber) => (
            <Button
              key={pageNumber}
              size="sm"
              variant={pageNumber === page ? "primary" : "outline-secondary"}
              disabled={loading}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            size="sm"
            variant="outline-secondary"
            disabled={!hasNextPage || loading}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
};

export default Reviews;