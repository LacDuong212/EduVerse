import { EarnedBadgeCard } from "./BadgeCard";

const EarnedBadgeGrid = ({ earned }) => {
  if (!earned.length) {
    return (
      <div className="text-center py-5 text-body" style={{ opacity: 0.45 }}>
        <div style={{ fontSize: 36 }} className="mb-2">🏅</div>
        <p className="small mb-1 fw-semibold">No badges earned yet.</p>
        <p className="small mb-0">Complete lectures and maintain your streak to earn your first badge.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap:                 "8px",
      }}
    >
      {earned.map((badge, i) => (
        <EarnedBadgeCard key={badge.key} badge={badge} index={i} />
      ))}
    </div>
  );
};

export default EarnedBadgeGrid;
