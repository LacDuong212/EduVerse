import { Col, Container, Row } from 'react-bootstrap';
import useCourseDetail from '../useCourseDetail';
import Reviews from './Reviews';
import { Card, CardBody } from 'react-bootstrap';


const Overview = () => {
  const { course, loading, error, refetch } = useCourseDetail();

  if (loading) {
    return <section className="bg-light py-0 py-sm-5">
      <Container>
        <Row className="py-5">
          <Col lg={8}>
            <h1>Loading...</h1>
          </Col>
        </Row>
      </Container>
    </section>;
  }

  if (error) {
    return <section className="bg-light py-0 py-sm-5">
      <Container>
        <Row className="py-5">
          <Col lg={8}>
            <h1>Error loading course</h1>
            <button onClick={refetch}>Retry</button>
          </Col>
        </Row>
      </Container>
    </section>;
  }

  if (!course) return null;

  // const features = ['Digital marketing course introduction', 'Customer Life cycle', 'What is Search engine optimization(SEO)', 'Facebook ADS', 'Facebook Messenger Chatbot', 'Search engine optimization tools', 'Why SEO', 'URL Structure', 'Featured Snippet', 'SEO tips and tricks', 'Google tag manager'];
  return <>
    <fieldset className="border border-2 p-3 pt-1 rounded mb-3">
      <legend className="h4 float-none w-auto px-1 mb-0">
        Description
      </legend>
      <div>
        {course?.description ? (
          <div
            className="clamped-html"
            dangerouslySetInnerHTML={{
              __html: course.description.replace(/&nbsp;/g, ' ')
            }}
          />
        ) : (
          <span>(No full description)</span>
        )}
      </div>
    </fieldset>

    <Card className="shadow-sm border-0 rounded-3">
      <CardBody className="p-4">
        <Reviews />
      </CardBody>
    </Card>


    {/* <h5 className="mt-4">What you’ll learn</h5>
      <ul className="list-group list-group-borderless mb-3">
        {features.map((feature, idx) => <li className="list-group-item h6 fw-light d-flex mb-0" key={idx}>
            <FaCheckCircle className="text-success me-2" />
            {feature}
          </li>)}
      </ul>
      <p className="mb-0">
        As it so contrasted oh estimating instrument. Size like body someone had. Are conduct viewing boy minutes warrant the expense? Tolerably
        behavior may admit daughters offending her ask own. Praise effect wishes change way and any wanted. Lively use looked latter regard had. Do he
        it part more last in.
      </p> */}
  </>;
};
export default Overview;
