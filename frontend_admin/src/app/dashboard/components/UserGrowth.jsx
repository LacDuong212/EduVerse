import axios from 'axios';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';

const UserGrowth = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [theme] = useState(localStorage.getItem('EDUVERSE_THEME_KEY') || 'light');
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  const chartOptions = {
    chart: { toolbar: { show: true }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors: [
      getComputedStyle(document.documentElement).getPropertyValue('--bs-success'),
      getComputedStyle(document.documentElement).getPropertyValue('--bs-warning'),
    ],
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: { formatter: (val) => Math.round(val) },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    legend: { position: 'top' },
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light',
    },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] }
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dashboard/user-growth-chart`,
          { withCredentials: true }
        );
        if (data.success) {
          setSeries(data.data.series);
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch user growth chart:', error);
      }
    };
    fetchData();
  }, [backendUrl]);

  return (
    <Col xs={12}>
      <Card className="shadow h-100">
        <CardHeader className="p-4 border-bottom">
          <h5 className="card-header-title mb-0">New User Registrations (Last 6 Months)</h5>
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

export default UserGrowth;
