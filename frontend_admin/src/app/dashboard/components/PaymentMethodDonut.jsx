import axios from 'axios';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';

const PAYMENT_COLORS = {
  MoMo: '#ae2070',
  VNPay: '#0064af',
  Free: '#22c55e',
};

const PaymentMethodDonut = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [theme] = useState(localStorage.getItem('EDUVERSE_THEME_KEY') || 'light');
  const [series, setSeries] = useState([]);
  const [labels, setLabels] = useState([]);

  const chartOptions = {
    chart: { type: 'donut' },
    labels,
    colors: labels.map(l => PAYMENT_COLORS[l] || '#94a3b8'),
    legend: { position: 'bottom' },
    dataLabels: {
      formatter: (val) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      theme: theme === 'dark' ? 'dark' : 'light',
      y: { formatter: (val) => `${val} orders` }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
            }
          }
        }
      }
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dashboard/payment-method-chart`,
          { withCredentials: true }
        );
        if (data.success) {
          setSeries(data.data.series);
          setLabels(data.data.labels);
        }
      } catch (error) {
        console.error('Failed to fetch payment method chart:', error);
      }
    };
    fetchData();
  }, [backendUrl]);

  return (
    <Col xs={12} lg={4}>
      <Card className="shadow h-100">
        <CardHeader className="p-4 border-bottom">
          <h5 className="card-header-title mb-0">Orders by Payment Method</h5>
        </CardHeader>
        <CardBody className="d-flex align-items-center justify-content-center">
          {series.length > 0 && (
            <ReactApexChart
              height={320}
              series={series}
              type="donut"
              options={chartOptions}
              width="100%"
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default PaymentMethodDonut;
