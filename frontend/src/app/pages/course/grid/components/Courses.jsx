import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { FaSearch, FaSlidersH } from 'react-icons/fa';
import Pagination from './Pagination';
import CourseFilter from './CourseFilter';
import useToggle from '@/hooks/useToggle';
import useViewPort from '@/hooks/useViewPort';
import { useFetchData } from '@/hooks/useFetchData';
import { getAllCourses } from '@/helpers/data';
import CourseCard from './CourseCard';
const Courses = () => {
  const {
    isTrue,
    toggle
  } = useToggle();
  const {
    width
  } = useViewPort();
  const allCourses = useFetchData(getAllCourses);
  return <section className="py-5">
      <Container>
        <Row>
          <Col lg={8} xl={9}>
            <Row className="mb-4 align-items-center">
              <Col xl={6}>
                <form className="border rounded p-2">
                  <div className="input-group input-borderless">
                    <input className="form-control me-1" type="search" placeholder="Find your course" />
                    <button type="button" className="btn btn-primary mb-0 rounded z-index-1">
                      <FaSearch />
                    </button>
                  </div>
                </form>
              </Col>
              <Col xl={3} className="mt-3 mt-xl-0">
                <form className="border rounded p-2 input-borderless">
                  <ChoicesFormInput className="form-select form-select-sm js-choice border-0" aria-label=".form-select-sm">
                    <option>Most Viewed</option>
                    <option>Recently search</option>
                    <option>Most popular</option>
                    <option>Top rated</option>
                  </ChoicesFormInput>
                </form>
              </Col>
              <Col xs={12} xl={3} className="d-flex justify-content-between align-items-center mt-3 mt-xl-0">
                <Button variant="primary" onClick={toggle} className="mb-0 d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar">
                  <FaSlidersH className="me-1" /> Show filter
                </Button>
                <p className="mb-0 text-end">Showing 1-7 of 32 result</p>
              </Col>
            </Row>
            <Row className="g-4">
              {allCourses?.slice(0, 9)?.map((course, idx) => <Col sm={6} xl={4} key={idx}>
                  <CourseCard course={course} />
                </Col>)}
            </Row>
            <Col xs={12}>
              <Pagination />
            </Col>
          </Col>
          <Col lg={4} xl={3}>
            {width >= 992 ? <>
                <CourseFilter />
                <div className="d-grid p-2 p-lg-0 text-center">
                  <Button variant="primary" className="mb-0">
                    Filter Results
                  </Button>
                </div>
              </> : <Offcanvas placement="end" show={isTrue} onHide={toggle} className="offcanvas-lg offcanvas-end" tabIndex={-1} id="offcanvasSidebar">
                <OffcanvasHeader className="bg-light" title="Advance Filter" closeButton>
                  <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                    Advance Filter
                  </h5>
                </OffcanvasHeader>
                <OffcanvasBody className="p-3 p-lg-0">
                  <CourseFilter />
                </OffcanvasBody>
                <div className="d-grid p-2 p-lg-0 text-center">
                  <Button variant="primary" className="mb-0">
                    Filter Results
                  </Button>
                </div>
              </Offcanvas>}
          </Col>
        </Row>
      </Container>
    </section>;
};
export default Courses;
