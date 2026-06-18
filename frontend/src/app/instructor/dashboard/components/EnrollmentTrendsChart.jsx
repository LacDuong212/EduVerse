import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardHeader, CardBody, Col, Row } from "react-bootstrap";
import { BsArrowUp, BsArrowDown, BsDash } from "react-icons/bs";

const EnrollmentTrendsChart = ({ col = 6, enrollmentData = [] }) => {
  const [theme, setTheme] = useState(localStorage.getItem("EDUVERSE_THEME_KEY") || "light");

  const values = enrollmentData.map(item => item.value);
  const dates = enrollmentData.map(item => {
    if (item.date) {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return "";
  });

  const chartOptions = {
    series: [{
      name: "New Enrollments",
      data: values
    }],
    chart: { toolbar: { show: true } },
    dataLabels: {
      enabled: false,
    },
    stroke: { curve: "smooth", width: 2 },
    colors: [
      getComputedStyle(document.documentElement).getPropertyValue("--bs-success").trim()
    ],
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.3, opacityTo: 0.1, }
    },
    xaxis: {
      type: "category",
      categories: dates,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: [{
      labels: { formatter: (val) => Math.round(val) },
      axisTicks: { show: false },
      axisBorder: { show: false }
    }],
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      fixed: { enabled: false },
      y: {
        formatter: (val) => `${Math.round(val)} enrollments`,
        title: { formatter: () => "" }
      },
      marker: { show: false }
    }
  };

  const totalEnrollments = values.reduce((a, b) => a + b, 0);
  const avgEnrollments = totalEnrollments / (values.length || 1);
  const todayEnrollments = values.length > 0 ? values[values.length - 1] : 0;
  const yesterdayEnrollments = values.length > 1 ? values[values.length - 2] : 0;

  const getChangeDisplay = (value1, value2) => {
    const diff = value1 - value2;

    if (diff > 0) {
      return (
        <>
          <span className="text-success me-1">+{diff} <BsArrowUp /></span>
        </>
      );
    } else if (diff < 0) {
      return (
        <>
          <span className="text-danger me-1">{diff} <BsArrowDown /></span>
        </>
      );
    } else {
      return (
        <>
          <span className="text-info"><BsDash /></span>
        </>
      );
    }
  };

  return (
    <Col md={12} lg={col}>
      <Card className="bg-transparent border rounded-3 h-100">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0">Enrollment Trends (Last 30 Days)</h5>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">Today</span>
              <h4 className="text-success my-2">{todayEnrollments}</h4>
              <p className="mb-0">
                {getChangeDisplay(todayEnrollments, yesterdayEnrollments)} vs. yesterday
              </p>
            </Col>
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">Average</span>
              <h4 className="my-2">{Math.round(avgEnrollments)}</h4>
              <p className="mb-0">{getChangeDisplay(Math.round(avgEnrollments), todayEnrollments)} vs. today</p>
            </Col>
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">Total</span>
              <h4 className="text-info my-2">{totalEnrollments}</h4>
              <p className="mb-0">Last 30 days</p>
            </Col>
          </Row>
          <ReactApexChart options={chartOptions} series={chartOptions.series} type="area" height={300} />
        </CardBody>
      </Card>
    </Col>
  );
};

export default EnrollmentTrendsChart;