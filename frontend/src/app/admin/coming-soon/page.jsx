import comingSoonImg from '@/assets/images/element/coming-soon.svg';
import PageMetaData from '@/components/PageMetaData';
import { Col, Container, Row } from 'react-bootstrap';
const ComingSoonPage = () => {
  return <>
      <PageMetaData title="Coming Soon" />
      <main>
        <section className="pt-0 pt-lg-5 position-relative overflow-hidden my-auto">
          <figure className="position-absolute bottom-0 start-0">
            <svg width="822.2px" height="301.9px" viewBox="0 0 822.2 301.9">
              <path className="fill-warning opacity-5" d="M752.5,51.9c-4.5,3.9-8.9,7.8-13.4,11.8c-51.5,45.3-104.8,92.2-171.7,101.4c-39.9,5.5-80.2-3.4-119.2-12.1 c-32.3-7.2-65.6-14.6-98.9-13.9c-66.5,1.3-128.9,35.2-175.7,64.6c-11.9,7.5-23.9,15.3-35.5,22.8c-40.5,26.4-82.5,53.8-128.4,70.7 c-2.1,0.8-4.2,1.5-6.2,2.2L0,301.9c3.3-1.1,6.7-2.3,10.2-3.5c46.1-17,88.1-44.4,128.7-70.9c11.6-7.6,23.6-15.4,35.4-22.8 c46.7-29.3,108.9-63.1,175.1-64.4c33.1-0.6,66.4,6.8,98.6,13.9c39.1,8.7,79.6,17.7,119.7,12.1C634.8,157,688.3,110,740,64.6 c4.5-3.9,9-7.9,13.4-11.8C773.8,35,797,16.4,822.2,1l-0.7-1C796.2,15.4,773,34,752.5,51.9z" />
            </svg>
          </figure>
          <figure className="position-absolute top-0 end-0 d-none d-xl-block">
            <svg width="822.2px" height="301.9px" viewBox="0 0 822.2 301.9">
              <path className="fill-danger opacity-3" d="M752.5,51.9c-4.5,3.9-8.9,7.8-13.4,11.8c-51.5,45.3-104.8,92.2-171.7,101.4c-39.9,5.5-80.2-3.4-119.2-12.1 c-32.3-7.2-65.6-14.6-98.9-13.9c-66.5,1.3-128.9,35.2-175.7,64.6c-11.9,7.5-23.9,15.3-35.5,22.8c-40.5,26.4-82.5,53.8-128.4,70.7 c-2.1,0.8-4.2,1.5-6.2,2.2L0,301.9c3.3-1.1,6.7-2.3,10.2-3.5c46.1-17,88.1-44.4,128.7-70.9c11.6-7.6,23.6-15.4,35.4-22.8 c46.7-29.3,108.9-63.1,175.1-64.4c33.1-0.6,66.4,6.8,98.6,13.9c39.1,8.7,79.6,17.7,119.7,12.1C634.8,157,688.3,110,740,64.6 c4.5-3.9,9-7.9,13.4-11.8C773.8,35,797,16.4,822.2,1l-0.7-1C796.2,15.4,773,34,752.5,51.9z" />
            </svg>
          </figure>
          <Container className="position-relative p-0">
            <Row className="g-5 align-items-center justify-content-center">
              <Col lg={5}>
                <h1 className="mt-4 mt-lg-0">We are building something awesome!</h1>
                <p>Hey you! Eduport is coming. We are doing our best to launch our website and we will be back soon.</p>
                <div className="overflow-hidden mt-4">
                  <p className="mb-1 h6 fw-light text-start">Launch progress</p>
                  <div className="progress progress-md progress-percent-bg bg-light">
                    <div className="progress-bar progress-bar-striped bg-blue aos" data-aos="slide-right" data-aos-delay={200} data-aos-duration={1000} data-aos-easing="ease-in-out" role="progressbar" aria-valuenow={70} aria-valuemin={0} aria-valuemax={100} style={{
                    width: '70%'
                  }}>
                      <span className="progress-percent text-white">70%</span>
                    </div>
                  </div>
                </div>
                <form className="mt-4">
                  <h6>Notify me when website is launched</h6>
                  <div className="bg-body border rounded-2 p-2">
                    <div className="input-group">
                      <input className="form-control border-0 me-1" type="email" placeholder="Enter your email" />
                      <button type="button" className="btn btn-blue mb-0 rounded-2">
                        Notify Me!
                      </button>
                    </div>
                  </div>
                </form>
              </Col>
              <Col lg={7} className="text-center">
                <img src={comingSoonImg} className="h-200px h-sm-300px h-md-400px h-xl-600px" height={600} alt="coming Soon" />
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </>;
};
export default ComingSoonPage;
