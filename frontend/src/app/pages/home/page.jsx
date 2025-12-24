import PageMetaData from '@/components/PageMetaData';
import ActionBox from './components/ActionBox';
import Counter from './components/Counter';
import CouponActionBox from './components/CouponActionBox';
import Hero from './components/Hero';
import NewestCourses from './components/NewestCourses';
import useHomeCourses from './useHomeCourses';
import TrendingCourses from './components/TrendingCourses';
import BestSellersSection from './components/BestSellers';
import RecommendedCourses from "./components/RecommendedCourses";
import InterestModal from "./components/InterestModal";
import TopRatedSection from './components/TopRated';
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
        <ActionBox />
        <TrendingCourses />
        <BestSellersSection />
        <TopRatedSection />
      </main>
     
    </>;
};
export default HomePage;
