import PageMetaData from '@/components/PageMetaData';
import MyProfile from './components/MyProfile';

const InstructorAccount = () => {
  return (
    <div className='pb-5'>
      <PageMetaData title="My Profile" />
      <MyProfile />
    </div>
  );
};

export default InstructorAccount;
