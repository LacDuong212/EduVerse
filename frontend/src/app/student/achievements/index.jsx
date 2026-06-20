import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import { useAchievements } from "./useAchievements";
import AchievementSummary from "./components/AchievementSummary";
import EarnedBadgeGrid from "./components/EarnedBadgeGrid";
import LockedBadgeGrid from "./components/LockedBadgeGrid";
import ErrorState from "@/components/ErrorState";

const SectionHead = ({ tag, title }) => (
  <div className="d-flex align-items-center gap-3 mb-3 pb-2 border-bottom">
    <span
      className="text-info border border-info rounded"
      style={{
        fontSize:      9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding:       "2px 8px",
      }}
    >
      {tag}
    </span>
    <h2 className="h6 mb-0 fw-semibold text-body">{title}</h2>
  </div>
);

const AchievementsPage = () => {
  const { earned, locked, stats, loading, error, refetch } = useAchievements();

  if (loading) {
    return (
      <div className="h-100 d-flex flex-column justify-content-center align-items-center">
        <PageMetaData title="Achievements" />
        <div className="d-flex align-items-center justify-content-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Loading achievements…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-100 d-flex flex-column justify-content-center align-items-center">
        <PageMetaData title="Achievements" />
        <ErrorState
          className="d-flex flex-column justify-content-center align-items-center gap-3"
          message={error || "Oh no, your achievements...🙁"}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div>
      <PageMetaData title="Achievements" />

      <Row className="g-4 align-items-start">
        {/* Left — sticky summary panel */}
        <Col xs={12} lg={3}>
          <div style={{ position: "sticky", top: 24 }}>
            <AchievementSummary earned={earned} locked={locked} stats={stats} />
          </div>
        </Col>

        {/* Right — badge catalog */}
        <Col xs={12} lg={9} className="d-flex flex-column gap-3">
          {/* Earned section */}
          <div className="border rounded p-3">
            <SectionHead
              tag="Collected"
              title={`${earned.length} badge${earned.length !== 1 ? "s" : ""} earned`}
            />
            <EarnedBadgeGrid earned={earned} />
          </div>

          {/* Locked section */}
          <div className="border rounded p-3">
            <SectionHead
              tag="Locked"
              title={`${locked.length} remaining`}
            />
            <LockedBadgeGrid locked={locked} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AchievementsPage;
