import axios from 'axios';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { formatCurrency, formatCurrencyNumber } from '../../../utils/currency';

const TopInstructorsByRevenue = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [theme] = useState(localStorage.getItem('EDUVERSE_THEME_KEY') || 'light');
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '60%',
        distributed: true,
      }
    },
    colors: [getComputedStyle(document.documentElement).getPropertyValue('--bs-warning')],
    dataLabels: {
      enabled: true,
      formatter: (val) => formatCurrencyNumber(val),
      offsetX: 6,
      style: { fontSize: '12px' }
    },
    xaxis: {
      categories,
      labels: { formatter: (val) => formatCurrencyNumber(val) },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { maxWidth: 180, style: { fontSize: '12px' } }
    },
    legend: { show: false },
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light',
      y: { formatter: (val) => formatCurrency(val) }
    },
    grid: { xaxis: { lines: { show: false } } },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dashboard/top-instructors-revenue-chart`,
          { withCredentials: true }
        );
        if (data.success) {
          setSeries(data.data.series);
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch top instructors by revenue chart:', error);
      }
    };
    fetchData();
  }, [backendUrl]);

  return (
    <Col xs={12} lg={6}>
      <Card className="shadow h-100">
        <CardHeader className="p-4 border-bottom">
          <h5 className="card-header-title mb-0">Top 10 Instructors by Revenue</h5>
        </CardHeader>
        <CardBody>
          {series.length > 0 && (
            <ReactApexChart
              height={380}
              series={series}
              type="bar"
              options={chartOptions}
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default TopInstructorsByRevenue;
