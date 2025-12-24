import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { FaSearch, FaSlidersH } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Pagination from './Pagination';
import CourseFilter from './CourseFilter';
import useToggle from '@/hooks/useToggle';
import useViewPort from '@/hooks/useViewPort';
import CourseCard from "@/components/CourseCard";

import useCourseList from '../useCourseList';

const Courses = () => {
  const { isTrue, toggle } = useToggle();
  const { width } = useViewPort();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    allCourses,
    total,
    page,
    setPage,
    limit,
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort,
    loading,
    price,
    setPrice,
    level,
    setLevel,
    language,
    setLanguage,
    clearFilters,
  } = useCourseList();

  // local debounced search input
  const [searchInput, setSearchInput] = useState(search);

  // sync local input when global search changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // debounce committing the value to search
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = searchInput?.trim() || '';
      if (q !== (search || '')) {
        setSearch(q);
        setPage(1);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [searchInput, search, setSearch, setPage]);

  // hydrate state from URL
  useEffect(() => {
    // read all values from URL
    const paramSearch = searchParams.get("search") || "";
    const paramCategory = searchParams.get("category") || "";
    const paramSort = searchParams.get("sort") || "newest";
    const paramLevel = searchParams.get("level") || "";
    const paramPrice = searchParams.get("price") || "";
    const paramLanguage = searchParams.get("language") || "";

    // batch update the state (if exists in URL)
    if (paramSearch) setSearch(paramSearch);
    if (paramCategory) setCategory(paramCategory);
    if (paramSort) setSort(paramSort);
    if (paramLevel) setLevel(paramLevel === 'All' ? '' : paramLevel);
    if (paramPrice) setPrice(paramPrice);
    if (paramLanguage) setLanguage(paramLanguage);

    // if any filter exists, reset to page 1
    setPage(1);

    // mark init from URL done
    setIsInitialized(true);
  }, [searchParams]);

  // update URL when filters change
  useEffect(() => {
    // no changing URL if not done initing
    if (!isInitialized) return;

    const params = {};
    if (search?.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (sort && sort !== 'newest') params.sort = sort;
    if (level) params.level = level;
    if (price) params.price = price;
    if (language) params.language = language;

    // use "replace: true" to not create unnecessary history entries while searching
    setSearchParams(params, { replace: true });

  }, [search, category, sort, level, price, language, isInitialized, setSearchParams]);

  const onSearchClick = (e) => {
    e.preventDefault();
    const q = searchInput?.trim() || '';
    if (q !== (search || '')) {
      setSearch(q);
      setPage(1);
    }
  };

  const showingFrom = total ? (page - 1) * limit + (allCourses.length ? 1 : 0) : 0;
  const showingTo = (page - 1) * limit + allCourses.length;
  const totalResult = total;
  const hasFilter = category || search || price || level || language || sort !== "newest";

  return (
    <section className="py-5">
      <Container>
        <Row>
          <Col lg={8} xl={9}>
            <Row className="mb-4 align-items-center">
              <Col xl={6}>
                <form
                  className="border rounded p-2"
                  onSubmit={(e) => {
                    e.preventDefault(); // blocks page reload
                    onSearchClick(e);   // triggers search logic
                  }}
                >
                  <div className="input-group input-borderless">
                    <input
                      className="form-control me-1"
                      type="search"
                      placeholder="Find your course"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary mb-0 rounded z-index-1"
                      onClick={onSearchClick}
                    >
                      <FaSearch />
                    </button>
                  </div>
                </form>
              </Col>

              <Col xl={3} className="mt-3 mt-xl-0">
                <form className="border rounded p-2 input-borderless">
                  <ChoicesFormInput
                    className="form-select form-select-sm js-choice border-0"
                    aria-label=".form-select-sm"
                    value={sort}
                    onChange={(value) => {
                      setSort(value);
                      setPage(1);
                    }}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="mostPopular">Most Popular</option>
                    <option value="ratingHighToLow">Rating: High to Low</option>
                    <option value="priceHighToLow">Price: High to Low</option>
                    <option value="priceLowToHigh">Price: Low to High</option>
                  </ChoicesFormInput>
                </form>
              </Col>

              <Col
                xs={12}
                xl={3}
                className="d-flex justify-content-between align-items-center mt-3 mt-xl-0"
              >
                <Button
                  variant="primary"
                  onClick={toggle}
                  className="mb-0 d-lg-none"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasSidebar"
                  aria-controls="offcanvasSidebar"
                >
                  <FaSlidersH className="me-1" /> Show filter
                </Button>
                <p className="mb-0 text-end">
                  Showing {showingFrom}-{showingTo} of {totalResult} result
                </p>
              </Col>
            </Row>

            <Row className="g-4">
              {loading && <Col xs={12}><p>Loading courses...</p></Col>}
              {!loading && allCourses.length === 0 && (
                <Col xs={12}>
                  <p>No courses found matching your criteria.</p>
                </Col>
              )}
              {!loading && allCourses?.map((course, idx) => (
                <Col sm={6} xl={4} key={course._id || idx}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>

            <Col xs={12}>
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
                <CourseFilter
                  category={category}
                  setCategory={setCategory}
                  price={price}
                  setPrice={setPrice}
                  level={level}
                  setLevel={setLevel}
                  language={language}
                  setLanguage={setLanguage}
                />
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
                  <CourseFilter
                    category={category}
                    setCategory={setCategory}
                    price={price}
                    setPrice={setPrice}
                    level={level}
                    setLevel={setLevel}
                    language={language}
                    setLanguage={setLanguage}
                  />
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
