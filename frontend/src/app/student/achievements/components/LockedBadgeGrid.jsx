import { LockedBadgeCard } from "./BadgeCard";

const LockedBadgeGrid = ({ locked }) => {
  if (!locked.length) {
    return (
      <div className="text-center py-4 text-body" style={{ opacity: 0.45 }}>
        <div style={{ fontSize: 32 }} className="mb-2">🎉</div>
        <p className="small mb-0 fw-semibold">You&rsquo;ve earned every badge!</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap:                 "8px",
      }}
    >
      {locked.map((badge) => (
        <LockedBadgeCard key={badge.key} badge={badge} />
      ))}
    </div>
  );
};

export default LockedBadgeGrid;
