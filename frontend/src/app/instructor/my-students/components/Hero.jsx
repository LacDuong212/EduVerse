import { Col } from "react-bootstrap";
import { BsHexagonFill, BsTriangleFill } from "react-icons/bs";
import { FaCircle, FaGripLines, FaStar } from "react-icons/fa";
import { PiRectangleDashedBold } from "react-icons/pi";
import Counter from "./Counter";

const MyStudentsHero = ({
  title = "My Students",
  countersData = {},
}) => {
  const styles = {
    wrapper: {
      position: 'relative',
      overflow: 'hidden', // keeps shapes inside the rounded corners
      border: 'none',
    },
    shape1: {
      position: 'absolute',
      top: '-30px',
      right: '16%',
      fontSize: '4rem',
      opacity: "0.5",
      zIndex: 0
    },
    shape2: {
      position: 'absolute',
      bottom: '-2%',
      left: '45%',
      fontSize: '2rem',
      transform: 'rotate(-15deg)',
      opacity: "0.5",
      zIndex: 0
    },
    shape3: {
      position: 'absolute',
      top: '50px',
      left: '-1%',
      fontSize: '5rem',
      transform: 'rotate(15deg)',
      opacity: "0.5",
      zIndex: 0
    },
    shape4: {
      position: 'absolute',
      top: '52px',
      right: '37%',
      fontSize: '1rem',
      transform: 'rotate(45deg)',
      opacity: "0.5",
      zIndex: 0
    },
    shape5: {
      position: 'absolute',
      top: '-30px',
      left: '25%',
      fontSize: '6rem',
      transform: 'rotate(-60deg)',
      opacity: "0.5",
      zIndex: 0
    },
    shape6: {
      position: 'absolute',
      top: '100px',
      right: '-50px',
      fontSize: '9rem',
      transform: 'rotate(60deg)',
      opacity: "0.5",
      zIndex: 0
    },
  };

  return (
    <section className="bg-light pt-4 pb-4 position-relative" style={styles.wrapper}>
        {/* Decorations */}
        <FaCircle className="text-orange" style={styles.shape1} />
        <FaStar className="text-warning" style={styles.shape2} />
        <BsHexagonFill className="text-success" style={styles.shape3} />
        <BsTriangleFill className="text-purple" style={styles.shape4} />
        <FaGripLines className="text-danger" style={styles.shape5} />
        <PiRectangleDashedBold className="text-primary" style={styles.shape6} />

        {/* Main Content */}
        <div className="row align-items-center position-relative z-1">
          <Col className="text-center position-relative">
            <h2>{title}</h2>
            <p className="mb-3 mx-auto" style={{ maxWidth: '400px' }}>
              Manage courses you created. Track statuses, enrollments and basic details all in one place.
            </p>
            <Counter {...countersData} />
          </Col>
        </div>
    </section>
  );
};

export default MyStudentsHero;