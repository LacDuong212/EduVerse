import PageMetaData from '@/components/PageMetaData';
import SkillRadarSection from "./components/SkillRadarSection"
import ListedCourses from './components/ListedCourses';


const StudentDashboard = () => {

  return (
    <div className='pb-5'>
      <PageMetaData title="My Profile" />
      
      <SkillRadarSection />

      <ListedCourses />
    </div>

  );
};

export default StudentDashboard;
