import axios from 'axios';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';

const MonthlyEnrollments = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [theme] = useState(localStorage.getItem('EDUVERSE_THEME_KEY') || 'light');
  const [series, setSeries] = useState([]);

  const chartOptions = {
    chart: { toolbar: { show: true }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors: [getComputedStyle(document.documentElement).getPropertyValue('--bs-info')],
    xaxis: {
      type: 'category',
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: { formatter: (val) => Math.round(val) },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] }
    },
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light',
      y: { formatter: (val) => `${val} enrollments`, title: { formatter: () => '' } },
      marker: { show: false }
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dashboard/monthly-enrollments-chart`,
          { withCredentials: true }
        );
        if (data.success) setSeries(data.data.series);
      } catch (error) {
        console.error('Failed to fetch monthly enrollments chart:', error);
      }
    };
    fetchData();
  }, [backendUrl]);

  return (
    <Col xs={12} lg={8}>
      <Card className="shadow h-100">
        <CardHeader className="p-4 border-bottom">
          <h5 className="card-header-title mb-0">Monthly Enrollments (Last 6 Months)</h5>
        </CardHeader>
        <CardBody>
          <ReactApexChart
            height={350}
            series={series}
            type="area"
            options={chartOptions}
          />
        </CardBody>
      </Card>
    </Col>
  );
};

export default MonthlyEnrollments;
