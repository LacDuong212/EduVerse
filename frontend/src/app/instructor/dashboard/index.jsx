import PageMetaData from "@/components/PageMetaData";
import Chart from "./components/Chart";
import Counter from "./components/Counter";
import CourseList from "./components/CourseList";
import WelcomeBack from "./components/WelcomeBack";
import { Container } from "react-bootstrap";


const InstructorDashboard = () => {
  return (
    <Container className="pb-5">
      <PageMetaData title="Dashboard" />
      <WelcomeBack />
      <Counter />
      <Chart />
      <CourseList />
    </Container>
  );
};

export default InstructorDashboard;
