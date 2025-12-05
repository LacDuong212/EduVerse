import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { fetchCart, removeFromCart as removeFromCartAction, clearCart } from "@/redux/cartSlice";

function getId(item) {
  return item?.courseId || item?._id || item?.id;
}

export default function useCartDetail(initialSelectedIds = []) {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { items = [], status } = useSelector((state) => state.cart);

  const [selected, setSelected] = useState(initialSelectedIds);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const isSelecting = selected.length > 0;

  useEffect(() => {
    if (items.length === 0) {
        dispatch(fetchCart());
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    if (items.length > 0) {
        setSelected(prev => prev.filter(id => items.find(i => getId(i) === id)));
    }
  }, [items]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map((i) => getId(i)));
  };

  const displayedCourses = useMemo(() => {
      if (selected.length > 0) {
          return items.filter((c) => selected.includes(getId(c)));
      }
      return items; 
  }, [items, selected]);

   const displayedSubTotal = useMemo(() => {
      return displayedCourses.reduce(
        (sum, c) => sum + (Number(c?.discountPrice ?? c?.price ?? 0) || 0),
        0
      );
  }, [displayedCourses]);

  const displayedCount = displayedCourses.length;

  const couponDiscountAmount = appliedCoupon
    ? (displayedSubTotal * appliedCoupon.discountPercent) / 100
    : 0;

  const finalTotal = Math.max(0, displayedSubTotal - couponDiscountAmount);

  const handleApplyCoupon = async (codeOverride = null) => {
    const codeToUse = codeOverride || couponCode;

    if (!codeToUse.trim()) {
      toast.info("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/coupons/apply`,
        {
          code: couponCode,
          originalPrice: displayedSubTotal
        },
        { withCredentials: true }
      );

      if (data.success) {
        setAppliedCoupon(data.data);
        toast.success(`Coupon ${data.data.couponCode} applied!`);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Invalid coupon code";
      toast.error(msg);
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const removeFromCart = async (courseIds = selected) => {
    if (!courseIds || courseIds.length === 0) {
      toast.info("Please select a course to delete!");
      return;
    }
    try {
      await Promise.all(
        courseIds.map((id) =>
          dispatch(removeFromCartAction({ courseId: id })).unwrap()
        )
      );

      toast.success("Courses removed from cart");
      setSelected([]);
      if (appliedCoupon) {
        setAppliedCoupon(null);
        toast.info("Cart updated, please re-apply coupon if needed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error removing items");
    }
  };

  const handleClearCart = async () => {
    if (!items || items.length === 0) {
      toast.info("Your shopping cart is empty.");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to delete the entire cart?");
    if (!isConfirmed) return;

    try {
      await dispatch(clearCart()).unwrap();

      setSelected([]);
      setAppliedCoupon(null);
      setCouponCode("");

      toast.success("Cart cleared!");
    } catch (error) {
      console.error("Clear cart error:", error);
      const message = error?.message || "An error occurred while deleting the cart.";
      toast.error(message);
    }
  };

  const handleCheckout = async (paymentMethod) => {
    const coursesToCheckout = displayedCourses; 

    if (!coursesToCheckout.length) {
      toast.error('Your shopping cart is empty or no items selected.');
      return null;
    }

    try {
      const payload = {
        cart: {
          courses: coursesToCheckout.map(c => ({ courseId: getId(c) }))
        },
        paymentMethod,
        couponCode: appliedCoupon?.couponCode || null
      };

      const { data: orderData } = await axios.post(
        `${backendUrl}/api/orders/create`,
        payload,
        { withCredentials: true }
      );

      if (!orderData.success || !orderData.order?._id) {
        toast.error(orderData.message || 'Unable to create order.');
        return null;
      }

      if (orderData.order.totalAmount === 0) {
        toast.success("Order created successfully!");
        return { type: 'redirect_internal', url: `/student/courses` };
      }

      const orderId = orderData.order._id;
      toast.info('Creating payment request...');

      const { data: paymentData } = await axios.post(
        `${backendUrl}/api/payments/create`,
        {
          orderId,
          paymentMethod,
        },
        { withCredentials: true }
      );

      if (!paymentData.payUrl) {
        toast.error(paymentData.message || 'Unable to generate payment link.');
        return null;
      }

      return { type: 'redirect_external', url: paymentData.payUrl };

    } catch (error) {
      console.error("Error during checkout:", error);
      const message = error.response?.data?.message || "An error occurred during checkout.";
      toast.error(message);
      return false;
    }
  };

  return {
    items,
    selected,
    isSelecting,
    displayedCourses,
    displayedSubTotal,
    displayedCount,
    couponCode,
    setCouponCode,
    appliedCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    isApplyingCoupon,
    couponDiscountAmount,
    finalTotal,

    toggleSelect,
    toggleSelectAll,
    removeFromCart,
    handleClearCart,
    handleCheckout,
    reloadCart: () => dispatch(fetchCart()),
    loading: status === 'loading'
  };
}
