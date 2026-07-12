import { FaEnvelope, FaGlobe, FaHeadphones, FaMapMarkerAlt } from "react-icons/fa";
import { sanitizeHtml } from "@/utils/sanitize";

const InstructorInfo = ({ data = {} }) => {
  const {
    name,
    occupation,
    introduction,
    address,
    website,
    phonenumber,
    email,
  } = data || {};

  return (
    <>
      {introduction && (
        <div className="mb-3">
          <div className="h4">Biography</div>
          <div className="clamped-html border-start border-3 border-light ms-1 ps-3">
            <div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(introduction) }} />
          </div>
        </div>
      )}
      <div className="row mt-0 g-3">
        {[
          { icon: <FaMapMarkerAlt />, label: "Address", value: address },
          { icon: <FaEnvelope />, label: "Email", value: email },
          { icon: <FaHeadphones />, label: "Phone", value: phonenumber },
          { icon: <FaGlobe />, label: "Website", value: website, isLink: true }
        ].map((item, idx) => (
          <div key={idx} className="col-sm-6 col-md-12">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-3" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div>
                <small className="d-block lh-1 mb-1">{item.label}</small>
                <span className="fw-medium">
                  {item.isLink && item.value ? (
                    <a href={item.value} target="_blank" rel="noopener noreferrer" className="">{item.value}</a>
                  ) : (
                    item.value || "-"
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default InstructorInfo;