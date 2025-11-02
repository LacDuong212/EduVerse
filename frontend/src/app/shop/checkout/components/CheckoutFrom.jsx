import momoImg from '@/assets/images/client/momo.svg';
import vnpayImg from '@/assets/images/client/vnpay.svg';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import * as yup from 'yup';
import useCartDetail from '../../cart/useCartDetails';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/context/constants';

const CheckoutProductCard = ({
  image,
  title,
  price,
  onRemove
}) => {
  return <>
    <Row className="g-3">
      <Col sm={4}>
        <img className="rounded" src={image} alt="courses" />
      </Col>
      <Col sm={8}>
        <h6 className="mb-0">
          <a href="#">{title}</a>
        </h6>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-success">{formatCurrency(price)}</span>
          <div className="text-primary-hover">
            <button
              className="btn btn-link text-body p-0 me-2"
              onClick={onRemove}
            >
              <BsTrash className="me-1" />
              Remove
            </button>
          </div>
        </div>
      </Col>
    </Row>
    <hr />
  </>;
};
const CheckoutFrom = () => {
  const editEmailFormSchema = yup.object({
    name: yup.string().required('Please enter your name'),
    email: yup.string().email('Please enter valid email').required('Please enter your Email'),
    phoneNo: yup.number().required('Please enter your phone number'),
    postalCode: yup.string().required('Please enter your postal code'),
    address: yup.string().required('Please enter your address')
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(editEmailFormSchema),
  });
  const navigate = useNavigate();
  const { displayedCourses, displayedTotal, removeFromCart, handleCheckout } = useCartDetail();
  const originalTotal = displayedCourses.reduce(
    (sum, c) => sum + (Number(c?.price ?? 0) || 0),
    0
  );
  const couponDiscount = Math.max(
    0,
    originalTotal -
    displayedCourses.reduce(
      (sum, c) => sum + (Number(c?.discountPrice ?? c?.price ?? 0) || 0),
      0
    )
  );
  const totalToPay = displayedTotal;

  const handlePlaceOrder = async () => {
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    )?.value;

    if (!paymentMethod) {
      return toast.error('Vui lòng chọn phương thức thanh toán');
    }

    await handleCheckout(paymentMethod);
  }

  return <section className="pt-5">
    <Container>
      <Row className="g-4 g-sm-5">
        <Col xl={8} className="mb-4 mb-sm-0">
          <Card className="card-body shadow p-4">
            <Row className="g-3">
              <h5>Payment method</h5>
              <Col xs={12}>
                <div className="d-flex flex-column gap-3">
                  {/* MOMO */}
                  <div className="form-check border rounded p-3 d-flex align-items-center justify-content-between hover-shadow-sm">
                    <div className="d-flex align-items-center">
                      <input
                        className="form-check-input me-3"
                        type="radio"
                        name="payment"
                        id="momo"
                        value="momo"
                      />
                      <label className="form-check-label fw-semibold" htmlFor="momo">
                        Thanh toán qua MOMO
                      </label>
                    </div>
                    <img
                      src={momoImg}
                      alt="MOMO"
                      className="rounded ms-3"
                      style={{ width: '40px', height: 'auto' }}
                    />
                  </div>

                  {/* VNPAY */}
                  <div className="form-check border rounded p-3 d-flex align-items-center justify-content-between hover-shadow-sm">
                    <div className="d-flex align-items-center">
                      <input
                        className="form-check-input me-3"
                        type="radio"
                        name="payment"
                        id="vnpay"
                        value="vnpay"
                      />
                      <label className="form-check-label fw-semibold" htmlFor="vnpay">
                        Thanh toán qua VNPAY
                      </label>
                    </div>
                    <img
                      src={vnpayImg}
                      alt="VNPAY"
                      className="rounded ms-3"
                      style={{ width: '130px', height: 'auto' }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xl={4}>
          <Row className="mb-0">
            <Col md={6} xl={12}>
              <Card className="card-body shadow p-4 mb-4">
                <h4 className="mb-4">Order Summary</h4>
                <div className="mb-3">
                  {/* <div className="d-flex justify-content-between align-items-center">
                    <span>Transaction code</span>
                    <p className="mb-0 h6 fw-light">AB12365E</p>
                  </div> */}
                  <div className="input-group mt-2">
                    <input className="form-control form-control" placeholder="COUPON CODE" />
                    <button type="button" className="btn btn-primary">
                      Apply
                    </button>
                  </div>
                </div>
                <hr />
                {displayedCourses.map((item) => (
                  <CheckoutProductCard
                    key={item.courseId}
                    image={item.thumbnail || '/placeholder-course.png'}
                    title={item.title || 'Untitled'}
                    price={(item.discountPrice ?? item.price ?? 0).toFixed(2)}
                    onRemove={() => removeFromCart([item.courseId])}
                  />
                ))}
                <ul className="list-group list-group-borderless mb-2">
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="h6 fw-light mb-0">Original Price</span>
                    <span className="h6 fw-light mb-0 fw-bold">
                      {formatCurrency(originalTotal)}
                    </span>
                  </li>
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="h6 fw-light mb-0">Coupon Discount</span>
                    <span className="text-danger">
                      -{formatCurrency(couponDiscount)}
                    </span>
                  </li>
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="h5 mb-0">Total</span>
                    <span className="h5 mb-0">
                      {formatCurrency(totalToPay)}
                    </span>
                  </li>
                </ul>
                <div className="d-grid">
                  <Button variant="success" size="lg" onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                </div>
                <p className="small mb-0 mt-2 text-center">
                  By completing your purchase, you agree to these
                  <a href="#">
                    <strong>Terms of Service</strong>
                  </a>
                </p>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  </section>;
};
export default CheckoutFrom;
