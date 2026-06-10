import { useState, useEffect } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaUserTie, FaBook } from 'react-icons/fa';
import { FaDongSign } from "react-icons/fa6";

const CounterSkeleton = () => (
  <Row className="g-4 mb-4">
    {[...Array(4)].map((_, idx) => (
      <Col md={6} xxl={3} key={idx}>
        <Card className="card-body p-4 h-100">
          <div className="d-flex justify-content-between align-items-center">
            <div className="w-75">
              <div className="placeholder-glow mb-2">
                <span className="placeholder col-8 rounded" style={{ height: '2rem', display: 'block' }} />
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-5 rounded" />
              </div>
            </div>
            <div className="placeholder-glow">
              <span className="placeholder rounded-circle" style={{ width: '3rem', height: '3rem', display: 'block' }} />
            </div>
          </div>
        </Card>
      </Col>
    ))}
  </Row>
);

const CounterCard = ({
  count,
  title,
  icon: Icon,
  suffix,
  variant,
  to
}) => {
  return (
    <Link to={to} className="text-decoration-none d-block h-100">
      <Card className={`card-body p-4 h-100 counter-card border-start border-4 border-${variant}`} style={{ borderLeftWidth: '4px !important' }}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted small text-uppercase fw-bold mb-1 ls-wider">{title}</p>
            <h2 className="fw-bold mb-0" style={{ fontSize: '2rem', letterSpacing: '-0.03em' }}>
              <CountUp end={count} suffix={suffix} delay={0.5} duration={2} />
            </h2>
          </div>
          <div className={`rounded-3 p-2 bg-${variant} bg-opacity-15`} style={{ lineHeight: 0 }}>
            {Icon && <Icon className={`text-${variant}`} size={24} />}
          </div>
        </div>
      </Card>
    </Link>
  );
};
const Counter = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [counterData, setCounterData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/dashboard/dashboard-stats`,
          { withCredentials: true }
        );

        if (data.success) {
          const stats = data.data;

          const formattedData = [
            {
              title: "Active Students",
              count: stats.totalStudents,
              icon: FaUserGraduate,
              variant: "success",
              to: "/students"
            },
            {
              title: "Active Instructors",
              count: stats.totalInstructors,
              icon: FaUserTie,
              variant: "warning",
              to: "/instructors"
            },
            {
              title: "Active Courses",
              count: stats.totalCourses,
              icon: FaBook,
              variant: "primary",
              to: "/courses"
            },
            {
              title: "Total Revenue",
              count: stats.totalSales,
              icon: FaDongSign,
              variant: "purple",
              to: "/earnings"
            }
          ];
          setCounterData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <CounterSkeleton />;
  }

  if (counterData.length === 0) {
    return null;
  }
  return (
    <Row className="g-4 mb-4">
      {counterData.map((item, idx) => (
        <Col md={6} xxl={3} key={idx}>
          <CounterCard {...item} />
        </Col>
      ))}
    </Row>
  );
};
export default Counter;
