import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { setAllCourses, appendCourses } from "@/redux/coursesSlice";
import CourseCard from "@/components/CourseCard";
import InfiniteScroll from "react-infinite-scroll-component";

const ViewedCourses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allCourses } = useSelector((state) => state.courses);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch viewed courses
  const fetchViewedCourses = async (currentPage, reset = false) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${backendUrl}/api/courses/viewed?page=${currentPage}&limit=${limit}`,
        { withCredentials: true } // cần nếu dùng userAuth
      );

      if (reset) {
        dispatch(setAllCourses(res.data.courses));
      } else {
        dispatch(appendCourses(res.data.courses));
      }

      setTotal(res.data.total);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching viewed courses");
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu
  useEffect(() => {
    setPage(1);
    dispatch(setAllCourses([]));
    fetchViewedCourses(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load thêm khi page tăng
  useEffect(() => {
    if (page > 1) {
      fetchViewedCourses(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="relative md:px-36 px-8 pt-20 text-left">
      {/* Header */}
      <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800">Viewed Courses</h1>
          <p className="text-gray-500">
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Home
            </span>{" "}
            / <span>Viewed Courses</span>
          </p>
        </div>
      </div>

      {/* Courses với infinite scroll */}
      <InfiniteScroll
        dataLength={allCourses.length}
        next={() => setPage((prev) => prev + 1)}
        hasMore={allCourses.length < total}
        loader={<p className="text-center mt-6">Đang tải thêm...</p>}
        endMessage={
          <p className="text-center mt-6 text-gray-500">
            🎉 Đã tải hết khóa học đã xem
          </p>
        }
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,max-content))] justify-center gap-6 mt-10">
          {allCourses.length > 0 ? (
            allCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          ) : !loading ? (
            <p className="text-gray-500">Bạn chưa xem khóa học nào.</p>
          ) : null}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default ViewedCourses;
