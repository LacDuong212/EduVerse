import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import useInstructor from "../useInstructor";
import MyCoursesHero from "./components/Hero";
import MyCourses from "./components/MyCourses";


const InstructorMyCourses = () => {
  const { fetchCourses, setCoursePrivacy } = useInstructor();

  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [inactiveCourses, setInactiveCourses] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('updatedAt');

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const res = await fetchCourses(page, limit, searchTerm, sort);
        if (res) {
          setCourses(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalCourses(res.total || 0);
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
  }, [page, limit, searchTerm, sort, fetchCourses]);

  const toggleCoursePrivacy = async (courseId, currentPrivacy) => {
    const success = await setCoursePrivacy(courseId, !currentPrivacy);
    if (success) {
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, isPrivate: !currentPrivacy } : c))
      );
    }
  };

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
          totalCourses={totalCourses}
          page={page}
          limit={limit}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setPage}
          onTogglePrivacy={toggleCoursePrivacy}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sort={sort}
          setSort={setSort}
        />
      </Container>
    </>
  );
};

export default InstructorMyCourses;
