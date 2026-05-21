import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardHeader, CardBody, Col, Row } from "react-bootstrap";
import { BsArrowUp, BsArrowDown, BsDash } from "react-icons/bs";
import { formatCurrency, toCurrencyFormat } from "@/utils/currency";

const RevenueChart = ({ col = 6, revenueData = [] }) => {
  const [theme, setTheme] = useState(localStorage.getItem("EDUVERSE_THEME_KEY") || "light");

  const values = revenueData.map(item => item.value);

  const categories = revenueData.map(item => {
    const [month, year] = item.period.split("-");
    return `${month}/${year}`;
  });

  const chartOptions = {
    series: [{
      name: "Revenue",
      data: values
    }],
    chart: { toolbar: { show: true } },
    dataLabels: {
      formatter: (val) => toCurrencyFormat(val),
      enabled: true,
    },
    stroke: { curve: "smooth", width: 1.5 },
    colors: [
      getComputedStyle(document.documentElement).getPropertyValue("--bs-primary").trim()
    ],
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.5, opacityTo: 0.1, }
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: [{
      labels: { formatter: (val) => toCurrencyFormat(val) },
      axisTicks: { show: false },
      axisBorder: { show: false }
    }],
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      fixed: { enabled: false },
      y: {
        formatter: (val) => formatCurrency(val),
        title: { formatter: () => "" }
      },
      marker: { show: false }
    }
  }

  const avgRevenue = revenueData.map(item => item.value).reduce((a, b) => a + b, 0) / (revenueData.length || 1);

  const getChangeDisplay = (value1, value2) => {
    const diff = value1 - value2;

    if (diff > 0) {
      return (
        <>
          <span className="text-success me-1">+{formatCurrency(diff)} <BsArrowUp /></span>
        </>
      );
    } else if (diff < 0) {
      return (
        <>
          <span className="text-danger me-1">{formatCurrency(diff)} <BsArrowDown /></span>
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

  const thisMonthValue = revenueData.length > 0 ? revenueData[revenueData.length - 1].value : 0;
  const lastMonthValue = revenueData.length > 1 ? revenueData[revenueData.length - 2].value : 0;

  return (
    <Col md={12} lg={col}>
      <Card className="bg-transparent border rounded-3 h-100">
        <CardHeader className="bg-light border-bottom">
          <h5 className="mb-0">Revenue Overview (Past 12 Months)</h5>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">This Month</span>
              <h4 className="text-primary my-2">{formatCurrency(thisMonthValue)}</h4>
              <p className="mb-0">
                {getChangeDisplay(thisMonthValue, lastMonthValue)} vs. last month
              </p>
            </Col>
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">On Average</span>
              <h4 className="my-2">{formatCurrency(avgRevenue)}</h4>
              <p className="mb-0">{getChangeDisplay(avgRevenue, thisMonthValue)} vs. this month</p>
            </Col>
          </Row>
          <ReactApexChart options={chartOptions} series={chartOptions.series} type="area" height={300} />
        </CardBody>
      </Card>
    </Col>
  );
};

export default RevenueChart;