import useProfile from '@/hooks/useProfile';
import PageMetaData from '@/components/PageMetaData';
import MyProfile from './components/MyProfile';

import { Row } from 'react-bootstrap';


const StudentAccount = () => {
  const { user } = useProfile();

  return (
    <div className='pb-5'>
      <PageMetaData title="Account" />
      <MyProfile user={user} />
    </div>
  );
};

export default StudentAccount;
