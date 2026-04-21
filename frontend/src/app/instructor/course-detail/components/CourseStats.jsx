import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";
import { currency } from "@/contexts/constants";
import { formatCurrency } from "@/utils/currency";
import { useCourseEnrollments, useCourseRevenue  } from "../useMyCourseDetail";

const getCSSVar = (variable) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

const getChartOptions = (seriesData, categories, colorVar, isCurrency = false) => {
  return {
    series: [{
      name: "Value",
      data: seriesData
    }],
    chart: {
      height: 130,
      type: "area",
      sparkline: { enabled: true }, // sparkline hides axes (set to false to see dates on the bottom)
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    colors: [getCSSVar(colorVar)],
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.1,
      }
    },
    xaxis: {
      type: "category",
      categories: categories, // dates
      crosshairs: { width: 1 },
    },
    tooltip: {
      fixed: { enabled: false },
      x: { show: true }, // shows the date in tooltip
      y: {
        formatter: (val) => isCurrency ? `${val}${currency}` : val,
        title: { formatter: () => "" } // hides the series name in tooltip
      },
      marker: { show: false }
    }
  };
};

const getChangeDisplay = (dataArray, isCurrency = false) => {
  if (!dataArray || dataArray.length < 2) return "+0 vs. last month";

  const current = dataArray[dataArray.length - 1].value;
  const previous = dataArray[dataArray.length - 2].value;
  const diff = current - previous;

  if (diff > 0) {
    return (
      <>
        <span className="text-success me-1">+{isCurrency ? formatCurrency(diff) : diff} <BsArrowUp /></span> vs. last month
      </>
    );
  } else if (diff < 0) {
    return (
      <>
        <span className="text-danger me-1">{isCurrency ? formatCurrency(diff) : diff} <BsArrowDown /></span> vs. last month
      </>
    );
  } else {
    return (
      <>
        <span className="text-info">Unchanged</span> vs. last month
      </>
    );
  }
};

const CourseStats = ({ col = 6, courseId = "" }) => {
  // fetch data --
  const {
    data: revenueData,
    total: totalRevenue = 0,
    loading: revenueLoading
  } = useCourseRevenue(courseId, "month");

  const {
    data: enrollmentsData,
    total: totalEnrollments = 0,
    loading: enrollmentsLoading
  } = useCourseEnrollments(courseId, "month");

  // process revenue data --
  const revenueChartConfig = useMemo(() => {
    if (!revenueData || revenueData.length === 0) return null;

    const values = revenueData.map(item => item.value);

    const categories = revenueData.map(item => {
      const [year, month] = item.period.split("-");
      return `${month}/${year}`;
    });

    return getChartOptions(values, categories, "--bs-success", true);
  }, [revenueData]);

  // process enrollments data --
  const enrollmentsChartConfig = useMemo(() => {
    if (!enrollmentsData || enrollmentsData.length === 0) return null;

    const values = enrollmentsData.map(item => item.value);

    const categories = enrollmentsData.map(item => {
      const [year, month] = item.period.split("-");
      return `${month}/${year}`;
    });

    return getChartOptions(values, categories, "--bs-purple");
  }, [enrollmentsData]);

  // latest (current month) values --
  const latestRevenueValue = useMemo(() => {
    if (!revenueData || revenueData.length === 0) return 0;
    return revenueData[revenueData.length - 1].value || 0;
  }, [revenueData]);

  const latestEnrollmentsValue = useMemo(() => {
    if (!enrollmentsData || enrollmentsData.length === 0) return 0;
    return enrollmentsData[enrollmentsData.length - 1].value || 0;
  }, [enrollmentsData]);

  return (
    <Col xxl={col}>
      <Row className="g-4">
        {/* --- REVENUE CARD --- */}
        <Col md={6} xxl={12}>
          <Card className="bg-transparent border overflow-hidden">
            <CardHeader className="bg-light border-bottom d-flex justify-content-between">
              <h5 className="card-header-title mb-0">Total Revenue:</h5>
              <span className="h5 text-end mb-0">{formatCurrency(totalRevenue)}</span>
            </CardHeader>
            <CardBody className="p-0">
              <div className="d-sm-flex justify-content-between p-3">
                <h4 className="mb-0 me-3">
                  {revenueLoading ? "Loading..." : formatCurrency(latestRevenueValue)}
                </h4>
                <p className="mb-0">{getChangeDisplay(revenueData, true)}</p>
              </div>
              {!revenueLoading && revenueChartConfig ? (
                <ReactApexChart
                  height={130}
                  options={revenueChartConfig}
                  series={revenueChartConfig.series}
                  type="area"
                />
              ) : null}
            </CardBody>
          </Card>
        </Col>

        {/* --- ENROLLMENTS CARD --- */}
        <Col md={6} xxl={12}>
          <Card className="bg-transparent border overflow-hidden">
            <CardHeader className="bg-light border-bottom d-flex justify-content-between">
              <h5 className="card-header-title mb-0">Total Enrollments:</h5>
              <span className="h5 text-end mb-0">{totalEnrollments}</span>
            </CardHeader>
            <CardBody className="p-0">
              <div className="d-sm-flex justify-content-between p-3">
                <h4 className="mb-0">
                  {enrollmentsLoading ? "Loading..." : latestEnrollmentsValue}
                </h4>
                <p className="mb-0">{getChangeDisplay(enrollmentsData)}</p>
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