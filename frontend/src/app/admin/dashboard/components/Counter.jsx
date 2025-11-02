import React, { useState, useEffect } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import axios from 'axios';
import { FaUserGraduate, FaUserTie, FaBook } from 'react-icons/fa';
import { TbCurrencyDong } from 'react-icons/tb'

const CounterCard = ({
  count,
  title,
  icon: Icon,
  suffix,
  variant
}) => {
  return <Card className={`card-body bg-${variant} bg-opacity-15 p-4 h-100`}>
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h2 className="purecounter mb-0 fw-bold">
          <CountUp end={count} suffix={suffix} delay={0.5} duration={2} />
        </h2>
        <span className="mb-0 h6 fw-light">{title}</span>
      </div>
      <div className={`icon-lg rounded-circle bg-${variant} text-white mb-0`}>{Icon && <Icon />}</div>
    </div>
  </Card>;
};
const Counter = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [counterData, setCounterData] = useState([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const { data } = await axios.get(`${backendUrl}/api/admin/dashboard-stats`, config);

        if (data.success) {
          const stats = data.data;

          const formattedData = [
            {
              title: "Total Students",
              count: stats.totalStudents,
              icon: FaUserGraduate,
              variant: "primary"
            },
            {
              title: "Total Instructors",
              count: stats.totalInstructors,
              icon: FaUserTie,
              variant: "purple"
            },
            {
              title: "Total Courses",
              count: stats.totalCourses,
              icon: FaBook,
              variant: "info"
            },
            {
              title: "Total Sales",
              count: stats.totalSales,
              icon: TbCurrencyDong,
              variant: "success"
            }
          ];
          setCounterData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (counterData.length === 0) {
    return null;
  }
  return <Row className="g-4 mb-4">
    {counterData.map((item, idx) => <Col md={6} xxl={3} key={idx}>
      <CounterCard {...item} />
    </Col>)}
  </Row>;
};
export default Counter;
