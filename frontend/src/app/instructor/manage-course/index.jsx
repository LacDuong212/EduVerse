import CreateCourseForm from './components/CreateCourseForm';
import EditCourseForm from './components/EditCourseForm';

const InstructorManageCoursePage = ({ isEdit = false }) => {
  return (
    <>
      {isEdit ? <EditCourseForm /> : <CreateCourseForm />}
    </>
  );
};

export default InstructorManageCoursePage;
