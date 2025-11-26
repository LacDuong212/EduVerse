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
  const [earningsData, setEarningsData] = useState([]);
  const [topCoursesData, setTopCoursesData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchDashboardData();

      if (data?.success) {
        const {
          totalCourses,
          totalStudents,
          totalOrders,
          averageRating,
          earningsData,
          topCoursesData,
        } = data;

        setCounterData({ totalCourses, totalStudents, totalOrders, averageRating });
        setEarningsData(earningsData || []);
        setTopCoursesData(topCoursesData || []);
      } else {
        // handle error or set defaults
        setCounterData(null);
        setEarningsData([]);
        setTopCoursesData([]);
      }
    };
    load();
  }, []);

  return (
    <Container className="pb-5">
      <PageMetaData title="Dashboard" />
      <WelcomeBack instructorName={instructorName} />
      <DashboardCounter counterData={counterData} />
      <Row className="mt-3 g-4">
        <EarningsChart col={7} earningsData={earningsData} />
        <TopCoursesChart col={5} topCoursesData={topCoursesData} />
      </Row>
    </Container>
  );
};

export default InstructorDashboard;
