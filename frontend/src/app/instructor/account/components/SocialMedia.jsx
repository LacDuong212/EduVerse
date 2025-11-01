import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { BsTwitter } from 'react-icons/bs';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';


const SocialMedia = (col = 6) => {
  return (
    <Col lg={col}>
      <Card className="bg-transparent border rounded-3">
        <CardHeader className="bg-transparent border-bottom">
          <h5 className="card-header-title mb-0">Social Media</h5>
        </CardHeader>
        <CardBody>
          <div className="mb-3">
            <label className="form-label d-flex align-items-center">
              <FaFacebook className="fab fa-facebook text-facebook me-2 fs-5" />
              Facebook profile URL
            </label>
            <input className="form-control" type="text" placeholder="facebook.com/your_username" />
          </div>
          <div className="mb-3">
            <label className="form-label d-flex align-items-center">
              <BsTwitter className="bi bi-twitter text-twitter me-2 fs-5" />
              Twitter profile URL
            </label>
            <input className="form-control" type="text" placeholder="x.com/your_username" />
          </div>
          <div className="mb-3">
            <label className="form-label d-flex align-items-center">
              <FaInstagram className="fab fa-instagram text-danger me-2 fs-5" />
              Instagram profile URL
            </label>
            <input className="form-control" type="text" placeholder="instagram.com/your_username" />
          </div>
          <div className="mb-3">
            <label className="form-label d-flex align-items-center">
              <FaYoutube className="fab fa-youtube text-youtube me-2 fs-5" />
              YouTube channel URL
            </label>
            <input className="form-control" type="text" placeholder="youtube.com/@your_channel" />
          </div>
          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-primary">
              Save
            </button>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default SocialMedia;
