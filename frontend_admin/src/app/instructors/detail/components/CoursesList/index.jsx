import { Button, Spinner } from "react-bootstrap";
import { FaBook, FaRotateRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import PaginationBar from "@/components/PaginationBar";
import { DEFAULT_COURSE_IMG } from "@/context/constants";
import { formatCurrency } from "@/utils/currency";
import useAdminInstructorCourses from "./useAdminInstructorCourses";

const statusBadge = (status) => {
  const s = status?.toLowerCase();
  if (s === "live") return "success";
  if (s === "pending") return "warning";
  if (s === "rejected") return "orange";
  if (s === "blocked") return "purple";
  return "secondary";
};

const SkeletonRows = ({ count = 5 }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <tr key={i} className="skeleton-row">
        <td><div className="d-flex align-items-center gap-2"><span className="placeholder rounded" style={{ width: 60, height: 45, display: 'inline-block' }} /><span className="placeholder col-5 rounded" /></div></td>
        <td><span className="placeholder col-4 rounded" /></td>
        <td><span className="placeholder col-3 rounded" /></td>
        <td><span className="placeholder col-4 rounded" /></td>
      </tr>
    ))}
  </>
);

const CoursesList = ({ instructorId }) => {
  const { courses, pagination, loading, page, goToPage, refresh } = useAdminInstructorCourses(instructorId, 10);

  return (
    <div className="mt-5">
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="h4 mb-0">Courses ({pagination.total})</span>
        <Button variant="link" onClick={refresh} className="p-0 d-flex align-items-center mb-0">
          <FaRotateRight className="fs-5" />
        </Button>
      </div>

      <div className="table-responsive border rounded">
        <table className="table table-dark-gray align-middle mb-0 table-hover">
          <thead>
            <tr>
              <th className="border-0 rounded-start">Course</th>
              <th className="border-0 text-center">Status</th>
              <th className="border-0 text-center">Price</th>
              <th className="border-0 text-center rounded-end">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows count={5} />
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state-cell text-center">
                  <FaBook size={26} className="mb-2" />
                  <div className="fw-semibold">No courses found</div>
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id}>
                  <td>
                    <div className="d-flex align-items-center gap-3" style={{ minWidth: 220 }}>
                      <div className="flex-shrink-0 rounded border overflow-hidden" style={{ width: 60, height: 45 }}>
                        <img
                          src={course.image || DEFAULT_COURSE_IMG}
                          alt={course.title}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                          onError={(e) => { e.target.src = DEFAULT_COURSE_IMG; }}
                        />
                      </div>
                      <div>
                        <Link to={`/courses/${course._id}`} className="fw-medium text-decoration-none">
                          {course.title || "(No title)"}
                        </Link>
                        {course.subtitle && (
                          <div className="small text-truncate" style={{ maxWidth: 280 }}>{course.subtitle}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`badge text-${statusBadge(course.status)} bg-${statusBadge(course.status)} bg-opacity-15`}>
                      {course.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-end">
                    {!Number.isFinite(course.price) ? "-" : course.enableDiscount ? (
                      <div>
                        <div className="text-decoration-line-through small">{formatCurrency(course.price)}</div>
                        <div>{formatCurrency(course.discountPrice)}</div>
                      </div>
                    ) : formatCurrency(course.price)}
                  </td>
                  <td className="text-center small">
                    {course.updatedAt
                      ? new Date(course.updatedAt).toLocaleString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" })
                      : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-3">
          <PaginationBar
            page={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={10}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
};

export default CoursesList;
