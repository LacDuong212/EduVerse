import { currency } from '@/context/constants';
import { formatCurrency } from '@/utils/currency';
import ReactApexChart from 'react-apexcharts';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { FaCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const TopCoursesChart = ({ col = 6, topCoursesData = [] }) => {
  const variants = ['danger', 'success', 'warning', 'primary', 'secondary'];

  const series = topCoursesData.map(course => course.totalEarnings);
  const labels = topCoursesData.map(course => course.title);

  const topEarning = {
    series,
    labels,
    chart: {
      height: 300,
      width: 300,
      offsetX: 50,
      type: 'donut',
      sparkline: { enabled: true }
    },
    colors: variants.map(variant =>
      getComputedStyle(document.documentElement).getPropertyValue(`--bs-${variant}`).trim()
    ),
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => formatCurrency(val) }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200, height: 200 },
        legend: { position: 'bottom' }
      }
    }]
  };

  return (
    <Col xs={12} lg={col}>
      <Card className="bg-transparent border rounded-3">
        <CardHeader className="bg-transparent border-bottom">
          <Row className="align-items-center g-2">
            <Col sm={8} md={7} lg={8}>
              <h5 className="mb-0">Top Earning Courses This Month</h5>
            </Col>
            <Col sm={4} md={5} lg={4} className="d-flex justify-content-end">
              <Button
                as={Link}
                to="/instructor/courses"
                variant="primary-soft"
                size="sm"
                className="mb-0"
              >
                View Courses
              </Button>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <Row className="gy-4 align-items-center">
            <Col md={6}>
              <div className="ps-md-3">
                <h5 className="mb-2">Courses</h5>
                <ul className="list-group list-group-borderless">
                  {topCoursesData.map((course, index) => (
                    <li
                      key={course.courseId || index}
                      className="list-group-item d-flex align-items-center"
                    >
                      <FaCircle
                        className={`text-${variants[index % variants.length]} me-2 flex-shrink-0`}
                      />
                      <span>{course.title} - {course.totalEarnings || 0}{currency}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
            <Col md={6} className="ps-0 pe-7 pe-md-6">
              <ReactApexChart
                height={300}
                series={topEarning.series}
                type="donut"
                options={topEarning}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default TopCoursesChart;
