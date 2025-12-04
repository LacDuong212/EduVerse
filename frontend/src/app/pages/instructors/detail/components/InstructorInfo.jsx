import { Col, Container, Row } from 'react-bootstrap';
import { FaEnvelope, FaGlobe, FaHeadphones, FaMapMarkerAlt } from 'react-icons/fa';
import InstructorCounters from './InstructorCounters';

const InstructorInfo = ({ }) => {
  return (
    <>
      <h5 className="mb-0">Hi, I am</h5>
      <h1 className="mb-0">Lori Stevens</h1>
      <p>Graphic Designer</p>
      <p className="mt-4">
        Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if.
        Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.
      </p>
      <p>
        We focus a great deal on the understanding of behavioral psychology and influence triggers which are crucial for becoming a well-rounded
        Digital Marketer. We understand that theory is important to build a solid foundation, we understand that theory alone isn’t going to get
        the job done so that’s why this course is packed with practical hands-on examples that you can follow step by step.
      </p>
      <ul className="list-group list-group-borderless px-3">
        <li className="list-group-item px-0">
          <span className="h6 fw-light">
            <FaMapMarkerAlt className="text-primary me-1 me-sm-3" />
            Address:
          </span>
          <span>2002 Horton Ford Rd, Eidson, TN, 37731</span>
        </li>
        <li className="list-group-item px-0">
          <span className="h6 fw-light">
            <FaEnvelope className="text-primary me-1 me-sm-3" />
            Email:
          </span>
          <span>example@gmail.com</span>
        </li>
        <li className="list-group-item px-0">
          <span className="h6 fw-light">
            <FaHeadphones className="text-primary me-1 me-sm-3" />
            Phone number:
          </span>
          <span>+896-789-546</span>
        </li>
        <li className="list-group-item px-0">
          <span className="h6 fw-light">
            <FaGlobe className="text-primary me-1 me-sm-3" />
            Website:
          </span>
          <span>https://stackbros.in/</span>
        </li>
      </ul>
    </>
  );
};

export default InstructorInfo;
