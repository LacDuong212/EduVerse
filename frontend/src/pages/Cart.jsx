import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setCart } from "../redux/cartSlice";

// TODO: Remove comfirmation, "You might also like" Section
export default function CartPage() {
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === items.length) {
      setSelected([]); // deselect all
    } else {
      setSelected(items.map((i) => i.courseId)); // select all
    }
  };

  const removeFromCart = async (courseIds) => {
    try {
      // bulk remove each course
      for (const courseId of courseIds) {
        await axios.delete(`${backendUrl}/api/cart/remove`, {
          data: { courseId },
          withCredentials: true,
        });
      }
      // refetch cart after bulk removal
      const { data } = await axios.get(`${backendUrl}/api/cart`, {
        withCredentials: true,
      });
      if (data.success) {
        dispatch(setCart(data.cart));
        setSelected([]);
      }
    } catch (err) {
      toast.error("Error removing items");
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <img src="/empty-cart.png" alt="Empty Cart" className="w-40 h-40 mb-4" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <button
          onClick={() => navigate("/courses")}
          className="bg-blue-600 text-white px-6 py-2 mt-4 rounded-full font-medium hover:bg-blue-700 transition"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  const isSelecting = selected.length > 0;

  const displayedCourses = isSelecting
    ? items.filter(c => selected.includes(c.courseId))
    : items;

  const displayedTotal = displayedCourses.reduce((sum, c) => sum + c.discountPrice, 0);
  const displayedCount = displayedCourses.length;

  const handleCheckout = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/orders/create`, 
        { cart: { courses: displayedCourses } }, 
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Checkout successful!");
      } else {
        toast.error("Checkout failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during checkout.");
    }
  };

  return (
    <div className="container mx-auto px-3 py-23 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Cart items */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <h1 className="text-3xl font-bold">Your Shopping Cart</h1>

          <div className="flex items-center gap-4">
            {/* Remove Selected */}
            {selected.length > 0 && (
              <button
                className="text-red-500 text-sm px-3 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition"
                onClick={() => removeFromCart(selected)}
              >
                Remove ({selected.length})
              </button>
            )}

            {/* Select All */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Select All</span>
              <Checkbox
                checked={selected.length === items.length && items.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.courseId}
              className="flex items-center justify-between border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selected.includes(item.courseId)}
                  onCheckedChange={() => toggleSelect(item.courseId)}
                />
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-32 h-20 rounded object-cover"
                />
                <div>
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.category} • {item.level}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-lg">
                  ${item.discountPrice || item.price}
                </span>
                {item.discountPrice && (
                  <span className="text-sm line-through text-gray-400">
                    ${item.price}
                  </span>
                )}
                <button
                  onClick={() => removeFromCart([item.courseId])}
                  className="text-red-500 text-sm px-3 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-1">
        <div className="border rounded-lg p-6 bg-white shadow-md sticky top-23">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>

          <div className="flex justify-between mb-4">
            <span className="text-gray-600">
              {isSelecting ? "Selected Courses:" : "All Courses:"}
            </span>
            <span className="font-bold">{displayedCount}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-lg">
              ${displayedTotal.toFixed(2)}
            </span>
          </div>

          <Button className="w-full mb-3" disabled={displayedCount === 0} onClick={() => handleCheckout() }>
            Checkout {displayedCount > 0 && `(${displayedCount})`}
          </Button>

          <input
            type="text"
            placeholder="Enter coupon"
            className="w-full border rounded p-2 text-sm mb-2"
          />
          <Button variant="outline" className="w-full text-sm">
            Apply Coupon
          </Button>
        </div>
      </div>
    </div>
  );
}
