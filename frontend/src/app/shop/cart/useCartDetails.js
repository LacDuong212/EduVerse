// shop/cart/useCartDetails.js
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { setCart } from "@/redux/cartSlice";

export default function useCartDetails() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Luôn đọc từ state.cart.items để thống nhất shape
  const rawItems = useSelector((state) => state.cart.items ?? []);
  console.log("Raw cart items from state:", rawItems);
  // Chỉ giữ item hợp lệ có courseId
  const items = rawItems.filter((i) => i?.courseId);

  const [selected, setSelected] = useState([]);

  // Derived states (không memo nếu không cần tối ưu sớm)
  const isEmpty = items.length === 0;
  const isSelecting = selected.length > 0;
  const isAllSelected = items.length > 0 && selected.length === items.length;

  const displayedCourses = isSelecting
    ? items.filter((c) => selected.includes(c.courseId))
    : items;

  const displayedTotal = displayedCourses.reduce(
    (sum, c) => sum + (c.discountPrice ?? c.price ?? 0),
    0
  );

  // Actions
  const refetchCart = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/cart`, {
        withCredentials: true,
      });
      if (data?.success) {
        const normalized = Array.isArray(data.cart)
          ? data.cart
          : data.cart?.items ?? [];
        dispatch(setCart(normalized));
        return { success: true, items: normalized };
      } else {
        toast.error(data?.message || "Không tải được giỏ hàng");
        return { success: false };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return { success: false, error };
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === items.length ? [] : items.map((i) => i.courseId)
    );
  };

  const removeFromCart = async (courseIds) => {
    try {
      const ids = Array.isArray(courseIds) ? courseIds : [courseIds];
      for (const courseId of ids) {
        await axios.delete(`${backendUrl}/api/cart/remove`, {
          data: { courseId },
          withCredentials: true,
        });
      }
      await refetchCart();
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Error removing items");
      return { success: false, error };
    }
  };

  const removeSelected = async () => {
    if (selected.length === 0) return { success: true };
    return await removeFromCart(selected);
  };

  const gotoCourses = () => navigate("/courses");

  return {
    // data
    items,
    selected,
    displayedCourses,
    displayedTotal,
    isSelecting,
    isAllSelected,
    isEmpty,
    // actions
    refetchCart,
    toggleSelect,
    toggleSelectAll,
    removeFromCart,
    removeSelected,
    gotoCourses,
  };
}
