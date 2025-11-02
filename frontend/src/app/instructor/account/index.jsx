import PageMetaData from '@/components/PageMetaData';
import LinkedAccount from './components/LinkedAccount';
import MyProfile from './components/MyProfile';
import SocialMedia from './components/SocialMedia';

import { Row } from 'react-bootstrap';


const InstructorAccount = () => {
  return (
    <div className='pb-5'>
      <PageMetaData title="Account" />
      <MyProfile />
      <Row className="g-4 mt-3">
        <LinkedAccount col={5} />
        <SocialMedia col={7} />
      </Row>
    </div>
  );
};

export default InstructorAccount;
