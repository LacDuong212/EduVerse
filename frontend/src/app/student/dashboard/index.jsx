import PageMetaData from '@/components/PageMetaData';
import SkillRadarSection from "./components/SkillRadarSection"


const StudentDashboard = () => {

  return (
    <div className='pb-5'>
      <PageMetaData title="My Profile" />
      
      <SkillRadarSection />
    </div>

  );
};

export default StudentDashboard;
