import { Container } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import useInstructorMyCourses from "./useInstructorMyCourses";
import MyCoursesHero from "./components/Hero";
import MyCourses from "./components/MyCourses";

const InstructorMyCourses = () => {
  const {
    courses,
    pagination,
    stats,
    statsLoading,
    coursesLoading,

    setPage,
    setSearch,
    setSort,
    updateCoursePrivacy,
  } = useInstructorMyCourses();

  return (
    <>
      <PageMetaData title="My Courses" />
      <MyCoursesHero stats={stats} />
      <Container className="py-5">
        <MyCourses
          courses={courses}
          totalCourses={pagination.totalItems}
          page={pagination.page}
          limit={pagination.limit}
          totalPages={pagination.totalPages}
          loading={coursesLoading}
          onPageChange={setPage}
          onTogglePrivacy={updateCoursePrivacy}
          onSearch={setSearch}
          onSortChange={setSort}
        />
      </Container>
    </>
  );
};

export default InstructorMyCourses;
