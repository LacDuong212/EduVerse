import { useEffect, useState } from "react";
import { Badge, Button, Spinner } from "react-bootstrap";
import { FaCartPlus, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { addToCart } from "@/redux/cartSlice";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";
import { formatCurrency } from "@/utils/currency";

const MAX_UPSELL = 4;

const UpsellCard = ({ course, onAdd, adding }) => {
  const price = course.enableDiscount ? course.discountPrice : course.price;
  const averageRating =
    course.ratingTotal && course.ratingCount
      ? (course.ratingTotal / course.ratingCount).toFixed(1)
      : null;

  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom">
      <Link to={`/courses/${course.courseId}`} className="flex-shrink-0">
        <img
          src={course.thumbnail || DEFAULT_COURSE_IMG}
          alt={course.title}
          onError={(e) => (e.target.src = DEFAULT_COURSE_IMG)}
          style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 6 }}
        />
      </Link>

      <div className="flex-grow-1 overflow-hidden">
        <Link
          to={`/courses/${course.courseId}`}
          className="text-decoration-none fw-semibold text-truncate d-block"
          title={course.title}
          style={{ fontSize: "0.9rem" }}
        >
          {course.title}
        </Link>
        <div className="small text-body" style={{ fontSize: "0.78rem" }}>
          {course.instructor?.name}
        </div>
        {averageRating && (
          <div className="small text-body" style={{ fontSize: "0.78rem" }}>
            <FaStar className="text-warning me-1" style={{ marginBottom: 2 }} />
            {averageRating}
          </div>
        )}
      </div>

      <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0">
        {course.enableDiscount && (
          <span className="text-body text-decoration-line-through" style={{ fontSize: "0.75rem" }}>
            {formatCurrency(course.price)}
          </span>
        )}
        <span className="fw-bold text-success" style={{ fontSize: "0.95rem" }}>
          {course.isFree ? "Free" : formatCurrency(price)}
        </span>
        <Button
          size="sm"
          variant="outline-primary"
          className="mb-0 px-2 py-1"
          style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
          onClick={() => onAdd(course.courseId)}
          disabled={adding === course.courseId}
        >
          {adding === course.courseId ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <>
              <FaCartPlus className="me-1" />
              Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const CartUpsell = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, userData } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || userData?.role !== "student") return;

    let cancelled = false;
    setLoading(true);

    authApi
      .get("/courses/recommendations")
      .then((res) => {
        if (cancelled) return;
        const all = res.data?.result?.courses || [];
        const cartIds = new Set(cartItems.map((i) => i.courseId));
        const filtered = all.filter((c) => !cartIds.has(c.courseId)).slice(0, MAX_UPSELL);
        setCourses(filtered);
      })
      .catch(() => {
        // non-blocking — silently hide section on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userData?.role]);

  const handleAdd = async (courseId) => {
    setAdding(courseId);
    try {
      await dispatch(addToCart({ courseId })).unwrap();
      setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
      toast.success("Course added to cart!");
    } catch (err) {
      toast.error(err || "Failed to add course.");
    } finally {
      setAdding(null);
    }
  };

  if (!isLoggedIn || userData?.role !== "student") return null;
  if (loading) return null;
  if (courses.length === 0) return null;

  return (
    <div className="mt-5">
      <h5 className="mb-1">Students also bought</h5>
      <p className="small text-body mb-3">Based on your learning history</p>
      <div className="card shadow p-3">
        {courses.map((course) => (
          <UpsellCard
            key={course.courseId}
            course={course}
            onAdd={handleAdd}
            adding={adding}
          />
        ))}
      </div>
    </div>
  );
};

export default CartUpsell;
