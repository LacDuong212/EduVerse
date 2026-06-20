import { useMemo } from "react";
import SkillRadarChart from "./SkillRadarChart";
import SkillBarChart from "./SkillBarChart";
import SkillRadarCompareText from "./SkillRadarCompareText";

const SkillRadarSection = ({ radar }) => {
  if (!radar) return null;

  const activeCount = useMemo(
    () => (radar.values || []).filter((v) => Number(v) > 0).length,
    [radar.values]
  );

  const chartKey =
    `${(radar?.labels || []).join("|")}::` +
    `${(radar?.values || []).join("|")}::` +
    `${(radar?.systemAvgValues || []).join("|")}`;

  return (
    <>
      {activeCount < 3 ? (
        <SkillBarChart key={chartKey} radar={radar} />
      ) : (
        <SkillRadarChart key={chartKey} radar={radar} title="Skill Radar" height={400} />
      )}
      <SkillRadarCompareText radar={radar} />
    </>
  );
};

export default SkillRadarSection;