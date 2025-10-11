import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { setAllCourses, appendCourses } from "@/redux/coursesSlice";
import CourseCard from "@/components/CourseCard";
import InfiniteScroll from "react-infinite-scroll-component";

const CourseList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allCourses } = useSelector((state) => state.courses);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // local state
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // fetch API
  const fetchCourses = async (currentPage, reset = false) => {
  try {
    setLoading(true);
    const res = await axios.get(
      `${backendUrl}/api/courses?page=${currentPage}&limit=${limit}&category=${category}&search=${search}`
    );

    if (reset) {
      dispatch(setAllCourses(res.data.courses)); // reset khi đổi category/search
    } else {
      dispatch(appendCourses(res.data.courses)); // nối thêm khi scroll
    }

    setTotal(res.data.total);
  } catch (error) {
    toast.error(error.response?.data?.message || "Error fetching courses");
  } finally {
    setLoading(false);
  }
};

  // load lần đầu và khi filter/search đổi
  useEffect(() => {
    setPage(1);
    dispatch(setAllCourses([]));
    fetchCourses(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  // load thêm khi page tăng
  useEffect(() => {
    if (page > 1) {
      fetchCourses(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="relative md:px-36 px-12 pt-10 text-left">
      {/* Header */}
      <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800">Course List</h1>
          <p className="text-gray-500">
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Home
            </span>{" "}
            / <span>Course List</span>
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="Security">Security</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            {/* #TODO: auto fetch categories from API */}
          </select>
        </div>
      </div>

      {/* Courses với infinite scroll */}
      <InfiniteScroll
        dataLength={allCourses.length}
        next={() => setPage((prev) => prev + 1)}
        hasMore={allCourses.length < total}
        loader={<p className="text-center mt-6">Loading more...</p>}
        endMessage={
          <p className="text-center mt-12 mb-12 text-gray-500">
            All courses loaded
          </p>
        }
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,max-content))] justify-center gap-6 mt-10">
          {allCourses.length > 0 ? (
            allCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          ) : !loading ? (
            <p className="text-gray-500">No courses available.</p>
          ) : null}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default CourseList;
