import PageMetaData from "@/components/PageMetaData";
import Hero from "./components/Hero";
import MyStudentsList from "./components/MyStudents";
import { Container } from "react-bootstrap";

const InstructorMyStudents = () => {

  return (
    <>
      <PageMetaData title="My Students" />
      <Hero />
      <Container className="mt-5">
        <MyStudentsList />
      </Container>
    </>
  );
};

export default InstructorMyStudents;
