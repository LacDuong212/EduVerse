import { Alert, Button, Spinner } from "react-bootstrap";
import { useSkillRadar } from "../useSkillRadar";
import SkillRadarChart from "./SkillRadarChart";
import SkillRadarCompareText from "./SkillRadarCompareText";

const SkillRadarSection = () => {
  const { radar, loading, error, refetch } = useSkillRadar();

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted">
        <Spinner size="sm" />
        Đang tải skill radar...
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        className="d-flex align-items-center justify-content-between"
      >
        <div className="me-3">{error}</div>
        <Button size="sm" variant="outline-light" onClick={refetch}>
          Thử lại
        </Button>
      </Alert>
    );
  }

  // ✅ ÉP remount khi BẤT KỲ dataset nào thay đổi
  // (labels, user values, system average values)
  const chartKey =
    `${(radar?.labels || []).join("|")}::` +
    `${(radar?.values || []).join("|")}::` +
    `${(radar?.systemAvgValues || []).join("|")}`;

  return (
 <>
  <SkillRadarChart key={chartKey} radar={radar} title="Skill Radar" height={400} />
  <SkillRadarCompareText radar={radar} />
</>


  );
};

export default SkillRadarSection;
