import PageMetaData from "@/components/PageMetaData";
import MyCoursesHero from "./components/Hero";
import Courses from "./components/Courses";
import { Container } from "react-bootstrap";


const InstructorMyCourses = () => {

  return (
    <>
      <PageMetaData title="My Courses" />
      <MyCoursesHero />
      <Container className="py-5"><Courses /></Container>
    </>
  );
};

export default InstructorMyCourses;
