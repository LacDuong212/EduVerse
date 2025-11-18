import { useCourseEarnings, useCourseEnrollments } from '../useMyCourseDetail';
import { currency } from '@/context/constants';
import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col, Row, Spinner } from 'react-bootstrap';
import { BsArrowUp } from 'react-icons/bs';
import { courseEarningChart, courseEarningChart2 } from '../data';


// helper: get color variables safely
const getCSSVar = (variable) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

// helper: base chart options generator
const getChartOptions = (seriesData, categories, colorVar) => {
  return {
    series: [{
      name: 'Value',
      data: seriesData
    }],
    chart: {
      height: 130,
      type: 'area',
      sparkline: { enabled: true }, // Note: Sparkline hides axes. If you want to see dates on the bottom, set this to false.
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: [getCSSVar(colorVar)], // Dynamic color
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.1,
      }
    },
    xaxis: {
      type: 'category',
      categories: categories, // The dates go here
      crosshairs: { width: 1 },
    },
    tooltip: {
      fixed: { enabled: false },
      x: { show: true }, // Shows the date in tooltip
      y: {
        title: { formatter: () => '' } // Hides the series name in tooltip
      },
      marker: { show: false }
    }
  };
};

const CourseStats = ({ col = 6, courseId = '' }) => {
  // 1. Fetch Data
  const { 
    data: earningsData, 
    total: totalRevenue, 
    loading: earningsLoading 
  } = useCourseEarnings(courseId, 'month');

  const { 
    data: enrollmentsData, 
    total: totalEnrollments, 
    loading: enrollmentsLoading 
  } = useCourseEnrollments(courseId, 'month');

  // 2. Process Earnings Data
  const earningsChartConfig = useMemo(() => {
    if (!earningsData || earningsData.length === 0) return null;

    // Map 'value' for Y-axis
    const values = earningsData.map(item => item.value); 
    
    // Map 'name' (2024-11) to 'MM/yy' (11/24) for X-axis
    const categories = earningsData.map(item => {
        const [year, month] = item.name.split('-'); 
        return `${month}/${year}`; 
    });

    return getChartOptions(values, categories, '--bs-success');
  }, [earningsData]);

  // 3. Process Enrollments Data
  const enrollmentsChartConfig = useMemo(() => {
    if (!enrollmentsData || enrollmentsData.length === 0) return null;

    const values = enrollmentsData.map(item => item.value);
    
    const categories = enrollmentsData.map(item => {
        const [year, month] = item.name.split('-');
        return `${month}/${year}`;
    });

    return getChartOptions(values, categories, '--bs-purple');
  }, [enrollmentsData]);

  return (
    <Col xxl={col}>
      <Row className="g-4">
        {/* --- EARNINGS CARD --- */}
        <Col md={6} xxl={12}>
          <Card className="bg-transparent border overflow-hidden">
            <CardHeader className="bg-light border-bottom">
              <h5 className="card-header-title mb-0">Total Course Earning</h5>
            </CardHeader>
            <CardBody className="p-0">
              <div className="d-sm-flex justify-content-between p-4">
                <h4 className="text-blue mb-0">
                  {earningsLoading ? 'Loading...' : `${totalRevenue}${currency}`}
                </h4>
              </div>
              {!earningsLoading && earningsChartConfig ? (
                <ReactApexChart
                  height={130}
                  options={earningsChartConfig}
                  series={earningsChartConfig.series}
                  type="area"
                />
              ) : null}
            </CardBody>
          </Card>
        </Col>

        {/* --- ENROLLMENTS CARD --- */}
        <Col md={6} xxl={12}>
          <Card className="bg-transparent border overflow-hidden">
            <CardHeader className="bg-light border-bottom">
              <h5 className="card-header-title mb-0">New Enrollment This Month</h5>
            </CardHeader>
            <CardBody className="p-0">
              <div className="d-sm-flex justify-content-between p-4">
                <h4 className="text-blue mb-0">
                   {enrollmentsLoading ? 'Loading...' : totalEnrollments}
                </h4>
              </div>
              {!enrollmentsLoading && enrollmentsChartConfig ? (
                <ReactApexChart
                  height={130}
                  options={enrollmentsChartConfig}
                  series={enrollmentsChartConfig.series}
                  type="area"
                />
              ) : null}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Col>
  );
};

export default CourseStats;
