import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { reviewsAnalyticsChart } from '../data';
const ReviewsAnalytics = () => {
  return <Col xxl={5}>
      <Card className="bg-transparent border h-100">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0">Reviews Analytics</h5>
        </CardHeader>
        <CardBody className="pb-0 mb-3">
          <Row>
            <Col sm={6} className="mb-4">
              <div className="bg-success bg-opacity-10 p-4 rounded">
                <p className="mb-0">Total Positive Review</p>
                <h5 className="mb-0">85%</h5>
              </div>
            </Col>
            <Col sm={6} className="mb-4">
              <div className="bg-danger bg-opacity-10 p-4 rounded">
                <p className="mb-0">Total Negative Review</p>
                <h5 className="mb-0">15%</h5>
              </div>
            </Col>
          </Row>
          <div className={'d-flex justify-content-center'}>
            <ReactApexChart height={300} series={reviewsAnalyticsChart.series} type="donut" options={reviewsAnalyticsChart} />
          </div>
        </CardBody>
      </Card>
    </Col>;
};
export default ReviewsAnalytics;
