import { linkedAccount } from '../useAccount';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { BsCheckCircleFill } from 'react-icons/bs';


const LinkedData = ({
  description,
  icon: Icon,
  isActive,
  name,
  variant
}) => {
  return (
    <div className={`position-relative d-sm-flex ${isActive && 'bg-success border-success'} bg-opacity-10 border p-3 rounded`}>
      <h2 className="fs-1 mb-0 me-3">
        <Icon className={variant} />
      </h2>
      <div className="flex-grow-1 position-relative">
        {isActive && (
          <div className="position-absolute top-0 start-100 translate-middle bg-white rounded-circle lh-1 h-20px">
            <BsCheckCircleFill className="bi bi-check-circle-fill text-success fs-5" />
          </div>
        )}
        <h6 className="mb-1">{name}</h6>
        <p className="mb-1 small">{description}</p>
        <div className="d-flex justify-content-end mt-4">
          {isActive ? (
            <button type="button" className="btn btn-sm btn-danger mb-0">Invoke</button>
          ) : (
            <button type="button" className="btn btn-sm btn-primary mb-0">Connect</button>
          )}
        </div>
      </div>
    </div>
  );
};

const LinkedAccount = ({ col = 6 }) => {
  return (
    <Col lg={col}>
      <Card className="bg-transparent border rounded-3 pb-3">
        <CardHeader className="bg-transparent border-bottom">
          <h5 className="card-header-title">Linked Accounts</h5>
        </CardHeader>
        {linkedAccount.map((item, idx) => (
          <CardBody className="p-3 pb-0" key={idx}>
            <LinkedData {...item} />
          </CardBody>
        ))}
      </Card>
    </Col>
  );
};

export default LinkedAccount;
