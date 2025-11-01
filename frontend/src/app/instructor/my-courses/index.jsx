import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import useInstructor from "../useInstructor";
import MyCoursesHero from "./components/Hero";
import MyCourses from "./components/MyCourses";


const InstructorMyCourses = () => {
  const { fetchCourses } = useInstructor();

  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [inactiveCourses, setInactiveCourses] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const res = await fetchCourses(page, limit);
        if (res) {
          setCourses(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalCourses(res.total || 0);

          // Calculate active/inactive counts from data or from API response
          // Assuming your backend returns totalActive and totalInactive counts in res
          setActiveCourses(res.totalActive || 0);
          setInactiveCourses(res.totalInactive || 0);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [page, limit, fetchCourses]);

  return (
    <>
      <PageMetaData title="My Courses" />
      <MyCoursesHero
        totalCourses={totalCourses}
        activeCourses={activeCourses}
        inactiveCourses={inactiveCourses}
      />
      <Container className="py-5">
        <MyCourses
          courses={courses}
          page={page}
          limit={limit}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setPage}
        />
      </Container>
    </>
  );
};

export default InstructorMyCourses;
