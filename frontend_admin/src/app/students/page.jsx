import PageMetaData from '@/components/PageMetaData';
import { FaUserGraduate } from 'react-icons/fa';
import AllStudents from './components/AllStudents';
const StudentPage = () => {
  return <>
      <PageMetaData title="Student" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaUserGraduate className="text-primary" size={22} /> Students
          </h1>
          <p className="page-subtitle mb-0">Manage registered students</p>
        </div>
      </div>
      <AllStudents />
    </>;
};
export default StudentPage;
