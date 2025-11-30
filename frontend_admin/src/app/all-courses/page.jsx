import PageMetaData from '@/components/PageMetaData';
import CoursesList from './components/Courses';
import CoursesStat from './components/CoursesStat';
import useAdminCourses from "./useAdminCourses";


const Courses = () => {
  const { 
    courses, 
    meta, 
    loading, 
    search, 
    setSearch, 
    setPage, 
    refreshCourses 
  } = useAdminCourses();

  return <>
      <PageMetaData title="All Courses" />
      <CoursesStat meta={meta} loading={loading} />
      <CoursesList 
        courses={courses} 
        loading={loading} 
        meta={meta}
        search={search}
        setSearch={setSearch}
        setPage={setPage}
        refreshCourses={refreshCourses}
      />
    </>;
};

export default Courses;
