import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardHeader, CardBody, Col, Row } from "react-bootstrap";
import { BsArrowUp, BsArrowDown, BsDash } from "react-icons/bs";
import { formatCurrency, toCurrencyFormat } from "@/utils/currency";

const EarningChart = ({ col = 6, earningsData = [] }) => {
  const [theme, setTheme] = useState(localStorage.getItem("EDUVERSE_THEME_KEY") || "light");

  const values = earningsData.map(item => item.value);

  const categories = earningsData.map(item => {
    const [month, year] = item.period.split("-");
    return `${month}/${year}`;
  });

  const chartOptions = {
    series: [{
      name: "Earnings",
      data: values
    }],
    chart: { toolbar: { show: true } },
    dataLabels: {
      formatter: (val) => toCurrencyFormat(val),
      enabled: true,
    },
    stroke: { curve: "smooth", width: 1.5 },
    colors: [
      getComputedStyle(document.documentElement).getPropertyValue("--bs-info").trim()
    ],
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.1,
      }
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

  const avgEarnings = earningsData.map(item => item.value).reduce((a, b) => a + b, 0) / (earningsData.length || 1);

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
          <span className="text-secondary me-1"><BsDash /></span>
        </>
      );
    }
  };

  const thisMonthValue = earningsData.length > 0 ? earningsData[earningsData.length - 1].value : 0;
  const lastMonthValue = earningsData.length > 1 ? earningsData[earningsData.length - 2].value : 0;

  return (
    <Col md={12} lg={col}>
      <Card className="bg-transparent border rounded-3">
        <CardHeader className="bg-transparent border-bottom">
          <h3 className="mb-0">Earnings Overview <span className="h4 mb-0">(Past 12 Months)</span></h3>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">This Month</span>
              <h4 className="text-info my-2">{formatCurrency(thisMonthValue)}</h4>
              <p className="mb-0">
                {getChangeDisplay(thisMonthValue, lastMonthValue)} vs. last month
              </p>
            </Col>
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">On Average</span>
              <h4 className="my-2">{formatCurrency(avgEarnings)}</h4>
              <p className="mb-0">{getChangeDisplay(avgEarnings, thisMonthValue)} vs. this month</p>
            </Col>
          </Row>
          <ReactApexChart options={chartOptions} series={chartOptions.series} type="area" height={300} />
        </CardBody>
      </Card>
    </Col>
  );
};

export default EarningChart;