import PageMetaData from '@/components/PageMetaData';
import { Row } from 'react-bootstrap';
import Reviews from './components/Reviews';
import ReviewsAnalytics from './components/ReviewsAnalytics';
import TopRatedCourses from './components/TopRatedCourses';
const ReviewsPage = () => {
  return <>
      <PageMetaData title="Reviews" />
      <Reviews />
      <Row className="g-4">
        <TopRatedCourses />
        <ReviewsAnalytics />
      </Row>
    </>;
};
export default ReviewsPage;
