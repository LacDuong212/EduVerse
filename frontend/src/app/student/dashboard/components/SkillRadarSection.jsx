import SkillRadarChart from "./SkillRadarChart";
import SkillRadarCompareText from "./SkillRadarCompareText";

const SkillRadarSection = ({ radar }) => {
  if (!radar) return null;

  const chartKey =
    `${(radar?.labels || []).join("|")}::` +
    `${(radar?.values || []).join("|")}::` +
    `${(radar?.systemAvgValues || []).join("|")}`;

  return (
    <>
      <SkillRadarChart
        key={chartKey}
        radar={radar}
        title="Skill Radar"
        height={400}
      />
      <SkillRadarCompareText radar={radar} />
    </>
  );
};

export default SkillRadarSection;