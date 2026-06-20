import PageMetaData from "@/components/PageMetaData";
import { Alert, Button, Col, Row } from "react-bootstrap";
import useDashboard from "./useDashboard";
import { useLearningStreak } from "@/components/StudentLayoutComponents/useStudentLayout";
import SkillRadarSection from "./components/SkillRadarSection";
import ListedCourses from "./components/ListedCourses";
import ActivityCalendar from "./components/ActivityCalendar";
import StatsCards from "./components/StatsCards";
import StreakWidget from "./components/StreakWidget";
import WeeklyActivityStrip from "./components/WeeklyActivityStrip";
import DashboardSkeleton from "./components/DashboardSkeleton";
import DashboardEmptyState from "./components/DashboardEmptyState";
import CloseToCompletion from "./components/CloseToCompletion";
import BadgesWidget from "./components/BadgesWidget";
import ResumeCard from "./components/ResumeCard";

const SectionDivider = ({ label }) => (
  <div className="d-flex align-items-center gap-2 mb-3 mt-2">
    <span
      className="small fw-semibold text-body flex-shrink-0"
      style={{ opacity: 0.45, textTransform: "uppercase", letterSpacing: "0.07em" }}
    >
      {label}
    </span>
    <div
      className="flex-grow-1"
      style={{ height: 1, background: "var(--bs-border-color)" }}
    />
  </div>
);

const StudentDashboard = () => {
  const { radar, stats, courseStats, inProgressCourses, loading, error, refetch } =
    useDashboard();
  const { streak } = useLearningStreak();

  if (loading && !radar && !stats) {
    return (
      <div className="pb-5">
        <PageMetaData title="Dashboard" />
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-5">
        <PageMetaData title="Dashboard" />
        <Alert
          variant="danger"
          className="d-flex align-items-center justify-content-between"
        >
          <div className="me-3">{error}</div>
          <Button size="sm" variant="outline-light" onClick={refetch}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  const enrolledCount = courseStats?.totalCourses ?? stats?.totalCourses ?? null;
  const hasNoActivity =
    enrolledCount === 0 && !radar && (inProgressCourses?.length ?? 0) === 0;

  return (
    <div className="pb-5">
      <PageMetaData title="Dashboard" />

      {/* 1 — Primary action: resume last lecture */}
      <ResumeCard />

      {/* 2 — Progress context */}
      <StatsCards stats={stats} courseStats={courseStats} />

      {/* 3 — This week's activity (visible without scrolling) */}
      <WeeklyActivityStrip streak={streak} />

      {hasNoActivity ? (
        <DashboardEmptyState />
      ) : (
        <>
          {/* 4 — Skills & progress */}
          <SectionDivider label="Skills & Progress" />
          <Row className="g-3 mb-3">
            {/* Left: chart + in-progress courses */}
            <Col xs={12} lg={8} className="d-flex flex-column gap-3">
              <SkillRadarSection radar={radar} />
              <CloseToCompletion courses={inProgressCourses} />
            </Col>

            {/* Right: streak + badges */}
            <Col xs={12} lg={4} className="d-flex flex-column gap-3">
              <StreakWidget streak={streak} />
              <BadgesWidget />
            </Col>
          </Row>

          {/* 6 — Activity history */}
          <SectionDivider label="Activity" />
          <ActivityCalendar streak={streak} />
        </>
      )}

      <ListedCourses />
    </div>
  );
};

export default StudentDashboard;
