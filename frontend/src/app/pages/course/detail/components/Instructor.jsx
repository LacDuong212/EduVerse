import { Card, CardBody, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FaAngleRight, FaBook, FaCommentDots, FaFacebookSquare, FaInstagramSquare, FaLinkedin, FaPlay, FaStar, FaTwitterSquare, FaUserGraduate, FaYoutubeSquare } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function normalizeUrl(value) {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

const Instructor = ({ instructor = {} }) => {
  const avatar = instructor?.pfpImg || instructor?.avatar || '';

  const socials = {
    facebook: instructor?.socials?.facebook || '',
    instagram: instructor?.socials?.instagram || '',
    linkedin: instructor?.socials?.linkedin || '',
    twitter: instructor?.socials?.twitter || '',
    youtube: instructor?.socials?.youtube || '',
  };

  const introduction = instructor?.introduction || "<p>This instructor was lazy.</p>"

  const email = instructor?.email || '';
  const phonenumber = instructor?.phonenumber || '';
  const website = instructor?.website || '';

  const contacts = email || phonenumber || website || ''

  return (
    <>
      <Card className="mb-0 mb-md-3">
        <Row className="g-0 align-items-center">
          <Col md={4}>
            <div className="d-flex flex-column align-items-center me-2 gap-3">
              {avatar ? (
                <img src={avatar} className="rounded-3 border border-body border-3 shadow w-100 h-100 object-fit-cover" alt="Avatar" />
              ) : (
                <div className="rounded-3 border border-body border-3 shadow d-flex align-items-center justify-content-center bg-light w-100 h-100 fs-1 fw-bold">{(instructor?.name?.[0] || "I").toUpperCase()}</div>
              )}
            </div>
          </Col>
          <Col md={8}>
            <CardBody>
              <h3 className="card-title mb-0">{instructor?.name || "Instructor"}</h3>
              <p className="mb-2">{instructor?.occupation || "Classic Instructor"}</p>
              <ul className="list-inline">
                {socials.facebook && <li className="list-inline-item">
                  <a className="fs-4 text-facebook" href={normalizeUrl(socials.facebook)} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebookSquare className="h-13px" />
                  </a>
                </li>}
                {socials.instagram && <li className="list-inline-item">
                  <a className="fs-4 text-instagram" href={normalizeUrl(socials.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagramSquare />
                  </a>
                </li>}
                {socials.linkedin && <li className="list-inline-item">
                  <a className="fs-4 text-linkedin" href={normalizeUrl(socials.linkedin)} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FaLinkedin className="fab fa-fw fa-linkedin-in" />
                  </a>
                </li>}
                {socials.twitter && <li className="list-inline-item">
                  <a className="fs-4 text-twitter" href={normalizeUrl(socials.twitter)} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FaTwitterSquare />
                  </a>
                </li>}
                {socials.youtube && <li className="list-inline-item">
                  <a className="fs-4 text-youtube" href={normalizeUrl(socials.youtube)} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <FaYoutubeSquare />
                  </a>
                </li>}
              </ul>
              <ul className="list-inline mb-0">
                <li className="list-inline-item">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Rating</Tooltip>}
                    >
                      <span className="icon-md bg-warning bg-opacity-15 text-warning rounded-circle">
                        <FaStar className="fs-4 p-1 mb-1" />
                      </span>
                    </OverlayTrigger>
                    <span className="h6 fw-light mb-0 ms-2">{(instructor?.averageRating || 0).toFixed(1)}</span>
                  </div>

                </li>
                <li className="list-inline-item">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Courses</Tooltip>}
                    >
                      <span className="icon-md bg-danger bg-opacity-10 text-danger rounded-circle">
                        <FaBook className="fs-6 mb-1" />
                      </span>
                    </OverlayTrigger>
                    <span className="h6 fw-light mb-0 ms-2">{instructor?.totalPublicCourses || 0}</span>
                  </div>
                </li>
                <li className="list-inline-item">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Students</Tooltip>}
                    >
                      <span className="icon-md bg-orange bg-opacity-10 text-orange rounded-circle">
                        <FaUserGraduate className="fs-6 mb-1" />
                      </span>
                    </OverlayTrigger>
                    <span className="h6 fw-light mb-0 ms-2">{instructor?.totalStudents || 0}</span>
                  </div>
                </li>
                <li className="list-inline-item">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Reviews</Tooltip>}
                    >
                      <span className="icon-md bg-info bg-opacity-10 text-info rounded-circle">
                        <FaCommentDots className="fs-4 p-1 mb-1" />
                      </span>
                    </OverlayTrigger>
                    <span className="h6 fw-light mb-0 ms-2">{instructor?.totalReviews || 0}</span>
                  </div>
                </li>
              </ul>
            </CardBody>
          </Col>
        </Row>
      </Card>
      <div className="d-flex justify-content-between mt-4">
        <h5>About Instructor</h5>
        {instructor?.id && <Link className="fw-bold" to={instructor?.id ? `/instructors/${instructor.id}` : "/instructors"}>
          View Full Profile<span className="fs-5"><FaAngleRight /></span>
        </Link>}
      </div>
      <div className="border-start border-3 px-3 clamped-html" dangerouslySetInnerHTML={{ __html: String(introduction) }} />
      <Col xs={12}>
        <h5 className="mt-4" >Contacts</h5>
        <ul className="border-start border-3 px-3 list-group list-group-borderless mb-0 gap-2">
          {!contacts ? (
            <li className="list-group-item py-0">
              No info
            </li>
          ) : (
            <>
              {email && <li className="list-group-item py-0">
                Email:{" "}
                <span className="text-primary">{email || ''}</span>
              </li>}
              {phonenumber && <li className="list-group-item py-0">
                Phone:{" "}
                <span className="text-primary">{phonenumber || ''}</span>
              </li>}
              {website && <li className="list-group-item py-0">
                Website:{" "}
                <span className="text-primary">{website || ''}</span>
              </li>}
            </>
          )}

        </ul>
      </Col>
    </>
  );
};
export default Instructor;
