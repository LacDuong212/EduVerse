import PageMetaData from "@/components/PageMetaData";
import { Alert, Button, Spinner } from "react-bootstrap";
import useDashboard from "./useDashboard";
import SkillRadarSection from "./components/SkillRadarSection";
import ListedCourses from "./components/ListedCourses";

const StudentDashboard = () => {
  const { radar, loading, error, refetch } = useDashboard();

  if (loading && !radar) {
    return (
      <div className="pb-5">
        <PageMetaData title="My Profile" />
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner size="sm" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-5">
        <PageMetaData title="My Profile" />
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

  return (
    <div className="pb-5">
      <PageMetaData title="My Profile" />

      <SkillRadarSection radar={radar} />

      <ListedCourses />
    </div>
  );
};

export default StudentDashboard;