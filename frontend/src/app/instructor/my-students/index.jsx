import PageMetaData from "@/components/PageMetaData";
import MyStudentsHero from "./components/Hero";
import MyStudentsList from "./components/MyStudents";
import useInstructor from "../useInstructor";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";

const InstructorMyStudents = () => {
  const { fetchStudents } = useInstructor();

  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [inactiveStudents, setInactiveStudents] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const res = await fetchStudents(page, limit, searchTerm, sort);
        if (res) {
          setStudents(res.students || []);
          setTotalPages(res.totalPages || 0);
          setTotalStudents(res.total || 0);
          setActiveStudents(res.totalActive || 0);
          setInactiveStudents(res.totalInactive || 0);
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
        toast.error(error || "Cannot get students");
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [page, limit, searchTerm, sort, fetchStudents]);

  return (
    <>
      <PageMetaData title="My Students" />
      <MyStudentsHero countersData={{ totalStudents, activeStudents, inactiveStudents }} />
      <Container className="my-5">
        <MyStudentsList 
          students={students}
          totalStudents={totalStudents}
          page={page}
          limit={limit}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sort={sort}
          setSort={setSort}
        />
      </Container>
    </>
  );
};

export default InstructorMyStudents;
