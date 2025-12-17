import { FaEnvelope, FaGlobe, FaHeadphones, FaMapMarkerAlt } from 'react-icons/fa';

const InstructorInfo = ({ instructorData = {} }) => {
  const {
    name,
    occupation,
    introduction,
    address,
    website,
    phonenumber,
    email,
  } = instructorData || {};

  return (
    <>
      {introduction ? (
        <div className="mt-3 clamped-html" dangerouslySetInnerHTML={{ __html: String(introduction) }} />
      ) : (
        <>
          <h5 className="mt-3 mb-0">Hi, I am</h5>
          <h1 className="mb-0">{name || 'Unnamed Instructor'}</h1>
          <p>{occupation || 'Instructor'}</p>
        </>
      )}

      <ul className="list-group list-group-borderless px-3 mt-1">
        <li className="list-group-item px-0">
          <span className="h6 fw-light">
            <FaMapMarkerAlt className="text-primary mb-1 me-2" />
            Address:
          </span>
          <span>{address || '—'}</span>
        </li>
        <li className="list-group-item px-0">
          <span className="h6 fw-light">
            <FaEnvelope className="text-primary mb-1 me-2" />
            Email:
          </span>
          <span>{email || '—'}</span>
        </li>
        <li className="list-group-item px-0">
          <span className="h6 fw-light">
            <FaHeadphones className="text-primary mb-1 me-2" />
            Phone number:
          </span>
          <span>{phonenumber || '—'}</span>
        </li>
        <li className="list-group-item px-0">
          <span className="h6 fw-light">
            <FaGlobe className="text-primary mb-1 me-2" />
            Website:
          </span>
          <span>{website ? (<a href={website} target="_blank" rel="noopener noreferrer">{website}</a>) : '—'}</span>
        </li>
      </ul>
    </>
  );
};

export default InstructorInfo;