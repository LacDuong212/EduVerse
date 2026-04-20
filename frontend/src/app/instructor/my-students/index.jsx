import { Container } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import MyStudentsHero from "./components/Hero";
import MyStudentsList from "./components/MyStudents";
import useInstructorMyStudents from "./useInstructorMyStudents";

const InstructorMyStudents = () => {
  const {
    students,
    pagination,
    stats,
    statsLoading,
    studentsLoading,

    setPage,
    setSearch,
    setSort,
  } = useInstructorMyStudents();

  return (
    <>
      <PageMetaData title="My Students" />
      <MyStudentsHero stats={stats} />
      <Container className="my-5">
        <MyStudentsList
          students={students}
          totalStudents={pagination.totalItems}
          page={pagination.page}
          limit={pagination.limit}
          totalPages={pagination.totalPages}
          loading={studentsLoading}
          onPageChange={setPage}
          onSearch={setSearch}
          onSortChange={setSort}
        />
      </Container>
    </>
  );
};

export default InstructorMyStudents;