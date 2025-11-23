import PageMetaData from "@/components/PageMetaData";
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
  const { fetchDashboardData } = useInstructorDashboard();

  const [counterData, setCounterData] = useState(null);
  useEffect(() => {
    const load = async () => {
      const data = await fetchDashboardData();
      setCounterData(data);
    };
    load();
  }, []);

  return (
    <Container className="pb-5">
      <PageMetaData title="Dashboard" />
      <WelcomeBack instructorName={instructorName} />
      <DashboardCounter counterData={counterData} />
      <Row className="mt-3 g-4">
        <EarningsChart col={6} />
        <TopCoursesChart col={6} />
      </Row>
    </Container>
  );
};

export default InstructorDashboard;
