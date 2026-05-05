import ErrorState from "@/components/ErrorState";
import PageMetaData from "@/components/PageMetaData";
import useInstructorDashboard from "./useInstructorDashboard";
import DashboardCounter from "./components/DashboardCounter";
import RevenueChart from "./components/RevenueChart";
import TopCoursesChart from "./components/TopCoursesChart";
import WelcomeBack from "./components/WelcomeBack";
import { Container, Row, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";

const InstructorDashboard = () => {
  const instructorName = useSelector(state => state.auth.userData.name);
  const {
    stats,
    revenueChart,
    topCourses,
    loading,
    error,
    refetch
  } = useInstructorDashboard();

  if (loading) {
    return (
      <div className="position-absolute top-50 start-50 translate-middle">
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "30px", height: "30px" }}
        />
      </div>
    );
  }

  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageMetaData title="Dashboard" />
      <WelcomeBack instructorName={instructorName} />
      <Container className="pt-3 pb-5">
        <DashboardCounter counterData={stats} />
        <Row className="mt-3 g-4">
          {topCourses && topCourses.length > 0 ? (
            <>
              <RevenueChart
                col={7}
                revenueData={revenueChart}
              />
              <TopCoursesChart
                col={5}
                topCoursesData={topCourses}
              />
            </>
          ) : (
            <RevenueChart
              col={12}
              revenueData={revenueChart}
            />
          )}
        </Row>
      </Container>
    </>
  );
};

export default InstructorDashboard;