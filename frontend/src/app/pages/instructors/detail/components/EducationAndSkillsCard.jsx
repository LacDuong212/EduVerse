import { Card } from 'react-bootstrap';
import { FaGraduationCap } from 'react-icons/fa';

const EducationAndSkillsCard = ({ educationList = [], skillsList = [] }) => {
  // ensure arrays
  const edList = Array.isArray(educationList) ? educationList : (educationList ? [educationList] : []);
  const skList = Array.isArray(skillsList) ? skillsList : (skillsList ? [skillsList] : []);

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short' });
  }

  return (
    <Card className="card-body shadow p-4">
      <h4 className="mb-3">Education</h4>
      {edList.length === 0 ? (
        <div>No education information available.</div>
      ) : (
        edList.map((edu, idx) => (
          <div key={idx} className="d-flex align-items-center mb-3">
            <span
              className="icon-md mb-0 bg-light rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '40px', height: '40px' }}
            >
              <FaGraduationCap />
            </span>
            <div className="ms-3">
              <h6 className="mb-0">{edu.institution || 'Unknown Institution'}</h6>
              <p className="mb-0 small">
                {edu.degree ? (edu.degree + "-" + edu.fieldOfStudy) : (edu.fieldOfStudy || "")}
              </p>
              {(edu.startDate || edu.endDate) && (
                <p className="mb-0 small">{formatDate(edu.startDate)} {edu.endDate ? ` - ${formatDate(edu.endDate)}` : '- Present'}</p>
              )}
            </div>
          </div>
        ))
      )}

      <hr />
      <h4 className="mb-3">Skills</h4>
      {skList.length === 0 ? (
        <div className="text-body">No skills available.</div>
      ) : (
        (() => {
          const colors = ['danger', 'orange', 'warning', 'success', 'primary', 'purple'];
          const maxShow = 6;
          const shown = skList.slice(0, maxShow);
          const remaining = Math.max(0, skList.length - maxShow);
          return (
            <>
              {shown.map((skill, idx) => {
                const level = Math.max(0, Math.min(100, Number(skill.level || 0)));
                const variant = colors[idx % colors.length];
                return (
                  <div key={idx} className="overflow-hidden mb-3">
                    <div className="d-flex align-items-end justify-content-between">
                      <h6 className="mb-1 text-break">{skill.name || skill.skill || 'Unknown'}</h6>
                      <span className="progress-percent-simple text-body">{level}%</span>
                    </div>
                    
                    <div className="progress progress-sm">
                      <div className={`progress-bar bg-${variant} aos`} role="progressbar" style={{ width: `${level}%` }} aria-valuenow={level} aria-valuemin={0} aria-valuemax={100}>
                      </div>
                    </div>
                  </div>
                )
              })}
              {remaining > 0 && (
                <div className="small">and {remaining} more</div>
              )}
            </>
          );
        })()
      )}
    </Card>
  );
};

export default EducationAndSkillsCard;