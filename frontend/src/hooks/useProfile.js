import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setLogout } from "@/redux/authSlice";
import { resetCart } from "@/redux/cartSlice";
import { clearWishlist } from "@/redux/wishlistSlice";
import { handleRequest } from "@/utils/request";
import { authApi } from "@/utils/api";

export default function useProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.userData);

  const logout = async () => {
    const res = await handleRequest(authApi.post("/auth/logout"));
    if (!res.success) {
      toast.error("Unable to forget you..😞");
      console.log("Logout Err:", res.message);
    }
    dispatch(setLogout());
    dispatch(resetCart);
    dispatch(clearWishlist);
    navigate("/home");
    toast.success("Logged out!");
  };

  return {
    user,
    logout,
  };
}