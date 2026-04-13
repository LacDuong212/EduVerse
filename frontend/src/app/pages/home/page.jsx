import PageMetaData from '@/components/PageMetaData';
import InstructorActionBox from './components/InstructorBox';
import BestSellers from './components/BestSellers';
import BiggestDiscounts from './components/BiggestDiscounts';
import Counter from './components/Counter';
import CouponActionBox from './components/CouponBox';
import Hero from './components/Hero';
import InterestModal from "./components/InterestModal";
import NewestCourses from './components/NewestCourses';
import RecommendedCourses from "./components/RecommendedCourses";
import TopRatedSection from './components/TopRated';
import useHomeCourses from './useHomeCourses';

const HomePage = () => {
  useHomeCourses();

  return <>
      <PageMetaData title="Home" />
  
      <main>
        <InterestModal />
        <Hero />
        <Counter />
        <RecommendedCourses />
        <CouponActionBox />
        <NewestCourses />
        <InstructorActionBox />
        <BiggestDiscounts />
        <BestSellers />
        <TopRatedSection />
      </main>
     
    </>;
};

export default HomePage;