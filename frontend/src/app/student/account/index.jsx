import PageMetaData from '@/components/PageMetaData';
import MyProfile from './components/MyProfile';

const StudentAccount = () => {

  return (
    <div className='pb-5'>
      <PageMetaData title="My Profile" />
      <MyProfile />
    </div>
  );
};

export default StudentAccount;
