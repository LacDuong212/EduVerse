import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchCart, removeFromCart, clearCart } from "@/redux/cartSlice";

export default function useCartDetail(initialSelectedIds = []) {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { items = [], status } = useSelector((state) => state.cart);
  const [selected, setSelected] = useState(initialSelectedIds);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCart());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (items.length > 0) {
      setSelected((prev) => prev.filter((id) => items.some((item) => item.courseId === id)));
    } else {
      setSelected([]);
    }
  }, [items]);

  const isSelecting = selected.length > 0;

  const handleReloadCart = useCallback(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const displayedCourses = useMemo(() => {
    return items.filter((c) => selected.includes(c.courseId));
  }, [items, selected]);

  const displayedSubTotal = useMemo(() => {
    return displayedCourses.reduce(
      (sum, c) => sum + (Number((c?.enableDiscount ? c?.discountPrice : c?.price) || 0) || 0),
      0
    );
  }, [displayedCourses]);

  const couponDiscountAmount = useMemo(() => {
    return appliedCoupon ? (displayedSubTotal * appliedCoupon.discountPercent) / 100 : 0;
  }, [appliedCoupon, displayedSubTotal]);

  const finalTotal = Math.max(0, displayedSubTotal - couponDiscountAmount);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map((i) => i.courseId));
  }, [items, selected.length]);

  const handleApplyCoupon = async (codeOverride = null) => {
    const codeToUse = codeOverride || couponCode;
    if (!codeToUse.trim()) return toast.info("Please enter a coupon code.");

    setIsApplyingCoupon(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/coupons/apply`,
        { code: codeToUse, originalPrice: displayedSubTotal },
        { withCredentials: true }
      );

      if (data.success) {
        setAppliedCoupon(data.result);
        toast.success(`Coupon ${data.result.couponCode} applied!`);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid coupon code..";
      toast.error(msg);
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveFromCart = async (courseIds = selected) => {
    if (!courseIds || courseIds.length === 0) {
      return toast.info("Please select items to remove!");
    }

    try {
      await dispatch(removeFromCart({ courseIds })).unwrap();

      toast.success("Items removed from cart.");
      setSelected([]);
      if (appliedCoupon) setAppliedCoupon(null);
    } catch (error) {
      toast.error(error || "Error removing items..");
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) return toast.info("Your cart is already empty.");
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;

    try {
      await dispatch(clearCart()).unwrap();
      setSelected([]);
      setAppliedCoupon(null);
      setCouponCode("");
      toast.success("Cart cleared!");
    } catch (error) {
      toast.error(error || "An error occurred..");
    }
  };

  const handleCheckout = async (paymentMethod) => {
    if (!displayedCourses.length) {
      toast.error("No items selected for checkout.");
      return null;
    }

    try {
      const payload = {
        selectedCourseIds: displayedCourses.map(c => c.courseId),
        paymentMethod,
        couponCode: appliedCoupon?.couponCode || null
      };

      const { data: orderData } = await axios.post(
        `${backendUrl}/api/orders`,
        payload,
        { withCredentials: true }
      );

      const order = orderData.result;

      if (order.totalAmount === 0) {
        toast.success("Course(s) enrolled successfully!");
        return { type: "redirect_internal", url: `/student/courses` };
      }

      toast.info("Creating payment...");
      const { data: paymentData } = await axios.post(
        `${backendUrl}/api/payments`,
        { orderId: order.orderId, paymentMethod },
        { withCredentials: true }
      );

      return { type: "redirect_external", url: paymentData.result.payUrl };

    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed..");
      return false;
    }
  };

  return {
    items,
    selected,
    isSelecting,
    displayedCourses,
    displayedSubTotal,
    displayedCount: displayedCourses.length,
    couponCode,
    setCouponCode,
    appliedCoupon,
    handleApplyCoupon,
    handleRemoveCoupon: () => { setAppliedCoupon(null); setCouponCode(""); },
    isApplyingCoupon,
    couponDiscountAmount,
    finalTotal,
    toggleSelect,
    toggleSelectAll,
    handleReloadCart,
    handleRemoveFromCart,
    handleClearCart,
    handleCheckout,
    loading: status === "loading"
  };
}