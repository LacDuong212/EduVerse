import { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Row, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import momoImg from '@/assets/images/client/momo.svg';
import vnpayImg from '@/assets/images/client/vnpay.svg';
import { formatCurrency } from '@/utils/currency';
import useCartDetail from '../../cart/useCartDetails';

const CheckoutProductCard = ({ image, title, price, discountPrice }) => {
  return (
    <>
      <Row className="g-3 align-items-center">
        <Col sm={3}>
          <img className="rounded img-fluid" src={image} alt="course" style={{ maxHeight: '70px', objectFit: 'cover' }} />
        </Col>
        <Col sm={9}>
          <h6 className="mb-1 text-truncate">
            <Link to="#" className="text-decoration-none text-body">{title}</Link>
          </h6>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-success fw-bold">
              {formatCurrency(discountPrice ?? price ?? 0)}
            </span>
          </div>
        </Col>
      </Row>
      <hr className="my-3" />
    </>
  );
};

const CheckoutFrom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedIds } = location.state || {};

  const {
    displayedCourses,
    displayedSubTotal,
    handleCheckout,
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    handleRemoveCoupon,
    appliedCoupon,
    isApplyingCoupon,
    couponDiscountAmount,
    finalTotal
  } = useCartDetail(selectedIds);

  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (finalTotal === 0) {
      setPaymentMethod('free');
    } else {
      if (paymentMethod === 'free') setPaymentMethod('');
    }
  }, [finalTotal]);

  useEffect(() => {
    if (!selectedIds || selectedIds.length === 0) {
      toast.warning("Please select items from cart first.");
      navigate('/student/cart');
    }
  }, [selectedIds, navigate]);

  if (!selectedIds || selectedIds.length === 0) {
    return (
      <Container className="pt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Redirecting to cart...</p>
      </Container>
    );
  }

  const onApplyCouponClick = () => {
    handleApplyCoupon();
  };

  const onPlaceOrder = async () => {
    if (finalTotal > 0 && !paymentMethod) {
      return toast.error('Please select payment method');
    }

    const result = await handleCheckout(paymentMethod);

    if (result) {
      if (result.type === 'redirect_internal') {
        navigate(result.url);
      } else if (result.type === 'redirect_external') {
        window.location.href = result.url;
      }
    }
  };

  const isFreeOrder = finalTotal === 0;

  return (
    <section className="pt-5">
      <Container>
        <Row className="g-4 g-sm-5">
          <Col xl={8} className="mb-4 mb-sm-0">
            <Card className="card-body shadow p-4">
              <h4 className="mb-4">Select Payment Method</h4>

              {isFreeOrder ? (
                <div className="alert alert-success d-flex align-items-center">
                  <i className="bi bi-check-circle-fill fs-4 me-2"></i>
                  <div>
                    <h6 className="mb-0">Free Order</h6>
                    <small>No payment required. You will be enrolled immediately.</small>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {/* MOMO */}
                  <div
                    className={`border rounded p-3 d-flex align-items-center justify-content-between cursor-pointer ${paymentMethod === 'momo' ? 'border-primary bg-light' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center">
                      <Form.Check
                        type="radio"
                        name="payment"
                        id="momo"
                        checked={paymentMethod === 'momo'}
                        readOnly
                        className="me-3"
                      />
                      <label className="form-check-label fw-semibold cursor-pointer" htmlFor="momo">
                        Payment via MoMo Wallet
                      </label>
                    </div>
                    <img src={momoImg} alt="MOMO" className="rounded" style={{ width: '40px' }} />
                  </div>

                  {/* VNPAY */}
                  <div
                    className={`border rounded p-3 d-flex align-items-center justify-content-between cursor-pointer ${paymentMethod === 'vnpay' ? 'border-primary bg-light' : ''}`}
                    onClick={() => setPaymentMethod('vnpay')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center">
                      <Form.Check
                        type="radio"
                        name="payment"
                        id="vnpay"
                        checked={paymentMethod === 'vnpay'}
                        readOnly
                        className="me-3"
                      />
                      <label className="form-check-label fw-semibold cursor-pointer" htmlFor="vnpay">
                        Payment via VNPAY
                      </label>
                    </div>
                    <img src={vnpayImg} alt="VNPAY" className="rounded" style={{ width: '100px' }} />
                  </div>
                </div>
              )}
            </Card>
          </Col>

          <Col xl={4}>
            <Card className="card-body shadow p-4 mb-4 position-sticky top-0">
              <h4 className="mb-4">Order Summary</h4>

              <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {displayedCourses.map((item) => (
                  <CheckoutProductCard
                    key={item.courseId || item._id}
                    image={item.thumbnail || '/placeholder-course.png'}
                    title={item.title || 'Untitled'}
                    price={item.price}
                    discountPrice={item.discountPrice}
                  />
                ))}
              </div>

              <div className="mb-3">
                <label className="form-label">Discount Code</label>
                {appliedCoupon ? (
                  <div className="alert alert-success d-flex justify-content-between align-items-center py-2 px-3 small mb-0">
                    <span>
                      <i className="bi bi-tag-fill me-1"></i>
                      <strong>{appliedCoupon.couponCode}</strong> (-{appliedCoupon.discountPercent}%)
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0 text-decoration-none"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <InputGroup>
                    <Form.Control
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <Button
                      variant="primary"
                      onClick={onApplyCouponClick}
                      disabled={isApplyingCoupon || !couponCode}
                    >
                      {isApplyingCoupon ? <Spinner size="sm" /> : 'Apply'}
                    </Button>
                  </InputGroup>
                )}
              </div>

              <hr />

              {/* Tổng tiền */}
              <ul className="list-group list-group-borderless mb-2">
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="h6 fw-light mb-0">Subtotal</span>
                  <span className="h6 fw-light mb-0 fw-bold">{formatCurrency(displayedSubTotal)}</span>
                </li>
                {appliedCoupon && (
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="h6 fw-light mb-0 text-success">Discount</span>
                    <span className="text-success">-{formatCurrency(couponDiscountAmount)}</span>
                  </li>
                )}
                <li className="list-group-item px-0 d-flex justify-content-between border-top mt-2 pt-2">
                  <span className="h5 mb-0">Total</span>
                  <span className="h5 mb-0 text-primary">{formatCurrency(finalTotal)}</span>
                </li>
              </ul>

              <div className="d-grid mt-4">
                <Button
                  variant="success"
                  size="lg"
                  onClick={onPlaceOrder}
                  disabled={displayedCourses.length === 0}
                >
                  Place Order
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
export default CheckoutFrom;
