import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { timeSince } from '@/utils/date';
import { Fragment, useState } from 'react';
import { Button, Col, FormControl, ProgressBar, Row } from 'react-bootstrap';
import {
  FaRegStar,
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaStar,
  FaStarHalfAlt
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import useCourseReviews from '../useCourseReviews';

const Reviews = () => {
  const { id: courseId } = useParams();

  const {
    allReviews,
    userReviews,
    isEnrolled,          // lấy flag từ hook
    stats,
    createReview,
    updateReview,
    deleteReview,
    actionLoading,
  } = useCourseReviews(courseId, { pageSize: 10 });

  const { averageRating, totalReviews, distribution } = stats || {};

  const displayRating = averageRating || 0;
  const starRows = [5, 4, 3, 2, 1];
  const total = totalReviews || 0;
  const progressByStar = starRows.map((star) => {
    if (!total) return 0;
    const count = distribution?.[star] || 0;
    return (count / total) * 100;
  });

  // ====== EDIT INLINE STATE ======
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editDescription, setEditDescription] = useState('');

  // set các review mà user là owner
  const userReviewIds = new Set(userReviews?.map((r) => r.id));

  // user đã từng review hay chưa
  const hasUserReview = (userReviews && userReviews.length > 0) || false;

  // chỉ cho phép tạo review nếu đã enroll & chưa từng review
  const canCreateReview = isEnrolled && !hasUserReview;

  // danh sách review hiển thị: luôn ghim review của user lên đầu
  const orderedReviews = [
    ...(userReviews || []),
    ...(allReviews || []).filter((r) => !userReviewIds.has(r.id)),
  ];

  const handleSubmitNew = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const ratingStr = formData.get('rating');
    const description = formData.get('description')?.trim();

    const rating = Number(ratingStr);

    if (!rating || rating < 1 || rating > 5) return;
    if (!description) return;

    await createReview({ rating, description });

    e.target.reset();
  };

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating || 0);
    setEditDescription(review.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditDescription('');
  };

  const saveEdit = async (reviewId) => {
    if (!editRating || editRating < 1 || editRating > 5) return;
    if (!editDescription.trim()) return;

    await updateReview(reviewId, {
      rating: editRating,
      description: editDescription.trim(),
    });
    cancelEdit();
  };

  const handleDelete = async (reviewId) => {
    await deleteReview(reviewId);
    if (editingId === reviewId) cancelEdit();
  };

  return (
    <>
      <Row className="mb-4">
        <h5 className="mb-4">Our Student Reviews</h5>
        <Col md={4} className="mb-3 mb-md-0">
          <div className="text-center">
            <h2 className="mb-0">{displayRating.toFixed(1)}</h2>
            <ul className="list-inline mb-0">
              {Array(Math.floor(displayRating))
                .fill(0)
                .map((_star, idx) => (
                  <li key={idx} className="list-inline-item me-1 small">
                    <FaStar size={16} className="text-warning" />
                  </li>
                ))}
              {!Number.isInteger(displayRating) && displayRating > 0 && (
                <li className="list-inline-item me-1 small">
                  <FaStarHalfAlt size={16} className="text-warning" />
                </li>
              )}
              {displayRating < 5 &&
                Array(5 - Math.ceil(displayRating))
                  .fill(0)
                  .map((_star, idx) => (
                    <li key={idx} className="list-inline-item me-1 small">
                      <FaRegStar size={16} className="text-warning" />
                    </li>
                  ))}
            </ul>
            <p className="mb-0">(Based on todays review)</p>
          </div>
        </Col>
        <Col md={8}>
          <Row className="align-items-center">
            {progressByStar.map((progress, idx) => (
              <Fragment key={idx}>
                <Col xs={6} sm={8}>
                  <ProgressBar
                    variant="warning"
                    className="progress-sm bg-opacity-15"
                    now={progress}
                  />
                </Col>
                <Col xs={6} sm={4}>
                  <ul className="list-inline mb-0">
                    {Array(Math.floor(5 - idx))
                      .fill(0)
                      .map((_star, sIdx) => (
                        <li
                          key={sIdx}
                          className="list-inline-item me-1 small"
                        >
                          <FaStar size={14} className="text-warning" />
                        </li>
                      ))}
                    {!Number.isInteger(5 - idx) && (
                      <li className="list-inline-item me-1 small">
                        <FaStarHalfAlt size={14} className="text-warning" />
                      </li>
                    )}
                    {5 - idx < 5 &&
                      Array(5 - Math.ceil(5 - idx))
                        .fill(0)
                        .map((_star, sIdx) => (
                          <li
                            key={sIdx}
                            className="list-inline-item me-1 small"
                          >
                            <FaRegStar size={14} className="text-warning" />
                          </li>
                        ))}
                  </ul>
                </Col>
              </Fragment>
            ))}
          </Row>
        </Col>
      </Row>

      {/* FORM TẠO REVIEW MỚI - chỉ hiện khi user đã enroll & chưa review */}
      {canCreateReview && (
        <div className="mt-2">
          <h5 className="mb-4">Leave a Review</h5>
          <form className="row g-3" onSubmit={handleSubmitNew}>
            {/* Rating */}
            <Col xs={12} className="bg-light-input">
              <ChoicesFormInput
                id="inputState2"
                className="form-select js-choice"
                name="rating"
              >
                <option value="5">★★★★★ (5/5)</option>
                <option value="4">★★★★☆ (4/5)</option>
                <option value="3">★★★☆☆ (3/5)</option>
                <option value="2">★★☆☆☆ (2/5)</option>
                <option value="1">★☆☆☆☆ (1/5)</option>
              </ChoicesFormInput>
            </Col>

            {/* Description */}
            <Col xs={12} className="bg-light-input">
              <textarea
                className="form-control"
                id="exampleFormControlTextarea1"
                placeholder="Your review"
                rows={3}
                name="description"
              />
            </Col>

            {/* Button */}
            <Col xs={12}>
              <Button
                variant="primary"
                type="submit"
                className="mb-0"
                disabled={actionLoading}
              >
                {actionLoading ? 'Posting...' : 'Post Review'}
              </Button>
            </Col>
          </form>
        </div>
      )}

      {/* Optional: thông báo cho guest / chưa enroll */}
      {!isEnrolled && (
        <p className="text-muted text-center mt-4">
          Only students who enrolled in this course can leave a review.
        </p>
      )}

      <Row>
        {orderedReviews?.map((review, idx) => {
          const isOwner = userReviewIds.has(review.id);
          const isEditing = editingId === review.id;

          return (
            <Fragment key={idx}>
              <div className="d-md-flex my-4">
                <div className="avatar avatar-md me-4 flex-shrink-0">
                  <img
                    className="avatar-img rounded-circle"
                    src={review.avatar}
                    alt="avatar"
                  />
                </div>
                <div style={{ width: '100%' }}>
                  <div className="d-sm-flex mt-1 mt-md-0 align-items-center justify-content-between">
                    <div className="d-sm-flex align-items-center">
                      <h5 className="me-3 mb-0">{review.name}</h5>
                      {!isEditing && review.rating && (
                        <ul className="list-inline mb-0">
                          {Array(Math.floor(review.rating))
                            .fill(0)
                            .map((_star, i2) => (
                              <li
                                key={i2}
                                className="list-inline-item me-1 small"
                              >
                                <FaStar
                                  size={14}
                                  className="text-warning"
                                />
                              </li>
                            ))}
                          {!Number.isInteger(review.rating) && (
                            <li className="list-inline-item me-1 small">
                              <FaStarHalfAlt
                                size={14}
                                className="text-warning"
                              />
                            </li>
                          )}
                          {review.rating < 5 &&
                            Array(5 - Math.ceil(review.rating))
                              .fill(0)
                              .map((_star, i3) => (
                                <li
                                  key={i3}
                                  className="list-inline-item me-1 small"
                                >
                                  <FaRegStar
                                    size={14}
                                    className="text-warning"
                                  />
                                </li>
                              ))}
                        </ul>
                      )}
                    </div>

                    {/* nút Edit/Delete chỉ hiện với review của user */}
                    {isOwner && !isEditing && (
                      <div className="mt-2 mt-sm-0">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => startEdit(review)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(review.id)}
                          disabled={actionLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="small mb-2">{timeSince(review.time)}</p>

                  {/* nếu đang edit: hiện form inline */}
                  {isEditing ? (
                    <div className="mb-2">
                      <div className="mb-2">
                        <select
                          className="form-select form-select-sm w-auto d-inline-block me-2"
                          value={editRating}
                          onChange={(e) =>
                            setEditRating(Number(e.target.value))
                          }
                        >
                          <option value="5">★★★★★ (5/5)</option>
                          <option value="4">★★★★☆ (4/5)</option>
                          <option value="3">★★★☆☆ (3/5)</option>
                          <option value="2">★★☆☆☆ (2/5)</option>
                          <option value="1">★☆☆☆☆ (1/5)</option>
                        </select>
                      </div>
                      <textarea
                        className="form-control mb-2"
                        rows={3}
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                      />
                      <div>
                        <Button
                          size="sm"
                          variant="primary"
                          className="me-2"
                          onClick={() => saveEdit(review.id)}
                          disabled={actionLoading}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={cancelEdit}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : 
                  
                  (
                    <>
                      <p className="mb-2">{review.description}</p>
                      {/* <p className="mb-2">{review.description}</p>
                      <div
                        className="btn-group"
                        role="group"
                        aria-label="Basic radio toggle button group"
                      >
                        <input
                          type="radio"
                          className="btn-check"
                          name={`btnradi${idx}`}
                          id={`btnradio${idx}`}
                        />
                        <label
                          className="btn btn-outline-light btn-sm mb-0"
                          htmlFor={`btnradio${idx}`}
                        >
                          <FaRegThumbsUp className="me-1" />
                          25
                        </label>
                        <input
                          type="radio"
                          className="btn-check"
                          name={`btnradi${idx}`}
                          id={`btnradio${idx + 2}`}
                        />
                        <label
                          className="btn btn-outline-light btn-sm mb-0"
                          htmlFor={`btnradio${idx + 2}`}
                        >
                          <FaRegThumbsDown className="me-1" />
                          2
                        </label> */}
                      {/* </div> */}
                    </>
                  )}
                </div>
              </div>
              {/* reply nếu sau này bạn thêm */}
              {review.reply &&
                review.reply.map((reply, rIdx) => (
                  <div
                    className="d-md-flex mb-4 ps-4 ps-md-5"
                    key={rIdx}
                  >
                    <div className="avatar avatar-lg me-4 flex-shrink-0">
                      <img
                        className="avatar-img rounded-circle"
                        src={reply.avatar}
                        alt="avatar"
                      />
                    </div>
                    <div>
                      <div className="d-sm-flex mt-1 mt-md-0 align-items-center">
                        <h5 className="me-3 mb-0">{reply.name}</h5>
                      </div>
                      <p className="small mb-2">
                        {timeSince(reply.time)}
                      </p>
                      <p className="mb-2">{reply.description}</p>
                    </div>
                  </div>
                ))}
              <hr />
            </Fragment>
          );
        })}
      </Row>
    </>
  );
};

export default Reviews;
