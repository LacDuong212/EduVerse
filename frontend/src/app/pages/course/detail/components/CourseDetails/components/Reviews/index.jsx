import { useState } from "react";
import { Button, Col, ProgressBar, Row } from "react-bootstrap";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import useCourseReviews from "./useCourseReviews";

const StarRating = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  return (
    <div className="text-warning">
      {[...Array(fullStars)].map((_, i) => <FaStar key={i} size={size} />)}
      {hasHalf && <FaStarHalfAlt size={size} />}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => <FaRegStar key={i} size={size} />)}
    </div>
  );
};

const Reviews = ({ rating = {}, isEnrolled }) => {
  const {
    reviews,
    myReview,
    pagination,
    page,
    loading,
    submitting,
    limit,
    setLimit,
    submitReview,
    editReview,
    deleteReview,
    handlePageChange,
  } = useCourseReviews(5);

  const totalCount = rating.count || 0;
  const averageRating = totalCount > 0 ? rating.total / totalCount : 0;
  const distribution = rating.stars || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const starRows = [5, 4, 3, 2, 1];

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editDescription, setEditDescription] = useState("");

  const orderedReviews = myReview ? [myReview, ...reviews] : reviews;

  const canCreateReview = isEnrolled && !myReview;

  const startEdit = (review) => {
    setEditingId(review.reviewId);
    setEditRating(review.rating);
    setEditDescription(review.description);
  };

  const handleSaveEdit = async (id) => {
    await editReview(id, { rating: editRating, description: editDescription });
    setEditingId(null);
  };

  const { totalPages, hasNextPage } = pagination;
  const hasPrevPage = page > 1;

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
        <Col><h5 className="mb-0">Student Reviews</h5></Col>
        <Col xs="auto">
          <div className="d-flex align-items-center">
            <span className="me-2 small text-nowrap">Show:</span>
            <select
              className="form-select form-select-sm"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[5, 10, 25, 50].map(l => <option key={l} value={l}>{l}</option>)}
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
                <Col xs={2} className="small">{star} star</Col>
                <Col xs={8}>
                  <ProgressBar variant="warning" now={percent} className="progress-sm" />
                </Col>
                <Col xs={2} className="small text-end">{percent.toFixed(0)}%</Col>
              </Row>
            );
          })}
        </Col>
      </Row>

      {canCreateReview && (
        <div className="card card-body shadow-none border mb-4">
          <h6>Leave a Review</h6>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            submitReview({ rating: Number(fd.get('rating')), description: fd.get('description') });
            e.target.reset();
          }}>
            <select name="rating" className="form-select mb-2">
              {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} Stars</option>)}
            </select>
            <textarea name="description" className="form-control mb-2" rows={3} placeholder="Your thoughts..." required />
            <Button type="submit" disabled={submitting}>Post Review</Button>
          </form>
        </div>
      )}

      {!isEnrolled && (
        <p className="text-center mt-4 mb-0">
          Only students who enrolled in this course can leave a review.
        </p>
      )}

      <div className="review-list">
        {orderedReviews.map((review) => {
          const isMyReview = myReview?.reviewId === review.reviewId;
          const isEditing = editingId === review.reviewId;

          return (
            <div key={review.reviewId} className="d-flex mb-4 border-bottom pb-3">
              <img src={review.userAvatar || '/default-avatar.png'} className="avatar avatar-md rounded-circle me-3" alt="" />
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <h6 className="mb-0">
                    {review.userName} {isMyReview && <Badge bg="info" className="ms-2">You</Badge>}
                  </h6>
                  {isMyReview && !isEditing && (
                    <div>
                      <Button size="sm" variant="link" onClick={() => startEdit(review)}>Edit</Button>
                      <Button size="sm" variant="link" className="text-danger" onClick={() => deleteReview(review.reviewId)}>Delete</Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-2">
                    <select className="form-select form-select-sm mb-2" value={editRating} onChange={e => setEditRating(Number(e.target.value))}>
                      {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} Stars</option>)}
                    </select>
                    <textarea className="form-control mb-2" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                    <Button size="sm" onClick={() => handleSaveEdit(review.reviewId)}>Save</Button>
                    <Button size="sm" variant="link" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <StarRating rating={review.rating} size={12} />
                    <p className="text-muted small mb-1">{new Date(review.updatedAt).toLocaleDateString()}</p>
                    <p className="mb-0">{review.description}</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>


    </>
  );
};

export default Reviews;