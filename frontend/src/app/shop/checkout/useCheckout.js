import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useCartDetail from '../cart/useCartDetails';

const useCheckout = () => {
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
        if(paymentMethod === 'free') setPaymentMethod('');
    }
  }, [finalTotal]);

  useEffect(() => {
    if (!selectedIds || selectedIds.length === 0) {
      toast.warning("Please select items from cart first.");
      navigate('/student/cart');
    }
  }, [selectedIds, navigate]);

  const isNoSelectedIds = !selectedIds || selectedIds.length === 0;

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

  return {
    displayedCourses,
    displayedSubTotal,
    couponCode,
    setCouponCode,
    onApplyCouponClick,
    handleRemoveCoupon,
    appliedCoupon,
    isApplyingCoupon,
    couponDiscountAmount,
    finalTotal,
    paymentMethod,
    setPaymentMethod,
    onPlaceOrder,
    isFreeOrder,
    isNoSelectedIds,
  };
};

export default useCheckout;