import PageMetaData from '@/components/PageMetaData';
import ActionBox from './components/ActionBox';
import Banner from './components/Banner';
import Counter from './components/Counter';
import FormAndTabs from './components/FormAndTabs';
import Steps from './components/Steps';

const BecomeInstructorPage = () => {
  return <>
      <PageMetaData title="Become A Instructor" />
      <main>
        <Banner />
        <Steps />
        <Counter />
        <FormAndTabs />
        <ActionBox />
      </main>
    </>;
};

export default BecomeInstructorPage;
