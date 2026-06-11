import axios from 'axios';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';

const TopCourses = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [theme] = useState(localStorage.getItem('EDUVERSE_THEME_KEY') || 'light');
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--bs-primary').trim();

  const chartOptions = {
    chart: { type: 'line', toolbar: { show: true } },
    stroke: { width: [0, 3], curve: 'smooth' },
    plotOptions: {
      bar: { columnWidth: '55%', borderRadius: 4 }
    },
    colors: [primaryColor, '#f59e0b'],
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        rotate: -35,
        style: { fontSize: '11px' },
        trim: true,
        maxHeight: 80,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: { text: 'Enrolled Students', style: { fontSize: '12px' } },
        labels: { formatter: (val) => Math.round(val) },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      {
        opposite: true,
        title: { text: 'Rating (0–5)', style: { fontSize: '12px' } },
        min: 0,
        max: 5,
        tickAmount: 5,
        labels: { formatter: (val) => val.toFixed(1) },
      }
    ],
    legend: { position: 'top' },
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light',
      shared: true,
      intersect: false,
      y: [
        { formatter: (val) => `${val} students` },
        { formatter: (val) => `${val} ★` }
      ]
    },
    markers: {
      size: [0, 5],
      strokeWidth: 2,
      hover: { size: 7 }
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dashboard/top-courses-chart`,
          { withCredentials: true }
        );
        if (data.success) {
          setSeries(data.data.series);
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch top courses chart:', error);
      }
    };
    fetchData();
  }, [backendUrl]);

  return (
    <Col xs={12}>
      <Card className="shadow">
        <CardHeader className="p-4 border-bottom">
          <h5 className="card-header-title mb-0">Top 10 Best-Selling Courses</h5>
          <p className="text-body small mb-0 mt-1">Enrollment volume vs. course rating</p>
        </CardHeader>
        <CardBody>
          {series.length > 0 && (
            <ReactApexChart
              height={420}
              series={series}
              type="line"
              options={chartOptions}
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default TopCourses;

