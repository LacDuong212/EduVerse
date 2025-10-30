import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { getAllUserReviews } from '@/helpers/data';
import { useFetchData } from '@/hooks/useFetchData';
import { timeSince } from '@/utils/date';
import { Fragment } from 'react';
import { Button, Col, FormControl, ProgressBar, Row } from 'react-bootstrap';
import { FaRegStar, FaRegThumbsDown, FaRegThumbsUp, FaStar, FaStarHalfAlt } from 'react-icons/fa';
const Reviews = () => {
  const allReviews = useFetchData(getAllUserReviews);
  return <>
      <Row className="mb-4">
        <h5 className="mb-4">Our Student Reviews</h5>
        <Col md={4} className="mb-3 mb-md-0">
          <div className="text-center">
            <h2 className="mb-0">4.5</h2>
            <ul className="list-inline mb-0">
              {Array(Math.floor(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                    <FaStar size={16} className="text-warning" />
                  </li>)}
              {!Number.isInteger(4.5) && <li className="list-inline-item me-1 small">

                  <FaStarHalfAlt size={16} className="text-warning" />
                </li>}
              {4.5 < 5 && Array(5 - Math.ceil(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                      <FaRegStar size={16} className="text-warning" />
                    </li>)}
            </ul>
            <p className="mb-0">(Based on todays review)</p>
          </div>
        </Col>
        <Col md={8}>
          <Row className="align-items-center">
            {[100, 80, 60, 40, 20].map((progress, idx) => <Fragment key={idx}>
                <Col xs={6} sm={8}>
                  <ProgressBar variant="warning" className="progress-sm bg-opacity-15" now={progress} />
                </Col>
                <Col xs={6} sm={4}>
                  <ul className="list-inline mb-0">
                    {Array(Math.floor(5 - idx)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                          <FaStar size={14} className="text-warning" />
                        </li>)}
                    {!Number.isInteger(5 - idx) && <li className="list-inline-item me-1 small">

                        <FaStarHalfAlt size={14} className="text-warning" />
                      </li>}
                    {5 - idx < 5 && Array(5 - Math.ceil(5 - idx)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                            <FaRegStar size={14} className="text-warning" />
                          </li>)}
                  </ul>
                </Col>
              </Fragment>)}
          </Row>
        </Col>
      </Row>
      <Row>
        {allReviews?.map((review, idx) => <Fragment key={idx}>
            <div className="d-md-flex my-4">
              <div className="avatar avatar-xl me-4 flex-shrink-0">
                <img className="avatar-img rounded-circle" src={review.avatar} alt="avatar" />
              </div>
              <div>
                <div className="d-sm-flex mt-1 mt-md-0 align-items-center">
                  <h5 className="me-3 mb-0">{review.name}</h5>
                  {review.rating && <ul className="list-inline mb-0">
                      {Array(Math.floor(review.rating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                            <FaStar size={14} className="text-warning" />
                          </li>)}
                      {!Number.isInteger(review.rating) && <li className="list-inline-item me-1 small">

                          <FaStarHalfAlt size={14} className="text-warning" />
                        </li>}
                      {review.rating < 5 && Array(5 - Math.ceil(review.rating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                              <FaRegStar size={14} className="text-warning" />
                            </li>)}
                    </ul>}
                </div>
                <p className="small mb-2">{timeSince(review.time)}</p>
                <p className="mb-2">{review.description}</p>
                <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                  <input type="radio" className="btn-check" name={`btnradi${idx}`} id={`btnradio${idx}`} />
                  <label className="btn btn-outline-light btn-sm mb-0" htmlFor={`btnradio${idx}`}>
                    <FaRegThumbsUp className="me-1" />
                    25
                  </label>
                  <input type="radio" className="btn-check" name={`btnradi${idx}`} id={`btnradio${idx + 2}`} />
                  <label className="btn btn-outline-light btn-sm mb-0" htmlFor={`btnradio${idx + 2}`}>

                    <FaRegThumbsDown className="me-1" />2
                  </label>
                </div>
              </div>
            </div>
            {review.reply && review.reply.map((reply, idx) => <div className="d-md-flex mb-4 ps-4 ps-md-5" key={idx}>
                  <div className="avatar avatar-lg me-4 flex-shrink-0">
                    <img className="avatar-img rounded-circle" src={reply.avatar} alt="avatar" />
                  </div>
                  <div>
                    <div className="d-sm-flex mt-1 mt-md-0 align-items-center">
                      <h5 className="me-3 mb-0">{reply.name}</h5>
                    </div>
                    <p className="small mb-2">{timeSince(reply.time)}</p>
                    <p className="mb-2">{reply.description}</p>
                  </div>
                </div>)}
            <hr />
          </Fragment>)}
      </Row>
      <div className="mt-2">
        <h5 className="mb-4">Leave a Review</h5>
        <form className="row g-3">
          <Col md={6} className="bg-light-input">
            <input type="text" className="form-control" id="inputtext" placeholder="Name" aria-label="First name" />
          </Col>
          <Col md={6} className="bg-light-input">
            <FormControl type="email" placeholder="Email" id="inputEmail4" />
          </Col>
          <Col xs={12} className="bg-light-input">
            <ChoicesFormInput id="inputState2" className="form-select js-choice">
              <option>★★★★★ (5/5)</option>
              <option>★★★★☆ (4/5)</option>
              <option>★★★☆☆ (3/5)</option>
              <option>★★☆☆☆ (2/5)</option>
              <option>★☆☆☆☆ (1/5)</option>
            </ChoicesFormInput>
          </Col>
          <Col xs={12} className=" bg-light-input">
            <textarea className="form-control" id="exampleFormControlTextarea1" placeholder="Your review" rows={3} defaultValue={''} />
          </Col>
          <Col xs={12}>
            <Button variant="primary" type="submit" className="mb-0">
              Post Review
            </Button>
          </Col>
        </form>
      </div>
    </>;
};
export default Reviews;
