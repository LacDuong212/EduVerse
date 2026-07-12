import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardHeader, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const StudentDistributionChart = ({ col = 6, distributionData = [] }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("EDUVERSE_THEME_KEY") || "light");

  const courseNames = distributionData.map(item => item.courseName || item.courseId);
  const studentCounts = distributionData.map(item => item.studentCount || 0);

  const elem = document.querySelector("h6");
  const elemStyle = elem ? getComputedStyle(elem) : getComputedStyle(document.documentElement);

  const chartOptions = {
    series: [{
      name: "Active Students",
      data: studentCounts
    }],
    chart: {
      toolbar: { show: true },
      type: "bar",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const item = distributionData[config.dataPointIndex];
          if (item?.courseId) {
            navigate(`/instructor/courses/${item.courseId}`);
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => Math.round(val),
      style: {
        colors: [elemStyle.color],
        fontSize: elemStyle.fontSize,
        fontWeight: elemStyle.fontWeight
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: "right"
        }
      }
    },
    states: {
      hover: {
        filter: { type: "darken", value: 0.85 }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: "none" }
      }
    },
    colors: [
      getComputedStyle(document.documentElement).getPropertyValue("--bs-info").trim()
    ],
    xaxis: {
      type: "category",
      categories: courseNames,
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          cssClass: "apexcharts-yaxis-label-clickable"
        }
      }
    },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: (val) => `${Math.round(val)} students`,
        title: { formatter: () => "" }
      }
    }
  };

  const totalStudents = studentCounts.reduce((a, b) => a + b, 0);
  const avgStudents = totalStudents / (studentCounts.length || 1);
  const maxStudents = studentCounts.length > 0 ? Math.max(...studentCounts) : 0;

  return (
    <Col md={12} lg={col}>
      <Card className="bg-transparent border rounded-3 h-100">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0">Student Distribution by Course</h5>
        </CardHeader>
        <CardBody className="d-flex flex-column justify-content-between">
          <div className="mb-4">
            <div className="row g-3">
              <div className="col-6 col-md-4">
                <div className="p-3 bg-info bg-opacity-10 rounded-2">
                  <p className="mb-1 h6 small">Total Across Courses</p>
                  <h5 className="mb-0 text-info">{totalStudents}</h5>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 bg-success bg-opacity-10 rounded-2">
                  <p className="mb-1 h6 small">Average</p>
                  <h5 className="mb-0 text-success">{Math.round(avgStudents)}</h5>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 bg-warning bg-opacity-10 rounded-2">
                  <p className="mb-1 h6 small">Most Popular</p>
                  <h5 className="mb-0 text-warning">{maxStudents}</h5>
                </div>
              </div>
            </div>
          </div>

          {distributionData.length > 0 ? (
            <div className="position-relative style-apex-clickable">
              <ReactApexChart
                options={chartOptions}
                series={chartOptions.series}
                type="bar"
                height={320}
              />
            </div>
          ) : (
            <div className="text-center py-5 my-auto">
              <p className="text-muted mb-0">No course data available</p>
            </div>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default StudentDistributionChart;