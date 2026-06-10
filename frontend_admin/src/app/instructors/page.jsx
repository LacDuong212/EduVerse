import PageMetaData from '@/components/PageMetaData';
import { FaUserTie } from 'react-icons/fa';
import AllInstructors from './components/AllInstructors';
const InstructorPage = () => {
  return <>
      <PageMetaData title="Instructor" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaUserTie className="text-warning" size={22} /> Instructors
          </h1>
          <p className="page-subtitle mb-0">Manage platform instructors</p>
        </div>
      </div>
      <AllInstructors />
    </>;
};
export default InstructorPage;
