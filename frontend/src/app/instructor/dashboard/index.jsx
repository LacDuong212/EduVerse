import PageMetaData from "@/components/PageMetaData";
import useInstructor from "../useInstructor";
import useInstructorDashboard from "./useInstructorDashboard";
import DashboardCounter from "./components/DashboardCounter";
import EarningsChart from "./components/EarningsChart";
import TopCoursesChart from "./components/TopCoursesChart";
import WelcomeBack from "./components/WelcomeBack";
import { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";


const InstructorDashboard = () => {
  const instructorName = useSelector(state => state.auth.userData.name);
  const { fetchInstructorCounters } = useInstructor();
  const { fetchDashboardData } = useInstructorDashboard();

  const [counterData, setCounterData] = useState(null);
  const [earningsData, setEarningsData] = useState([]);
  const [topCoursesData, setTopCoursesData] = useState([]);

  useEffect(() => {
    const load = async () => {
      setCounterData(await fetchInstructorCounters());

      const { earningsData, topCoursesData } = await fetchDashboardData();
      setEarningsData(earningsData);
      setTopCoursesData(topCoursesData);
    };
    load();
  }, []);

  return (
    <Container className="pb-5">
      <PageMetaData title="Dashboard" />
      <WelcomeBack instructorName={instructorName} />
      <DashboardCounter counterData={counterData} />
      <Row className="mt-3 g-4">
        {(topCoursesData && topCoursesData.length > 0) ? (
          <>
            <EarningsChart col={7} earningsData={earningsData} />
            <TopCoursesChart col={5} topCoursesData={topCoursesData} />
          </>
        ) : (
          <EarningsChart col={12} earningsData={earningsData} />
        )}
      </Row>
    </Container>
  );
};

export default InstructorDashboard;
