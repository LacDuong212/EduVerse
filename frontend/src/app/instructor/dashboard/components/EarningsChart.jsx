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
        formatter: (val) => `${val}${currency}`,
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
          <span className="text-secondary me-1"><BsDash /></span>
        </>
      );
    }
  };

  return (
    <Col md={12} lg={col}>
      <Card className="bg-transparent border rounded-3 h-100">
        <CardHeader className="bg-transparent border-bottom">
          <h3 className="mb-0">Earnings Overview</h3>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">This Month</span>
              <h4 className="text-primary my-2">{`0${currency}`}</h4>
              <p className="mb-0">{earningsData?.length > 2
                ? getChangeDisplay(earningsData[earningsData.length - 1].value, earningsData[earningsData.length - 2].value)
                : getChangeDisplay(earningsData?.length === 1 ? earningsData[0].value : 0)
              }vs. last month</p>
            </Col>
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">On Average</span>
              <h4 className="my-2">{`0${currency}`}</h4>
              <p className="mb-0">{getChangeDisplay(avgEarnings, earningsData.length > 0 ? earningsData[earningsData.length - 1].value : 0)} vs. this month</p>
            </Col>
          </Row>
          <ReactApexChart height={300} series={chartOptions.series} type="area" options={chartOptions} />
        </CardBody>
      </Card>
    </Col>
  );
};

export default EarningsChart;
