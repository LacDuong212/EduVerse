import { useEffect, useState } from "react";
import {
  Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row
} from "react-bootstrap";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import CourseCard from "@/components/CourseCard";
import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import useToggle from "@/hooks/useToggle";
import useViewPort from "@/hooks/useViewPort";
import useCourseList from "../useCourseList";
import CourseFilter from "./CourseFilter";
import Pagination from "./Pagination";

const Courses = () => {
  const { isTrue, toggle } = useToggle();
  const { width } = useViewPort();

  const {
    loading,
    allCourses, total,
    page, setPage,
    limit,
    search, setSearch,
    category, setCategory,
    sort, setSort,
    price, setPrice,
    level, setLevel,
    language, setLanguage,
    clearFilters,
  } = useCourseList();

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const q = searchInput?.trim() || "";
      if (q !== (search || "")) {
        setSearch(q);
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [searchInput, search, setSearch]);

  const onSearchClick = (e) => {
    e.preventDefault();
    setSearch(searchInput?.trim() || "");
  };

  const showingFrom = total ? (page - 1) * limit + 1 : 0;
  const showingTo = Math.min(page * limit, total);
  const hasFilter = category || search || price || level || language || sort !== "newest";

  const props = {
    category, setCategory,
    price, setPrice,
    level, setLevel,
    language, setLanguage,
  };

  return (
    <section className="py-5">
      <Container>
        <Row>
          <Col lg={8} xl={9}>
            <Row className="align-items-center">
              <Col xl={6}>
                <form className="border rounded p-2" onSubmit={onSearchClick}>
                  <div className="input-group input-borderless">
                    <input
                      className="form-control me-1"
                      type="search"
                      placeholder="Find your course"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary mb-0 rounded z-index-1">
                      <FaSearch />
                    </button>
                  </div>
                </form>
              </Col>

              <Col xl={3} className="mt-3 mt-xl-0">
                <form className="border rounded p-2 input-borderless">
                  <ChoicesFormInput
                    name="sort"
                    className="form-select form-select-sm js-choice border-0"
                    aria-label=".form-select-sm"
                    value={sort}
                    onChange={(e) => setSort(e?.target?.value || "")}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="priceHighToLow">Price: High to Low</option>
                    <option value="priceLowToHigh">Price: Low to High</option>
                    <option value="mostPopular">Most Popular</option>
                    <option value="leastPopular">Least Popular</option>
                    <option value="ratingHighToLow">Rating: High to Low</option>
                    <option value="ratingLowToHigh">Rating: Low to High</option>
                  </ChoicesFormInput>
                </form>
              </Col>

              <Col xs={12} xl={3} className="d-flex justify-content-between align-items-center mt-3 mt-xl-0">
                <Button data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar"
                  variant="primary"
                  className="mb-0 d-lg-none"
                  onClick={toggle}
                >
                  <FaSlidersH className="me-1" /> Show Filters
                </Button>
                <p className="mb-0 text-end">
                  Showing {showingFrom}–{showingTo} of {total} results
                </p>
              </Col>
            </Row>

            <Col xs={12} className="my-3">
              <Pagination
                page={page}
                limit={limit}
                total={total}
                onChangePage={setPage}
              />
            </Col>

            <Row className="g-4">
              {loading ? (
                <Col xs={12} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </Col>
              ) : allCourses.length === 0 ? (
                <Col xs={12} className="text-center py-5">
                  <h4>No courses found.</h4>
                  <p>Try adjusting your filters or search terms.</p>
                </Col>
              ) : allCourses?.map((course, idx) => (
                <Col sm={6} xl={4} key={course.courseId || idx}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>

            <Col xs={12} className="mt-3">
              <Pagination
                page={page}
                limit={limit}
                total={total}
                onChangePage={setPage}
              />
            </Col>
          </Col>

          <Col lg={4} xl={3}>
            {width >= 992 ? (
              <>
                <CourseFilter props={props} />
                <div className="d-grid p-2 p-lg-0 text-center">
                  {hasFilter && (
                    <Button variant="primary" className="mb-0" onClick={clearFilters}>
                      Clear Filter
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <Offcanvas
                placement="end"
                show={isTrue}
                onHide={toggle}
                className="offcanvas-lg offcanvas-end"
                tabIndex={-1}
                id="offcanvasSidebar"
              >
                <OffcanvasHeader className="bg-light" title="Advance Filter" closeButton>
                  <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                    Advance Filter
                  </h5>
                </OffcanvasHeader>
                <OffcanvasBody className="p-3 p-lg-0">
                  <CourseFilter props={props} />
                </OffcanvasBody>
                <div className="d-grid p-2 p-lg-0 text-center">
                  {hasFilter && (
                    <Button variant="primary" className="mb-0" onClick={clearFilters}>
                      Clear Filter
                    </Button>
                  )}
                </div>
              </Offcanvas>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Courses;