import { Row } from 'react-bootstrap';
import Counter from './components/Counter';
import Earnings from './components/Earnings';
import UserGrowth from './components/UserGrowth';
import CourseStatusDonut from './components/CourseStatusDonut';
import MonthlyEnrollments from './components/MonthlyEnrollments';
import OrderStatusDonut from './components/OrderStatusDonut';
import TopCourses from './components/TopCourses';
import CoursesByCategory from './components/CoursesByCategory';
import TopInstructorsByRevenue from './components/TopInstructorsByRevenue';
import PageMetaData from '@/components/PageMetaData';
import { BsSpeedometer2 } from 'react-icons/bs';
const AdminDashboardPage = () => {
  return <>
      <PageMetaData title="Admin Dashboard" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <BsSpeedometer2 className="text-primary" size={22} /> Dashboard
          </h1>
          <p className="page-subtitle mb-0">Platform overview &amp; key metrics</p>
        </div>
      </div>
      <Counter />
      <Row className="g-4 mb-4">
        <Earnings />
        <OrderStatusDonut />
      </Row>
      <Row className="g-4 mb-4">
        <MonthlyEnrollments />
        <CourseStatusDonut />
      </Row>
      <Row className="g-4 mb-4">
        <UserGrowth />
      </Row>
      <Row className="g-4 mb-4">
        <CoursesByCategory />
        <TopInstructorsByRevenue />
      </Row>
      <Row className="g-4 mb-4">
        <TopCourses />
      </Row>
    </>;
};
export default AdminDashboardPage;
