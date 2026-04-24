import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { currency } from "@/contexts/constants";
import { formatCurrency } from "@/utils/currency";

const TopCoursesChart = ({ col = 6, topCoursesData = [] }) => {
  const variants = ["danger", "warning", "success", "primary", "purple"];

  const series = topCoursesData.map(course => course.totalRevenue);
  const labels = topCoursesData.map(course => course.title);

  const topRevenue = {
    series,
    labels,
    chart: {
      height: 300,
      width: 300,
      type: "donut",
      sparkline: { enabled: true }
    },
    colors: variants.map(variant =>
      getComputedStyle(document.documentElement).getPropertyValue(`--bs-${variant}`).trim()
    ),
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => formatCurrency(val) }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200, height: 200 },
        legend: { position: "bottom" }
      }
    }]
  };

  return (
    <Col xs={12} lg={col}>
      <Card className="bg-transparent border rounded-3">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0">Top Earning Courses This Month</h5>
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
                      <div className="d-flex flex-column">
                        <span>
                          <Link 
                            to={`/instructor/courses/${course?.courseId || ''}`}
                            className={`text-${variants[index % variants.length]}`}
                          >
                            {course?.title}
                          </Link> {course?.totalRevenue || 0}{currency}
                        </span>
                        (Purchase: {course?.totalSales || 0})
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
            <Col md={6} className="">
              <ReactApexChart
                height={300}
                series={topRevenue.series}
                type="donut"
                options={topRevenue}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default TopCoursesChart;