import PageMetaData from "@/components/PageMetaData";
import useInstructorDashboard from "./useInstructorDashboard";
import DashboardCounter from "./components/DashboardCounter";
import EarningsChart from "./components/EarningsChart";
import TopCoursesChart from "./components/TopCoursesChart";
import WelcomeBack from "./components/WelcomeBack";
import { Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const InstructorDashboard = () => {
  const instructorName = useSelector(state => state.auth.userData.name);
  const {
    stats,
    earningChart,
    topCourses,
    loading,
    error,
    refetch
  } = useInstructorDashboard();

  // if (error) {
  //   toast.error(error);

  //   return (
  //     <Container className="d-flex flex-column align-items-center justify-content-center mt-5">
  //       <h3>Error loading page</h3>
  //       <button onClick={refetch} className="btn btn-primary">Retry</button>
  //     </Container>
  //   );
  // }

  return (
    <>
      <PageMetaData title="Dashboard" />
      <WelcomeBack instructorName={instructorName} />
      <Container className="pt-3 pb-5">
        <DashboardCounter counterData={stats} />
        <Row className="mt-3 g-4">
          {topCourses && topCourses.length > 0 ? (
            <>
              <EarningsChart
                col={7}
                earningsData={earningChart}
              />
              <TopCoursesChart
                col={5}
                topCoursesData={topCourses}
              />
            </>
          ) : (
            <EarningsChart
              col={12}
              earningsData={earningChart}
            />
          )}
        </Row>
      </Container>
    </>
  );
};

export default InstructorDashboard;