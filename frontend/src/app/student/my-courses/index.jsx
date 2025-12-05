import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import PageMetaData from '@/components/PageMetaData';
import { Button, Card, CardBody, CardHeader, Col, ProgressBar, Row } from 'react-bootstrap';
import { BsArrowRepeat, BsCheck, BsPlayCircle } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';
import { useMyCourses } from './useMyCourses';
import { useNavigate } from "react-router-dom";
import Counter from './Counter';

const CourseRow = ({
  _id,
  completedLectures,
  image,
  name,
  totalLectures,
  firstLectureId,
  hasPreview,
}) => {
  const navigate = useNavigate();

  const percentage =
    totalLectures > 0 ? Math.trunc((completedLectures * 100) / totalLectures) : 0;

 const gotoLearning = () => {
  navigate(`/student/courses/${_id}`);
};

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <div className="w-100px">
            <img src={image} className="rounded" alt="courses" />
          </div>

          <div className="flex-grow-1 ms-2">
            <h6 className="mb-1 text-truncate">
              <span
                className="text-decoration-none text-primary"
                style={{ cursor: "pointer" }}
                onClick={gotoLearning}
              >
                {name}
              </span>
            </h6>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small">Progress</span>
                <h6 className="mb-0 text-end">{percentage}%</h6>
              </div>

              <ProgressBar
                now={percentage}
                className="progress progress-sm bg-opacity-10 aos"
                data-aos="slide-right"
                data-aos-delay={200}
                data-aos-duration={1000}
                data-aos-easing="ease-in-out"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      </td>

      <td className="text-center">{totalLectures}</td>
      <td className="text-center">{completedLectures}</td>
      <td>
        {percentage === 100 ? (
          <Button  
    
            className="icons-center"
            onClick={gotoLearning}
           variant="light" size="sm" >
            <BsArrowRepeat className="me-1 icons-center" />
            Restart
          </Button>
        ) : (
          <Button
            variant="primary-soft"
            size="sm"
            className="icons-center"
            onClick={gotoLearning}
          >
            <BsPlayCircle className="me-1" />
            Continue
          </Button>
        )}
      </td>
    </tr>
  );
};


const StudentMyCourses = () => {

  const { courseData, pagination, loading, fetchMyCourses, stats } = useMyCourses();


  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMyCourses(page);
    }
  };

  return (
    <>
      <PageMetaData title="My Courses" />
      <Card className="bg-transparent border rounded-3">
        {/* <CardHeader className="bg-transparent border-bottom">
          <Row className="g-3 align-items-center justify-content-between">
            <Col md={8}>
              <form className="rounded position-relative">
                <input className="form-control pe-5 bg-transparent" type="search" placeholder="Search" aria-label="Search" />
                <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="submit">
                  <FaSearch className="fs-6 " />
                </button>
              </form>
            </Col>
            <Col md={4}>
              <form> <ChoicesFormInput className="form-select js-choice border-0 z-index-9 bg-transparent" aria-label=".form-select-sm">
                <option>Sort by</option>
                <option value="free">Free</option>
                <option value="newest">Newest</option>
                <option value="mostPopular">Most Popular</option>
                <option value="levelDesc">Level Descending</option>
              </ChoicesFormInput>
              </form>
            </Col>
          </Row>
        </CardHeader> */}

        <CardBody>
          <Counter stats={stats} loading={loading} />
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3">Loading your courses...</p>
            </div>
          ) : (
            <div className="table-responsive border-0">
              <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
                <thead>
                  <tr>
                    <th scope="col">Course Title</th>
                    <th scope="col">Total Lectures</th>
                    <th scope="col">Completed Lectures</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courseData.length > 0 ? (
                    courseData.map((item, idx) => (
                      <CourseRow key={idx} {...item} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-5">
                        You don’t own any courses yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-4">
              <p className="mb-0 text-center text-sm-start">
                Showing page {pagination.page} of {pagination.totalPages}
              </p>
              <ul className="pagination pagination-sm pagination-primary-soft mb-0">
                <li className={`page-item ${pagination.page === 1 && "disabled"}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <FaAngleLeft />
                  </button>
                </li>

                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${pagination.page === i + 1 ? "active" : ""
                      }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${pagination.page === pagination.totalPages && "disabled"
                    }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    <FaAngleRight />
                  </button>
                </li>
              </ul>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default StudentMyCourses;
