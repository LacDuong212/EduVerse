import { Container } from "react-bootstrap";
import PageMetaData from "@/components/PageMetaData";
import MyStudentsHero from "./components/Hero";
import MyStudentsList from "./components/MyStudents";
import useInstructorMyStudents from "./useInstructorMyStudents";

const InstructorMyStudents = () => {
  const {
    students,
    stats,
    pagination,
    loading,
    search,
    sort,
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
          totalPages={pagination.totalPages}
          page={pagination.page || 1}
          limit={10}
          loading={loading}
          currentSearch={search}
          currentSort={sort}
          onPageChange={setPage}
          onSearch={setSearch}
          onSortChange={setSort}
        />
      </Container>
    </>
  );
};

export default InstructorMyStudents;