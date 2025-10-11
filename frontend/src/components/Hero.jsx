import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full min-h-[700px] flex flex-col items-center justify-center text-center bg-gray-200 px-6">
      {/* Tiêu đề */}
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
        Learn Anytime, Anywhere with{" "}
        <span className="text-blue-600">EduVerse</span>
      </h1>

      {/* Mô tả */}
      <p className="mt-6 text-gray-600 text-lg md:text-xl max-w-2xl">
        Empower your future with knowledge. Learn new skills from expert instructors anytime, anywhere.
      </p>

      {/* Nút */}
      <div className="mt-8">
        <button
          onClick={() => navigate("/courses")}
          className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition"
        >
          Explore Courses
        </button>
      </div>
    </section>
  );
};

export default Hero;
