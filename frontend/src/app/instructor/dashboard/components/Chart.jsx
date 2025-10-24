import { basicChartOpts } from '../data';
import ReactApexChart from 'react-apexcharts';
import { Card, Col, Row } from 'react-bootstrap';
import { BsArrowDown, BsArrowUp } from 'react-icons/bs';


const Chart = () => {
  return (
    <Row className="mt-5">
      <Col xs={12}>
        <Card className="card-body bg-transparent border p-4 h-100">
          <Row className="g-4">
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">Current Month</span>
              <h4 className="text-primary my-2">$35000</h4>
              <p className="mb-0">
                <span className="text-success me-1">
                  0.20%
                  <BsArrowUp className="bi bi-arrow-up" />
                </span>
                vs last month
              </p>
            </Col>
            <Col sm={6} md={4}>
              <span className="badge text-bg-dark">Last Month</span>
              <h4 className="my-2">$28000</h4>
              <p className="mb-0">
                <span className="text-danger me-1">
                  0.10%
                  <BsArrowDown className="bi bi-arrow-down" />
                </span>
                Then last month
              </p>
            </Col>
          </Row>
          <ReactApexChart height={300} series={basicChartOpts.series} type="area" options={basicChartOpts} />
        </Card>
      </Col>
    </Row>
  );
};

export default Chart;
