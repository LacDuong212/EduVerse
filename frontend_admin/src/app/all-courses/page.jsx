import PageMetaData from '@/components/PageMetaData';
import { FaBook } from 'react-icons/fa';
import CoursesList from './components/Courses';
import CoursesStat from './components/CoursesStat';
import useAdminCourses from "./useAdminCourses";


const Courses = () => {
  const {
    courses,
    setCourses,
    meta,
    loading,
    search,
    setSearch,
    setPage,
    pageSize,
    setPageSize,
    refreshCourses
  } = useAdminCourses();

  return <>
    <PageMetaData title="All Courses" />
    <div className="page-title-box d-sm-flex align-items-start justify-content-between">
      <div>
        <h1 className="h3 mb-1 d-flex align-items-center gap-2">
          <FaBook className="text-info" size={20} /> All Courses
        </h1>
        <p className="page-subtitle mb-0">Review and manage platform courses</p>
      </div>
    </div>
    <CoursesStat meta={meta} loading={loading} />
    <CoursesList
      courses={courses}
      setCourses={setCourses}
      loading={loading}
      meta={meta}
      search={search}
      setSearch={setSearch}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      refreshCourses={refreshCourses}
    />
  </>;
};

export default Courses;
