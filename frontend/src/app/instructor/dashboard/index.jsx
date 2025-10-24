import PageMetaData from "@/components/PageMetaData";
import Chart from "./components/Chart";
import Counter from "./components/Counter";
import CourseList from "./components/CourseList";
import WelcomeBack from "./components/WelcomeBack";


const InstructorDashboard = () => {
  return (
    <>
      <PageMetaData title="Dashboard" />
      <WelcomeBack />
      <Counter />
      <Chart />
      <CourseList />
    </>
  );
};

export default InstructorDashboard;
