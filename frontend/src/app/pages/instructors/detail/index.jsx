import CoursesList from "./components/CoursesList";
import EducationAndSkillsCard from "./components/EducationAndSkillsCard";
import InstructorAvatarCard from "./components/InstructorAvatarCard";
import InstructorCounters from "./components/InstructorCounters";
import InstructorInfo from "./components/InstructorInfo";
import useGuest from "@/app/useGuest";
import { useParams } from "react-router-dom";
import PageMetaData from "@/components/PageMetaData";

import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { toast } from "react-toastify";

const InstructorDetailsPage = () => {
  const { fetchInstructorDetails } = useGuest();
  const { id } = useParams();
  
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadInstructor = async () => {
      try {
        setLoading(true);
        const instructorData = (await fetchInstructorDetails(id));
        setInstructor(instructorData || {});
        setLoading(false);

      } catch (error) {
        toast.error(error || "Failed to fetch instructor details")
        setLoading(false);
      }
    };
    loadInstructor();
  }, [id]);

  const isEmptyObject = (obj) => !!obj && Object.keys(obj).length === 0 && obj.constructor === Object;

  if (loading) {
    return (
      <>
        <PageMetaData title="Instructor Details" />
        <Container className="pt-4 pb-5">
          <Row className="g-0 g-lg-5">
            <Col className="text-center">Loading...</Col>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageMetaData title="Instructor Details" />
      <Container className="pt-5">
          <Row className="g-0 g-lg-5">
            <Col lg={4}>
              <Row>
                <Col md={6} lg={12}>
                  <InstructorAvatarCard 
                    avatar={instructor?.pfpImg || ""} 
                    socials={instructor?.socials || {}} 
                    averageRating={instructor?.averageRating || 0}
                  />
                </Col>
                <Col md={6} lg={12}>
                  <EducationAndSkillsCard 
                    educationList={instructor?.education || []} 
                    skillsList={instructor?.skills || []}
                  />
                </Col>
              </Row>
            </Col>
            <Col lg={8}>
              <Row>
                {isEmptyObject(instructor) ? (
                  <div className="p-3">No instructor information available.</div>
                ) : (
                  <InstructorInfo instructorData={instructor} />
                )}
              </Row>
              <Row className="mt-0 g-3">
                {!isEmptyObject(instructor) && <InstructorCounters
                  totalPublicCourses={instructor?.totalPublicCourses || 0}
                  totalStudents={instructor?.totalStudents || 0}
                  totalReviews={instructor?.totalReviews || 0}
                />}
              </Row>
              <Row className="mt-4 mb-5">
                <h2 className="my-0">My Courses</h2>
                {!isEmptyObject(instructor) && <CoursesList coursesData={instructor?.courses || []} />}
              </Row>
            </Col>
          </Row>
        </Container>
    </>
  );
};

export default InstructorDetailsPage;