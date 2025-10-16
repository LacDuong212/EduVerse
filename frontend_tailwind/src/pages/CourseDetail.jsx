import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-scroll";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setCart } from "../redux/cartSlice";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/courses/${id}`);
        if (data.success){
          setCourse(data.course)
          await axios.post(
            `${backendUrl}/api/courses/${id}/viewed`,
            {},
            { withCredentials: true }
          );
        };
      } catch (error) {
        console.error(error);
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) return <p className="text-center py-10">Loading...</p>;
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // dạng youtu.be/xxxx
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // dạng watch?v=xxxx
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }

    // dạng shorts/xxxx
    if (url.includes("shorts/")) {
      const videoId = url.split("shorts/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  };

  const dispatch = useDispatch();
  const handleAddToCart = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/add`,
        { courseId: id },
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setCart(res.data.cart)); // update Redux
        toast.success("Added to cart!");
      } else {
        toast.error(res.data.message || "Failed to add");
      }
    } catch (err) {
      toast.error("Error adding to cart");
      console.error(err);
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white mt-18 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">{course.title}</h1>
          {course.subtitle && (
            <p className="text-lg md:text-xl opacity-90">{course.subtitle}</p>
          )}

          <div className="flex items-center gap-3">
            {course.instructor?.avatar && (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <span className="font-medium">{course.instructor?.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
            <span>
              ⭐ {course.rating?.average || 0} ({course.rating?.count || 0} ratings)
            </span>
            <p className="text-sm ">
              👩‍🎓 {course.studentsEnrolled} students enrolled
            </p>
            <span>🌐 {course.language || "N/A"}</span>
            {course.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {course.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-white/20 px-2 py-1 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollspy Nav */}
      <div className="sticky top-0 z-20 bg-white shadow">
        <div className="max-w-7xl mx-auto flex gap-6 px-4 overflow-x-auto">
          {["overview", "curriculum", "instructor", "reviews"].map((section) => (
            <Link
              key={section}
              to={section}
              smooth={true}
              offset={-100}
              duration={500}
              className="cursor-pointer py-3 font-medium text-gray-600 hover:text-blue-600"
              activeClass="text-blue-600 border-b-2 border-blue-600"
              spy={true}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Content sections */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Overview */}
          <section id="overview">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-700">{course.description}</p>
          </section>

          {/* Curriculum */}
          <section id="curriculum">
            <h2 className="text-2xl font-semibold mb-4">Curriculum</h2>
            {course.sections?.length > 0 ? (
              course.sections.map((section, idx) => (
                <div key={idx} className="mb-4">
                  <h3 className="font-semibold">{section.title}</h3>
                  <ul className="ml-5 list-disc text-gray-600 text-sm">
                    {section.lectures.map((lec, i) => (
                      <li key={i}>
                        {lec.title} ({lec.duration} mins)
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No curriculum available.</p>
            )}
          </section>

          {/* Instructor */}
          <section id="instructor">
            <h2 className="text-2xl font-semibold mb-4">Instructor</h2>
            <div className="flex items-center gap-4">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{course.instructor.name}</h3>
                <p className="text-gray-600 text-sm">{course.instructor.bio}</p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews">
            <h2 className="text-2xl font-semibold mb-4">Student Reviews</h2>
            <p className="text-gray-500">
              {course.rating?.average
                ? `${course.rating.average} ★ (${course.rating.count} reviews)`
                : "No reviews yet"}
            </p>
          </section>
        </div>

        {/* Right column */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            {course.previewVideo ? (
              <iframe
                src={getEmbedUrl(course.previewVideo)}
                title="Preview Video"
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            ) : (
              <img
                src={course.thumbnail}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}

          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-green-600">
              ${course.discountPrice || course.price}
            </span>
            {course.discountPrice && (
              <>
                <span className="line-through text-gray-400 text-sm">
                  ${course.price}
                </span>
                <span className="text-red-500 font-medium">
                  {Math.round(
                    (1 - course.discountPrice / course.price) * 100
                  )}
                  % Off
                </span>
              </>
            )}
          </div>

          <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium">
            Buy Now
          </button>

          <button 
            className="w-full border border-gray-300 bg-white text-black py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
            onClick={handleAddToCart}
          >
            Add To Cart
          </button>

          <div>
            <h3 className="text-lg font-semibold mb-2">This Course Includes</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>✔ Money Back Guarantee</li>
              <li>✔ Access on all devices</li>
              <li>✔ Certificate of completion</li>
              <li>✔ {course.lecturesCount || 0} Lectures</li>
              <li>✔ {course.duration || 0} hours content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
