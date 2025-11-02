import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { earningChat } from '../data';
import axios from 'axios';

const Earnings = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [chartOptions, setChartOptions] = useState(earningChat);
  const [chartSeries, setChartSeries] = useState(earningChat.series);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const { data } = await axios.get(`${backendUrl}/api/admin/earnings-chart`, config);

        if (data.success) {
          const { series, categories } = data.data;

          setChartSeries(series);
          setChartOptions(prevOptions => ({
            ...prevOptions,
            xaxis: {
              ...prevOptions.xaxis,
              categories: categories
            }
          }));
        }
      } catch (error) {
        console.error("Failed to fetch earnings chart:", error);
      }
    };

    fetchChartData();
  }, []);

  return <Col xs={12}>
    <Card className="shadow h-100">
      <CardHeader className="p-4 border-bottom">
        <h5 className="card-header-title">Earnings (Last 12 Months)</h5>
      </CardHeader>
      <CardBody>
        <ReactApexChart
          height={400}
          series={chartSeries}
          type="area"
          options={chartOptions}
        />
      </CardBody>
    </Card>
  </Col>;
};

export default Earnings;