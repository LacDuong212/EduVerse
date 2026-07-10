import { Alert, Button, Col, Row } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import { useLearningStreak } from "@/components/studentLayoutComponents/useStudentLayout";
import ActivityCalendar from "./components/ActivityCalendar";
import BadgesWidget from "./components/BadgesWidget";
import { default as CloseToCompletion } from "./components/CloseToCompletion";
import { default as DashboardEmptyState } from "./components/DashboardEmptyState";
import { default as DashboardSkeleton } from "./components/DashboardSkeleton";
import { default as ListedCourses } from "./components/ListedCourses";
import ResumeCard from "./components/ResumeCard";
import StatsCards from "./components/StatsCards";
import StreakWidget from "./components/StreakWidget";
import WeeklyActivityStrip from "./components/WeeklyActivityStrip";
import useDashboard from "./useDashboard";

const SectionDivider = ({ label }) => (
  <div className="d-flex align-items-center gap-2 mb-3 mt-2">
    <span
      className="small fw-semibold text-body flex-shrink-0"
      style={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.07em" }}
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
  const { stats, courseStats, inProgressCourses, loading } = useDashboard();
  const { streak } = useLearningStreak();

  if (loading && !stats) {
    return (
      <div>
        <PageMetaData title="Dashboard" />
        <DashboardSkeleton />
      </div>
    );
  }

  const enrolledCount = courseStats?.totalCourses ?? stats?.totalCourses ?? null;
  const hasNoActivity =
    enrolledCount === 0 && (inProgressCourses?.length ?? 0) === 0;

  return (
    <div>
      <PageMetaData title="Dashboard" />

      <SectionDivider label="Overview" />
      <div className="d-flex flex-column gap-3 mb-3">
        <ResumeCard />
        <StatsCards stats={stats} courseStats={courseStats} />
        <WeeklyActivityStrip streak={streak} />
      </div>

      {hasNoActivity ? (
        <DashboardEmptyState />
      ) : (
        <>
          <SectionDivider label="Progress & Achievements" />
          <Row className="g-3 mb-3">
            <Col xs={12} lg={8} className="d-flex flex-column gap-3">
              <CloseToCompletion courses={inProgressCourses} />
            </Col>

            <Col xs={12} lg={4} className="d-flex flex-column gap-3">
              <StreakWidget streak={streak} />
              <BadgesWidget />
            </Col>
          </Row>

          <SectionDivider label="Activity" />
          <div className="mb-3">
            <ActivityCalendar streak={streak} />
          </div>
        </>
      )}

      <SectionDivider label="Others" />
      <div>
        <ListedCourses />
      </div>
    </div>
  );
};

export default StudentDashboard;
