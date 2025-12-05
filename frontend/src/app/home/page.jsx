
import PageMetaData from '@/components/PageMetaData';
import ActionBox from './components/ActionBox';
import Counter from './components/Counter';
import CouponActionBox from './components/CouponActionBox';
import Hero from './components/Hero';
import NewestCourses from './components/NewestCourses';
// import Reviews from './components/Reviews';
import useHomeCourses from './useHomeCourses';
import TrendingCourses from './components/TrendingCourses';
import BestSellersSection from './components/BestSellers';
import TopRatedSection from './components/TopRated';
const HomePage = () => {
  useHomeCourses();

  return <>
      <PageMetaData title="Home" />
  
      <main>
        <Hero />
        <Counter />
        <CouponActionBox />
        <NewestCourses />
        <ActionBox />
        <TrendingCourses />
        <BestSellersSection />
        <TopRatedSection />
        {/* <Reviews /> */}
      </main>
     
    </>;
};
export default HomePage;
