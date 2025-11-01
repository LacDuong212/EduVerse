import PageMetaData from '@/components/PageMetaData';
import CoursesList from './components/Courses';
import CoursesStat from './components/CoursesStat';
import useAdminCourses from "./useAdminCourses";


const Courses = () => {
  const { courses, meta, loading, fetchCourses } = useAdminCourses();

  return <>
      <PageMetaData title="All Courses" />
      <CoursesStat meta={meta} loading={loading} />
      <CoursesList courses={courses} loading={loading} fetchCourses={fetchCourses} meta={meta} />
    </>;
};

export default Courses;
