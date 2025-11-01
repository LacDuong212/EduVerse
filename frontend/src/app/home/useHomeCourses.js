import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setHomeCourses } from "@/redux/coursesSlice";

export default function useHomeCourses() {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Guard: thiếu ENV thì báo ngay
    if (!backendUrl) {
      toast.error("VITE_BACKEND_URL is missing");
      return;
    }

    const ac = new AbortController();

    (async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/courses/home`, {
          // Bật nếu backend dùng cookie/session (CORS)
          withCredentials: true,
          signal: ac.signal,
        });

        // Validate shape trước khi dispatch
        const data = res?.data || {};
        const payload = {
          newest: Array.isArray(data.newest) ? data.newest : [],
          bestSellers: Array.isArray(data.bestSellers) ? data.bestSellers : [],
          topRated: Array.isArray(data.topRated) ? data.topRated : [],
          biggestDiscounts: Array.isArray(data.biggestDiscounts) ? data.biggestDiscounts : [],
        };

        dispatch(setHomeCourses(payload));
      } catch (error) {
        if (axios.isCancel(error)) return;
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Error fetching home courses";
        toast.error(msg);
        // Optionally, clear về rỗng để UI phản ứng đúng
        dispatch(setHomeCourses({ newest: [], bestSellers: [], topRated: [], biggestDiscounts: [] }));
      }
    })();

    return () => ac.abort();
  }, [dispatch, backendUrl]);
}
