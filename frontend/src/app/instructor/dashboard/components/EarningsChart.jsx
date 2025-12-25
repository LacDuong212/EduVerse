import { currency } from '@/context/constants';
import { formatCurrency } from '@/utils/currency';
import ReactApexChart from 'react-apexcharts';
import { Card, CardHeader, CardBody, Col, Row } from 'react-bootstrap';
import { BsArrowUp, BsArrowDown, BsDash } from 'react-icons/bs';


const EarningsChart = ({ col = 6, earningsData = [] }) => {
  const values = earningsData.map(item => item.value);

  const categories = earningsData.map(item => {
    const [year, month] = item.name.split('-');
    return `${month}/${year}`;
  });

  const chartOptions = {
    series: [{
      name: 'Earnings',
      data: values
    }],
    chart: {
      height: 300,
      type: 'area',
      toolbar: {
        show: false
      },
    },
    dataLabels: { enabled: true },
    stroke: { curve: 'smooth', width: 2 },
    colors: [
      getComputedStyle(document.documentElement).getPropertyValue('--bs-primary').trim()
    ],
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.1,
      }
    },
    xaxis: {
      type: 'category',
      categories: categories,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: [{
      axisTicks: {
        show: false
      },
      axisBorder: {
        show: false
      }
    }],
    tooltip: {
      fixed: { enabled: false },
      x: { show: true },
      y: {
        formatter: (val) => formatCurrency(val),
        title: { formatter: () => '' }
      },
      marker: { show: false }
    }
  }

  const avgEarnings = earningsData.map(item => item.value).reduce((a, b) => a + b, 0) / (earningsData.length || 1);

  const getChangeDisplay = (value1, value2) => {
    const diff = value1 - value2;

    if (diff > 0) {
      return (
        <>
          <span className="text-success me-1">+{formatCurrency(diff)} <BsArrowUp /></span>
        </>
      );
    } else if (diff < 0) {
      return (
        <>
          <span className="text-danger me-1">{formatCurrency(diff)} <BsArrowDown /></span>
        </>
      );
    } else {
      return (
        <>
          <span className="text-info"><BsDash /></span>
        </>
      );
    }
  };

  const thisMonthValue = earningsData.length > 0 ? earningsData[earningsData.length - 1].value : 0;
  const lastMonthValue = earningsData.length > 1 ? earningsData[earningsData.length - 2].value : 0;

  return (
    <Col md={12} lg={col}>
      <Card className="bg-transparent border rounded-3 h-100">
        <CardHeader className="bg-transparent border-bottom">
          <h5 className="mb-0">Revenue Overview</h5>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">This Month</span>
              <h4 className="text-primary my-2">{formatCurrency(thisMonthValue)}</h4>
              <p className="mb-0">
                {getChangeDisplay(thisMonthValue, lastMonthValue)} vs. last month
              </p>
            </Col>
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">On Average</span>
              <h4 className="my-2">{formatCurrency(avgEarnings)}</h4>
              <p className="mb-0">{getChangeDisplay(avgEarnings, thisMonthValue)} vs. this month</p>
            </Col>
          </Row>
          <ReactApexChart options={chartOptions} series={chartOptions.series} type="area" height={300} />
        </CardBody>
      </Card>
    </Col>
  );
};

export default EarningsChart;
