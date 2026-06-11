import axios from 'axios';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';

const CoursesByCategory = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [series, setSeries] = useState([]);

  const chartOptions = {
    chart: { type: 'treemap', toolbar: { show: false } },
    dataLabels: {
      enabled: true,
      style: { fontSize: '13px', fontWeight: '600' },
      formatter: (text, op) => [text, `${op.value.toLocaleString()} students`],
      offsetY: -4,
    },
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: true,
        shadeIntensity: 0.4,
      }
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const point = w.config.series[seriesIndex]?.data[dataPointIndex];
        if (!point) return '';
        const isDark = (localStorage.getItem('EDUVERSE_THEME_KEY') || 'light') === 'dark';
        const bg = isDark ? '#1e1e2d' : '#fff';
        const color = isDark ? '#e0e0e0' : '#333';
        const border = isDark ? '#333' : '#e0e0e0';
        return (
          `<div style="padding:10px 14px;background:${bg};color:${color};border:1px solid ${border};border-radius:6px;line-height:1.8;font-size:13px">` +
          `<div style="font-weight:600;margin-bottom:2px">${point.x}</div>` +
          `<div>👥 ${point.y.toLocaleString()} students</div>` +
          `<div>📚 ${point.courseCount ?? 0} course${point.courseCount !== 1 ? 's' : ''}</div>` +
          '</div>'
        );
      }
    },
    legend: { show: false },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dashboard/courses-by-category-chart`,
          { withCredentials: true }
        );
        if (data.success) setSeries(data.data.series);
      } catch (error) {
        console.error('Failed to fetch courses by category chart:', error);
      }
    };
    fetchData();
  }, [backendUrl]);

  return (
    <Col xs={12} lg={6}>
      <Card className="shadow h-100">
        <CardHeader className="p-4 border-bottom">
          <h5 className="card-header-title mb-0">Student Demand by Category</h5>
          <p className="text-body small mb-0 mt-1">Block size = total students enrolled</p>
        </CardHeader>
        <CardBody>
          {series.length > 0 && (
            <ReactApexChart
              height={380}
              series={series}
              type="treemap"
              options={chartOptions}
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default CoursesByCategory;

