import { timeSince } from '@/utils/date';
import clsx from 'clsx';
import { Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { commentData } from '../data';
import avatar9 from '@/assets/images/avatar/09.jpg';
const Comment = () => {
  return <Row>
      <Col xs={12}>
        <h5 className="mb-4">Ask Your Question</h5>
        <div className="d-flex mb-4">
          <div className="avatar avatar-sm flex-shrink-0 me-2">
            <span role="button">

              <img className="avatar-img rounded-circle" src={avatar9} alt="avatar" />
            </span>
          </div>
          <form className="w-100 d-flex">
            <textarea className="one form-control pe-4 bg-light" id="autoheighttextarea" rows={1} placeholder="Add a comment..." defaultValue={''} />
            <Button variant="primary" className="ms-2 mb-0" type="button">
              Post
            </Button>
          </form>
        </div>
        {commentData.map((comment, idx) => <div className={clsx('border p-2 p-sm-4 rounded-3', {
        'mb-4': commentData.length - 1 != idx
      })} key={idx}>
            <ul className="list-unstyled mb-0">
              <li className="comment-item">
                <div className={clsx('d-flex', {
              'mb-3': comment.reply
            })}>
                  <div className="avatar avatar-sm flex-shrink-0">
                    <span role="button">
                      <img className="avatar-img rounded-circle" src={comment.avatar} alt="avatar" />
                    </span>
                  </div>
                  <div className="ms-2">
                    <div className="bg-light p-3 rounded">
                      <div className="d-flex justify-content-center">
                        <div className="me-2">
                          <h6 className="mb-1 lead fw-bold">

                            <a href="#!"> {comment.name} </a>
                          </h6>
                          <p className="h6 mb-0">{comment.comment}</p>
                        </div>
                        <small className="text-nowrap">{timeSince(comment.time)}</small>
                      </div>
                    </div>
                    <ul className="nav nav-divider py-2 small">
                      <li className="nav-item">

                        <a className="text-primary-hover" href="#">

                          Like {comment.like && comment.like}
                        </a>
                      </li>
                      <li className="nav-item">

                        <a className="text-primary-hover" href="#">

                          Reply
                        </a>
                      </li>
                      {comment.replies && <li className="nav-item">

                          <a className="text-primary-hover" href="#">

                            View {comment.replies} replies
                          </a>
                        </li>}
                    </ul>
                  </div>
                </div>
                {comment.reply && comment.reply.map((comment, idx) => <ul className="list-unstyled ms-4" key={idx}>
                      <li className="comment-item">
                        <div className="d-flex">
                          <div className="avatar avatar-xs flex-shrink-0">
                            <span role="button">
                              <img className="avatar-img rounded-circle" src={comment.avatar} alt="avatar" />
                            </span>
                          </div>
                          <div className="ms-2">
                            <div className="bg-light p-3 rounded">
                              <div className="d-flex justify-content-center">
                                <div className="me-2">
                                  <h6 className="mb-1  lead fw-bold">

                                    <a href="#"> {comment.name} </a>
                                  </h6>
                                  <p className=" mb-0">{comment.comment}</p>
                                </div>
                                <small className="text-nowrap">{timeSince(comment.time)}</small>
                              </div>
                            </div>
                            <ul className="nav nav-divider py-2 small">
                              <li className="nav-item">
                                <Link className="text-primary-hover" to="">

                                  Like {comment.like && comment.like}
                                </Link>
                              </li>
                              <li className="nav-item">
                                <Link className="text-primary-hover" to="">

                                  Reply
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>)}
              </li>
            </ul>
          </div>)}
      </Col>
    </Row>;
};
export default Comment;
