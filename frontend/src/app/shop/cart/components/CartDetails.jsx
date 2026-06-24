import { Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { FaSyncAlt, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import EmptyCartPage from "@/app/shop/empty-cart/page";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";
import { formatCurrency } from "@/utils/currency";
import useCartDetail from "../useCartDetails";
import CartUpsell from "./CartUpsell";

const CartCard = ({ item, isSelected, onSelect, onRemove }) => {
  const hasDiscount = item.enableDiscount ?? false;
  const price = hasDiscount ? item.discountPrice : item.price;

  return (
    <tr>
      <td style={{ width: "5%" }}>
        <Form.Check
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
        />
      </td>
      <td>
        <div className="d-lg-flex align-items-center">
          <div className="w-100px w-md-80px mb-2 mb-md-0">
            <img
              src={item.image || DEFAULT_COURSE_IMG}
              className="rounded"
              alt="Image"
              onError={(e) => e.target.src = DEFAULT_COURSE_IMG}
              style={{ width: "100px", height: "auto", objectFit: "cover" }}
            />
          </div>
          <h6 className="mb-0 ms-lg-3 mt-2 mt-lg-0">
            <Link to={`/courses/${item.courseId}`}>{item.title || "Untitled"}</Link>
          </h6>
        </div>
      </td>
      <td className="text-end">
        {hasDiscount && (
          <small className="text-decoration-line-through">
            {formatCurrency(item.price)}
          </small>
        )}
        <div className="fw-bold text-success mb-0" style={{ fontSize: "1.15rem" }}>{formatCurrency(price)}</div>
      </td>
      <td className="text-center">
        <button
          className="btn btn-sm btn-danger-soft px-2 mb-0"
          onClick={onRemove}
          title="Remove from Cart"
        >
          <FaTimes size={14} />
        </button>
      </td>
    </tr>
  );
};

const CartDetails = () => {
  const {
    items,
    selected,
    isSelecting,
    displayedSubTotal,
    toggleSelect,
    toggleSelectAll,
    handleReloadCart,
    handleRemoveFromCart,
    handleClearCart,
    loading
  } = useCartDetail();

  if (loading && items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your cart...</p>
      </Container>
    );
  }

  if (items.length === 0) {
    return <EmptyCartPage />;
  }

  return (
    <section className="pt-5">
      <Container>
        <Row className="g-4 g-sm-5">
          <Col lg={8} className="mb-4 mb-sm-0">
            <Card className="card-body p-4 shadow">
              <div className="table-responsive">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center rounded-2">
                  <div className="d-flex">
                    <h4 className="mb-0">Shopping Cart ({items.length})</h4>
                    <Button
                      variant="outline"
                      className="text-primary px-1 py-0 ms-2 mb-0"
                      onClick={handleReloadCart}
                      title="Refresh Cart"
                    >
                      <FaSyncAlt size={18} />
                    </Button>
                  </div>
                  <Button
                    variant="outline-danger"
                    className="mb-0"
                    onClick={handleClearCart}
                  >
                    Clear
                  </Button>
                </Card.Header>

                <table className="table align-middle p-3 mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>
                        <Form.Check
                          type="checkbox"
                          checked={selected.length === items.length}
                          onChange={toggleSelectAll}
                          title="Select All"
                        />
                      </th>
                      <th>Course</th>
                      <th className="text-center">Price</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <CartCard
                        key={item.courseId}
                        item={item}
                        isSelected={selected.includes(item.courseId)}
                        onSelect={() => toggleSelect(item.courseId)}
                        onRemove={() => handleRemoveFromCart([item.courseId])}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="card p-4 shadow position-sticky top-0">
              <h4 className="mb-3">Order Summary</h4>
              <div className="fs-6 d-flex justify-content-between mb-2">
                Selected: <span>{selected.length} {selected.length === 1 ? "item" : "items"}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="h5 mb-0">Total</span>
                <span className="h4 mb-0 text-primary">{formatCurrency(displayedSubTotal)}</span>
              </div>

              <div className="d-grid">
                {isSelecting ? (
                  <Link
                    to="/student/checkout"
                    state={{ selectedIds: selected }}
                    className="btn btn-lg btn-primary"
                  >
                    Checkout
                  </Link>
                ) : (
                  <Button variant="outline" disabled className="btn-lg">
                    Select items to proceed
                  </Button>
                )}
              </div>

              <div className="mt-3 bg-light p-3 rounded">
                <p className="small mb-0">
                  <strong>Note:</strong> You can apply coupons and select payment methods in the next step.
                </p>
              </div>
            </Card>
          </Col>
        </Row>
        <CartUpsell />
      </Container>
    </section>
  )
};

export default CartDetails;