import { Card } from 'react-bootstrap';
import { FaGraduationCap } from 'react-icons/fa';

const EducationListCard = ({ educationList = {} }) => {

  return (
    <Card className="card-body shadow shadow-sm p-4">
      <h4 className="mb-3">Education</h4>
      <div className="d-flex align-items-center mb-4">
        <span className="icon-md mb-0 bg-light rounded-3">
          <FaGraduationCap />
        </span>
        <div className="ms-3">
          <h6 className="mb-0">Harvard University</h6>
          <p className="mb-0 small">Bachelor in Computer Graphics</p>
        </div>
      </div>
      <div className="d-flex align-items-center mb-4">
        <span className="icon-md mb-0 bg-light rounded-3">
          <FaGraduationCap />
        </span>
        <div className="ms-3">
          <h6 className="mb-0">University of Toronto</h6>
          <p className="mb-0 small">Master in Computer Graphics</p>
        </div>
      </div>
      <div className="d-flex align-items-center mb-4">
        <span className="icon-md mb-0 bg-light rounded-3">
          <FaGraduationCap />
        </span>
        <div className="ms-3">
          <h6 className="mb-0">East Ray University</h6>
          <p className="mb-0 small">Bachelor in Computer Graphics</p>
        </div>
      </div>
      <hr />
      <h4 className="mb-3">Skills</h4>
      <div className="overflow-hidden mb-4">
        <h6 className="uppercase">Graphic design</h6>
        <div className="progress progress-sm bg-primary bg-opacity-10">
          <div className="progress-bar bg-primary aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
            width: '90%'
          }} aria-valuenow={90} aria-valuemin={0} aria-valuemax={100}>
            <span className="progress-percent-simple h6 mb-0">90%</span>
          </div>
        </div>
      </div>
      <div className="overflow-hidden mb-4">
        <h6 className="uppercase">Web design</h6>
        <div className="progress progress-sm bg-success bg-opacity-10">
          <div className="progress-bar bg-success aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
            width: '80%'
          }} aria-valuenow={80} aria-valuemin={0} aria-valuemax={100}>
            <span className="progress-percent-simple h6 mb-0">80%</span>
          </div>
        </div>
      </div>
      <div className="overflow-hidden mb-4">
        <h6 className="uppercase">HTML/CSS</h6>
        <div className="progress progress-sm bg-warning bg-opacity-15">
          <div className="progress-bar bg-warning aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
            width: '60%'
          }} aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
            <span className="progress-percent-simple h6 mb-0">60%</span>
          </div>
        </div>
      </div>
      <div className="overflow-hidden mb-4">
        <h6 className="uppercase">UI/UX</h6>
        <div className="progress progress-sm bg-danger bg-opacity-10">
          <div className="progress-bar bg-danger aos" role="progressbar" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" style={{
            width: '50%'
          }} aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
            <span className="progress-percent-simple h6 mb-0">50%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EducationListCard;