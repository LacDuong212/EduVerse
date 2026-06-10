import axios from 'axios';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { formatCurrency, formatCurrencyNumber } from "../../../utils/currency";

const Earnings = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [theme, setTheme] = useState(localStorage.getItem('EDUVERSE_THEME_KEY') || 'light');
  const [chartSeries, setChartSeries] = useState([]);

  const chartConfig = {
    series: [{ data: [] }],
    chart: { toolbar: { show: true } },
    dataLabels: {
      formatter: (val) => formatCurrencyNumber(val),
      enabled: true
    },
    stroke: { curve: "smooth", width: 2 },
    colors: [getComputedStyle(document.documentElement).getPropertyValue('--bs-purple')],
    xaxis: {
      type: 'category',
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: [{
      labels: { formatter: (val) => formatCurrency(val) },
      axisTicks: { show: false },
      axisBorder: { show: false },
    }],
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light',
      y: {
        formatter: (val) => formatCurrency(val),
        title: { formatter: () => '' }
      },
      marker: { show: false }
    }
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dashboard/earnings-chart`,
          { withCredentials: true }
        );

        if (data.success) {
          setChartSeries(data.data.series);
        }
      } catch (error) {
        console.error("Failed to fetch earnings chart:", error);
      }
    };

    fetchChartData();
  }, [backendUrl]);

  return <Col xs={12} lg={8}>
    <Card className="shadow h-100">
      <CardHeader className="p-4 border-bottom">
        <h5 className="card-header-title">Courses Revenue (Last 6 Months)</h5>
      </CardHeader>
      <CardBody>
        <ReactApexChart
          height={400}
          series={chartSeries}
          type="area"
          options={chartConfig}
        />
      </CardBody>
    </Card>
  </Col>;
};

export default Earnings;