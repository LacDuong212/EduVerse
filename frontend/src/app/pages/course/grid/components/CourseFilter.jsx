import useToggle from '@/hooks/useToggle';
import { Card, Col, Collapse } from 'react-bootstrap';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
const CourseFilter = () => {
  const {
    isTrue,
    toggle
  } = useToggle();
  const languages = ['English', 'Francas', 'Hindi', 'Russian', 'Spanish', 'Bengali', 'Portuguese'];
  return <form>
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Category</h4>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault9" />
              <label className="form-check-label" htmlFor="flexCheckDefault9">
                All
              </label>
            </div>
            <span className="small">(1256)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault10" />
              <label className="form-check-label" htmlFor="flexCheckDefault10">
                Development
              </label>
            </div>
            <span className="small">(365)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault11" />
              <label className="form-check-label" htmlFor="flexCheckDefault11">
                Design
              </label>
            </div>
            <span className="small">(156)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault12" />
              <label className="form-check-label" htmlFor="flexCheckDefault12">
                Accounting
              </label>
            </div>
            <span className="small">(65)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault17" />
              <label className="form-check-label" htmlFor="flexCheckDefault17">
                Translation
              </label>
            </div>
            <span className="small">(245)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault13" />
              <label className="form-check-label" htmlFor="flexCheckDefault13">
                Finance
              </label>
            </div>
            <span className="small">(184)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault14" />
              <label className="form-check-label" htmlFor="flexCheckDefault14">
                Legal
              </label>
            </div>
            <span className="small">(65)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault15" />
              <label className="form-check-label" htmlFor="flexCheckDefault15">
                Photography
              </label>
            </div>
            <span className="small">(99)</span>
          </div>
          <Collapse in={isTrue} className="multi-collapse">
            <div>
              <Card className="card-body p-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="flexCheckDefault16" />
                    <label className="form-check-label" htmlFor="flexCheckDefault16">
                      Writing
                    </label>
                  </div>
                  <span className="small">(178)</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="flexCheckDefault18" />
                    <label className="form-check-label" htmlFor="flexCheckDefault18">
                      Marketing
                    </label>
                  </div>
                  <span className="small">(104)</span>
                </div>
              </Card>
            </div>
          </Collapse>
          <a onClick={toggle} className=" p-0 mb-0 mt-2 btn-more d-flex align-items-center" data-bs-toggle="collapse" href="#multiCollapseExample1" role="button" aria-expanded="false" aria-controls="multiCollapseExample1">
            See
            {!isTrue ? <>
                <span className="see-more ms-1">more</span>
                <FaAngleDown className="ms-2" />
              </> : <>
                <span className=" ms-1">less</span>
                <FaAngleUp className="ms-2" />
              </>}
          </a>
        </Col>
      </Card>
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Price Level</h4>
        <ul className="list-inline mb-0">
          <li className="list-inline-item">
            <input type="radio" className="btn-check" name="options" id="option1" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="option1">
              All
            </label>
          </li>
          <li className="list-inline-item">
            <input type="radio" className="btn-check" name="options" id="option2" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="option2">
              Free
            </label>
          </li>
          <li className="list-inline-item">
            <input type="radio" className="btn-check" name="options" id="option3" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="option3">
              Paid
            </label>
          </li>
        </ul>
      </Card>
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Skill level</h4>
        <ul className="list-inline mb-0">
          <li className="list-inline-item mb-2">
            <input type="checkbox" className="btn-check" id="btn-check-12" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="btn-check-12">
              All levels
            </label>
          </li>
          <li className="list-inline-item mb-2">
            <input type="checkbox" className="btn-check" id="btn-check-9" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="btn-check-9">
              Beginner
            </label>
          </li>
          <li className="list-inline-item mb-2">
            <input type="checkbox" className="btn-check" id="btn-check-10" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="btn-check-10">
              Intermediate
            </label>
          </li>
          <li className="list-inline-item mb-2">
            <input type="checkbox" className="btn-check" id="btn-check-11" />
            <label className="btn btn-light btn-primary-soft-check" htmlFor="btn-check-11">
              Advanced
            </label>
          </li>
        </ul>
      </Card>
      <Card className="card-body shadow p-4 mb-4">
        <h4 className="mb-3">Language</h4>
        <ul className="list-inline mb-0 g-3">
          {languages.map((language, idx) => <li className="list-inline-item mb-2" key={idx}>
              <input type="checkbox" className="btn-check" id={`btn-check-lan-${idx}`} />
              <label className="btn btn-light btn-primary-soft-check" htmlFor={`btn-check-lan-${idx}`}>
                {language}
              </label>
            </li>)}
        </ul>
      </Card>
    </form>;
};
export default CourseFilter;
