import PageMetaData from '@/components/PageMetaData';
import CoursesList from './components/Courses';
import CoursesStat from './components/CoursesStat';
const Courses = () => {
  return <>
      <PageMetaData title="All Courses" />
      <CoursesStat />
      <CoursesList />
    </>;
};
export default Courses;
