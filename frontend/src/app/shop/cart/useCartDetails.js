import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

// Sửa path này cho đúng cartSlice của bạn
import { setCart } from "@/redux/cartSlice";

/** Lấy id thống nhất (phòng sau này shape đổi) */
function getId(item) {
  return item?.courseId ?? item?.id ?? item?._id ?? item?.course?._id ?? item?.course?.id;
}

/** Ép mọi kiểu payload về mảng */
function toArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (raw && Array.isArray(raw.courses)) return raw.courses;
  return [];
}

export default function useCartDetail() {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Lấy đúng giỏ từ Redux: state.cart.items
  const { items: storeItems = [] } = useSelector((state) => state.cart || {});
  const items = toArray(storeItems); // luôn là mảng

  const [selected, setSelected] = useState([]); // nếu bạn có UI chọn nhiều
  const isSelecting = selected.length > 0;

  /** Load giỏ lần đầu nếu store đang rỗng */
  useEffect(() => {
    if (!items.length) {
      reloadCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Refetch giỏ và đẩy vào Redux (QUAN TRỌNG: setCart nhận MẢNG) */
  const reloadCart = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/cart`, {
        withCredentials: true,
      });
      // Với response bạn cung cấp: data.cart là MẢNG
      const next = toArray(data?.cart ?? data);
      dispatch(setCart(next));
      // reset selected để tránh lọc rỗng khi id đã xoá
      setSelected([]);
      return true;
    } catch {
      toast.error("Không tải được giỏ hàng.");
      return false;
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map((i) => getId(i)));
  };

  // Danh sách hiển thị (nếu có chọn thì lọc theo selected)
  const displayedCourses = isSelecting
    ? items.filter((c) => selected.includes(getId(c)))
    : items;

  const displayedTotal = displayedCourses.reduce(
    (sum, c) => sum + (Number(c?.discountPrice ?? c?.price ?? 0) || 0),
    0
  );
  const displayedCount = displayedCourses.length;

  /** Xoá 1 hoặc nhiều courseId (mặc định theo selected) */
  const removeFromCart = async (courseIds = selected) => {
    if (!courseIds.length) return;
    try {
      for (const courseId of courseIds) {
        await axios.delete(`${backendUrl}/api/cart/remove`, {
          data: { courseId },
          withCredentials: true,
        });
      }
      await reloadCart();
    } catch {
      toast.error("Error removing items");
    }
  };

  /** Checkout theo danh sách đang hiển thị (giữ contract cũ) */
  const handleCheckout = async (paymentMethod) => {
    if (!displayedCourses.length) {
      toast.error('Giỏ hàng của bạn đang rỗng.');
      return false;
    }

    try {
      const { data: orderData } = await axios.post(
        `${backendUrl}/api/orders/create`,
        { cart: { courses: displayedCourses }, paymentMethod, },
        { withCredentials: true }
      );

      if (!orderData.success || !orderData.order?._id) {
        toast.error(orderData.message || 'Không thể tạo đơn hàng.');
        return false;
      }
      const orderId = orderData.order._id;

      toast.info('Đang tạo yêu cầu thanh toán...');

      const { data: paymentData } = await axios.post(
        `${backendUrl}/api/payments/create`, // <-- API mới của bạn
        {
          orderId,
          paymentMethod,
        },
        { withCredentials: true }
      );

      if (!paymentData.payUrl) {
        toast.error(paymentData.message || 'Không thể tạo link thanh toán.');
        return false;
      }

      // --- BƯỚC 3: Chuyển hướng người dùng đến cổng thanh toán ---
      window.location.href = paymentData.payUrl;
      return true; // (Chuyển hướng sẽ xảy ra trước khi hàm này trả về)
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
    handleCheckout,
    reloadCart,
  };
}
