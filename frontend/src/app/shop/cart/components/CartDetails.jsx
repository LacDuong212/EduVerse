import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Container, Row, Form, Spinner } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import EmptyCartPage from '@/app/shop/empty-cart/page';
import useCartDetail from '../useCartDetails';
import { formatCurrency } from '@/utils/currency';

const CartCard = ({ item, isSelected, onSelect, onRemove }) => {
  return (
    <tr>
      <td style={{ width: '5%' }}>
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
              src={item.thumbnail || '/placeholder-course.png'}
              className="rounded"
              alt="courseImage"
              style={{ width: '100px', height: 'auto', objectFit: 'cover' }}
            />
          </div>
          <h6 className="mb-0 ms-lg-3 mt-2 mt-lg-0">
            <Link to={`/courses/${item.courseId}`}>{item.title || 'Untitled Course'}</Link>
          </h6>
        </div>
      </td>
      <td className="text-center">
        <h5 className="text-success mb-0">
          {formatCurrency(item.discountPrice ?? item.price ?? 0)}
        </h5>
        {(item.discountPrice && item.discountPrice < item.price) && (
          <small className="text-muted text-decoration-line-through">
            {formatCurrency(item.price)}
          </small>
        )}
      </td>
      <td>
        <button
          className="btn btn-sm btn-danger-soft px-2 mb-0"
          onClick={onRemove}
          title="Remove from cart"
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
    toggleSelect,
    toggleSelectAll,
    removeFromCart,
    handleClearCart,
    reloadCart,
    loading
  } = useCartDetail();

  const isEmpty = items.length === 0;

  const selectedTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const itemId = item.courseId || item._id;
      if (selected.includes(itemId)) {
        return total + (Number(item.discountPrice ?? item.price ?? 0) || 0);
      }
      return total;
    }, 0);
  }, [items, selected]);

  if (loading && isEmpty) {
    return (
      <Container className="pt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (isEmpty) {
    return <EmptyCartPage />;
  }

  return (
    <section className="pt-5">
      <Container>
        <Row className="g-4 g-sm-5">
          <Col lg={8} className="mb-4 mb-sm-0">
            <Card className="card-body p-4 shadow">
              <div className="table-responsive border-0 rounded-3">
                <table className="table align-middle p-4 mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th style={{ width: '5%' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selected.length === items.length && items.length > 0}
                          onChange={toggleSelectAll}
                          title="Select All"
                        />
                      </th>
                      <th>Course</th>
                      <th className="text-center">Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {items.map((item) => (
                      <CartCard
                        key={item.courseId || item._id}
                        item={item}
                        isSelected={selected.includes(item.courseId || item._id)}
                        onSelect={() => toggleSelect(item.courseId || item._id)}
                        onRemove={() => removeFromCart([item.courseId || item._id])}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <Row className="g-3 mt-2 border-top pt-4 align-items-center justify-content-end">
                <Col className="text-end d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-danger"
                    className="mb-0"
                    onClick={handleClearCart}
                  >
                    <i className="bi bi-trash me-1"></i> Clear Cart
                  </Button>

                  <Button
                    variant="primary"
                    className="mb-0"
                    onClick={reloadCart}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> Update
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="card-body p-4 shadow position-sticky top-0">
              <h4 className="mb-3">Order Summary</h4>
              <ul className="list-group list-group-borderless mb-2">
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="h6 fw-light mb-0">Selected Items</span>
                  <span className="h6 fw-light mb-0 fw-bold">
                    {selected.length}
                  </span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between border-top mt-3 pt-3">
                  <span className="h5 mb-0">Total</span>
                  <span className="h5 mb-0 text-primary">
                    {formatCurrency(selectedTotal)}
                  </span>
                </li>
              </ul>

              <div className="d-grid mt-3">
                {selected.length > 0 ? (
                  <Link
                    to="/student/checkout"
                    state={{
                      selectedIds: selected
                    }}
                    className="btn btn-lg btn-success"
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <Button variant="secondary" disabled className="btn-lg">
                    Select items to checkout
                  </Button>
                )}
              </div>

              <p className="small mb-0 mt-2 text-center text-muted">
                * Coupons can be applied at checkout step.
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  )
};

export default CartDetails;
