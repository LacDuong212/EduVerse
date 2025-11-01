import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { earningChat } from '../data';
const Earnings = () => {
  return <Col xs={12}>
      <Card className="shadow h-100">
        <CardHeader className="p-4 border-bottom">
          <h5 className="card-header-title">Earnings</h5>
        </CardHeader>
        <CardBody>
          <ReactApexChart height={400} series={earningChat.series} type="area" options={earningChat} />
        </CardBody>
      </Card>
    </Col>;
};
export default Earnings;
