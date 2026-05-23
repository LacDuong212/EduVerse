import { Container } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import MyCoursesHero from "./components/Hero";
import MyCourses from "./components/MyCourses";
import useInstructorMyCourses from "./useInstructorMyCourses";

const InstructorMyCourses = () => {
  const {
    courses,
    stats,
    loading,
    search, setSearch,
    sort, setSort,
    pagination, setPage,
    togglePrivacy,
    handleRemoveDraft
  } = useInstructorMyCourses();

  return (
    <>
      <PageMetaData title="My Courses" />
      <MyCoursesHero stats={stats} />
      <Container className="py-5">
        <MyCourses
          courses={courses}
          loading={loading}
          page={pagination.page}
          limit={pagination.limit}
          totalCourses={pagination.totalItems}
          totalPages={pagination.totalPages}
          currentSearch={search}
          currentSort={sort}
          onSearch={setSearch}
          onSortChange={setSort}
          onPageChange={setPage}
          onTogglePrivacy={togglePrivacy}
          onRemoveDraft={handleRemoveDraft}
        />
      </Container>
    </>
  );
};

export default InstructorMyCourses;