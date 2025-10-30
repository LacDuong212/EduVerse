
import PageMetaData from '@/components/PageMetaData';
import ActionBox from './components/ActionBox';
import Counter from './components/Counter';
import Hero from './components/Hero';
import PopularCourse from './components/PopularCourse';
import Reviews from './components/Reviews';

import TrendingCourses from './components/TrendingCourses';
const HomePage = () => {
  return <>
      <PageMetaData title="Home" />
  
      <main>
        <Hero />
        <Counter />
        <PopularCourse />
        <ActionBox />
        <TrendingCourses />
        <Reviews />
      </main>
     
    </>;
};
export default HomePage;
