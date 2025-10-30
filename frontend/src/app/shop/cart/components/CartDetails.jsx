// shop/cart/components/CartDetails.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { BsXLg } from "react-icons/bs";
import icon02 from "@/assets/images/02.svg";
import useCartDetails from "../useCartDetails"; // <- với cấu trúc bạn chụp, đây là path đúng
// Nếu file hook ở chỗ khác, đổi lại: "@/hooks/useCartDetails"

function CartCard({ course, isChecked, onToggle, onRemove }) {
  const { thumbnail, title, discountPrice, courseId } = course;
  return (
    <tr>
      <td>
        <div className="d-lg-flex align-items-center">
          <input
            type="checkbox"
            className="form-check-input me-3"
            checked={isChecked}
            onChange={() => onToggle(courseId)}
          />
          <div className="w-100px w-md-80px mb-2 mb-md-0">
            <img
              src={thumbnail || "/course-placeholder.jpg"}
              className="rounded"
              alt="courseImage"
            />
          </div>
          <h6 className="mb-0 ms-lg-3 mt-2 mt-lg-0">
            <a href="#">{title}</a>
          </h6>
        </div>
      </td>

      <td className="text-center">
        <h5 className="text-success mb-0">${discountPrice ?? 0}</h5>
      </td>

      <td className="text-end">
        <button
          className="btn btn-sm btn-danger-soft px-2 mb-0"
          title="Remove from cart"
          onClick={() => onRemove([courseId])}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export default function CartDetails() {
  const {
    // data
    items,
    selected,
    displayedCourses,
    displayedTotal,      // tổng discountPrice
    isSelecting,
    isAllSelected,
    isEmpty,

    // actions
    toggleSelect,
    toggleSelectAll,
    removeFromCart,
    removeSelected,
    // handleCheckout,    // vẫn có nếu bạn muốn dùng sau
    gotoCourses,
  } = useCartDetails();

  // UI alert (giống mẫu)
  const [showAlert, setShowAlert] = useState(true);

  // Panel phải: Original / Discount / Total — TÍNH TRÊN FRONTEND, không sửa backend
  const originalTotal = useMemo(
    () => displayedCourses.reduce((sum, c) => sum + (c.price ?? c.discountPrice ?? 0), 0),
    [displayedCourses]
  );
  const couponDiscount = Math.max(0, originalTotal - displayedTotal);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <img src={icon02} alt="Empty Cart" className="w-40 h-40 mb-4" />
        <p className="text-lg fw-medium">Your cart is empty</p>
        <button
          onClick={gotoCourses}
          className="btn btn-primary px-4 py-2 mt-3 rounded-pill fw-medium"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <section className="pt-5">
      <Container>
        <Row className="g-4 g-sm-5">
          {/* LEFT */}
          <Col lg={8} className="mb-4 mb-sm-0">
            <Card className="card-body p-4 shadow">
              <Alert
                show={showAlert}
                onClose={() => setShowAlert(false)}
                className="alert alert-danger alert-dismissible d-flex justify-content-between align-items-center fade show py-3 pe-2"
                role="alert"
              >
                <div>
                  <span className="fs-5 me-1">🔥</span>
                  These courses are at a limited discount, please checkout within
                  <strong className="text-danger ms-1"> 2 days and 18 hours</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAlert(false)}
                  className="btn btn-link mb-0 text-primary-hover text-end"
                  aria-label="Close"
                >
                  <BsXLg />
                </button>
              </Alert>

              {/* Toolbar chọn tất cả / xóa đã chọn (giữ logic) */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="form-check">
                  <input
                    id="select-all"
                    type="checkbox"
                    className="form-check-input"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all" className="ms-2">
                    Select all
                  </label>
                </div>

                {isSelecting && (
                  <button className="btn btn-sm btn-danger" onClick={removeSelected}>
                    Remove selected
                  </button>
                )}
              </div>

              {/* Table như mẫu */}
              <div className="table-responsive border-0 rounded-3">
                <table className="table align-middle p-4 mb-0">
                  <tbody className="border-top-0">
                    {displayedCourses.map((item) => (
                      <CartCard
                        key={item.courseId}
                        course={item}
                        isChecked={selected.includes(item.courseId)}
                        onToggle={toggleSelect}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Coupon + Update (UI theo mẫu) */}
              <Row className="g-3 mt-2">
                <Col md={6}>
                  <div className="input-group">
                    <input className="form-control form-control" placeholder="COUPON CODE" />
                    <button type="button" className="btn btn-primary">
                      Apply coupon
                    </button>
                  </div>
                </Col>
                <Col md={6} className="text-md-end">
                  <button className="btn btn-primary mb-0" disabled>
                    Update cart
                  </button>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* RIGHT */}
          <Col lg={4}>
            <Card className="card-body p-4 shadow">
              <h4 className="mb-3">Cart Total</h4>
              <ul className="list-group list-group-borderless mb-2">
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="h6 fw-light mb-0">Original Price</span>
                  <span className="h6 fw-light mb-0 fw-bold">${originalTotal}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="h6 fw-light mb-0">Coupon Discount</span>
                  <span className="text-danger">-{couponDiscount > 0 ? `$${couponDiscount}` : "$0"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="h5 mb-0">Total</span>
                  <span className="h5 mb-0">${displayedTotal}</span>
                </li>
              </ul>

              {/* Nút giống mẫu: Link */}
              <div className="d-grid">
                <Link to="/shop/checkout" className="btn btn-lg btn-success">
                  Proceed to Checkout
                </Link>
              </div>

              <p className="small mb-0 mt-2 text-center">
                By completing your purchase, you agree to these{" "}
                <a href="#">
                  <strong>Terms of Service</strong>
                </a>
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}