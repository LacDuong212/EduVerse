import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardHeader, CardBody, Col, Row } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";

const StudentProgressChart = ({ col = 6, progressData = {} }) => {
  const [theme, setTheme] = useState(localStorage.getItem("EDUVERSE_THEME_KEY") || "light");

  const statusBreakdown = progressData.statusBreakdown || [
    { status: "active", count: 0, percentage: 0 },
    { status: "completed", count: 0, percentage: 0 },
    { status: "refunded", count: 0, percentage: 0 },
    { status: "inactive", count: 0, percentage: 0 }
  ];

  const total = progressData.total || 0;

  const statusColorMap = {
    active: "success",
    completed: "primary",
    refunded: "danger",
    inactive: "warning"
  };

  const statusLabelMap = {
    active: "Active Learning",
    completed: "Completed",
    refunded: "Refunded",
    inactive: "Inactive"
  };

  const series = statusBreakdown.map(item => item.count);
  const labels = statusBreakdown.map(item => statusLabelMap[item.status] || item.status);

  const elem = document.querySelector("h6");
  const elemStyle = elem ? getComputedStyle(elem) : getComputedStyle(document.documentElement);
  const chartOptions = {
    series,
    labels,
    chart: {
      type: "donut",
      sparkline: { enabled: false }
    },
    colors: statusBreakdown.map(item =>
      getComputedStyle(document.documentElement).getPropertyValue(`--bs-${statusColorMap[item.status]}`).trim()
    ),
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: (val) => `${val} students`
      }
    },
    dataLabels: {
      formatter: (val) => `${(val).toFixed(1)}%`,
      style: {
        fontSize: elemStyle.fontSize,
        fontWeight: elemStyle.fontWeight
      }
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
      <Card className="bg-transparent border rounded-3 h-100">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0">Student Progress Status</h5>
        </CardHeader>
        <CardBody>
          <Row className="gy-4 align-items-center">
            <Col md={6}>
              <div className="ps-md-3">
                <h5 className="mb-2">Status Breakdown</h5>
                <ul className="list-group list-group-borderless">
                  {statusBreakdown.map((item, index) => (
                    <li
                      key={item.status || index}
                      className="list-group-item d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center">
                        <FaCircle
                          className={`text-${statusColorMap[item.status]} me-2 flex-shrink-0`}
                          size={10}
                        />
                        <span>{statusLabelMap[item.status] || item.status}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-dark">{item.count}</span>
                        <span className="small">{item.percentage}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 p-3 bg-light rounded-2">
                  <p className="mb-1">
                    <strong>Total Students:</strong>
                  </p>
                  <h4 className="mb-0 text-primary">{total}</h4>
                </div>
              </div>
            </Col>
            <Col md={6} className="d-flex justify-content-center">
              <ReactApexChart
                height={300}
                series={chartOptions.series}
                type="donut"
                options={chartOptions}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default StudentProgressChart;