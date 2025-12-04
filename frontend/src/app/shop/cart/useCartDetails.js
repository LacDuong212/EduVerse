import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { fetchCart, removeFromCart as removeFromCartAction, clearCart } from "@/redux/cartSlice";

function getId(item) {
  return item?.courseId || item?._id || item?.id;
}

export default function useCartDetail() {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { items = [], status } = useSelector((state) => state.cart);

  const [selected, setSelected] = useState([]);
  const isSelecting = selected.length > 0;

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map((i) => getId(i)));
  };

  const displayedCourses = isSelecting
    ? items.filter((c) => selected.includes(getId(c)))
    : items;

  const displayedTotal = displayedCourses.reduce(
    (sum, c) => sum + (Number(c?.discountPrice ?? c?.price ?? 0) || 0),
    0
  );
  const displayedCount = displayedCourses.length;

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
      
      toast.success("Cart cleared!");
    } catch (error) {
      console.error("Clear cart error:", error);
      const message = error?.message || "An error occurred while deleting the cart.";
      toast.error(message);
    }
  };

  const handleCheckout = async (paymentMethod) => {
    if (!displayedCourses.length) {
      toast.error('Your shopping cart is empty.');
      return false;
    }

    try {
      const { data: orderData } = await axios.post(
        `${backendUrl}/api/orders/create`,
        { cart: { courses: displayedCourses }, paymentMethod, },
        { withCredentials: true }
      );

      if (!orderData.success || !orderData.order?._id) {
        toast.error(orderData.message || 'Unable to create order.');
        return false;
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
        return false;
      }

      window.location.href = paymentData.payUrl;
      return true;
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
    displayedTotal,
    displayedCount,
    toggleSelect,
    toggleSelectAll,
    removeFromCart,
    handleClearCart,
    handleCheckout,
    reloadCart: () => dispatch(fetchCart()),
    loading: status === 'loading'
  };
}
