import useProfile from '@/hooks/useProfile';
import PageMetaData from '@/components/PageMetaData';
import MyProfile from './components/MyProfile';
import SocialMedia from './components/SocialMedia';

import { Row } from 'react-bootstrap';


const StudentAccount = () => {
  const { user } = useProfile();

  return (
    <div className='pb-5'>
      <PageMetaData title="Account" />
      <MyProfile user={user} />
      <Row className="g-4 mt-3">
        <SocialMedia col={12} socials={user?.socials || []} />
      </Row>
    </div>
  );
};

export default StudentAccount;
