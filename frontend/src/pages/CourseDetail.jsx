import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
        if (data.success) {
          setCourse(data.course);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) {
    return <p className="text-center py-10">Loading...</p>;
  }

  return (
    <div>
      {/* Banner */}
      <div className="w-full h-64 md:h-96 bg-gray-200 relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            {course.title}
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tags */}
          {course.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 border-b pb-2">
            {["overview", "curriculum", "reviews", "instructor"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-2">About this course</h2>
                <p className="text-gray-700">{course.description}</p>
              </div>

              {/* Requirements & Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course.requirements?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <ul className="list-disc pl-5 text-gray-600 text-sm">
                      {course.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {course.outcomes?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">What you'll learn</h3>
                    <ul className="list-disc pl-5 text-gray-600 text-sm">
                      {course.outcomes.map((out, idx) => (
                        <li key={idx}>{out}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Curriculum</h2>
              {course.sections?.length > 0 ? (
                course.sections.map((section, idx) => (
                  <div key={idx} className="mb-4">
                    <h3 className="font-semibold">{section.title}</h3>
                    <ul className="ml-4 list-disc text-gray-600 text-sm">
                      {section.lectures.map((lec, i) => (
                        <li key={i}>
                          {lec.title} ({lec.duration} mins)
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No sections available.</p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Student Reviews</h2>
              <p className="text-gray-500">
                {course.rating?.average
                  ? `${course.rating.average} ★ (${course.rating.count} reviews)`
                  : "No reviews yet"}
              </p>
            </div>
          )}

          {activeTab === "instructor" && course.instructor && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Instructor</h2>
              <div className="flex items-center gap-4">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{course.instructor.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {course.instructor.bio || "No bio available."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          {/* Preview video */}
          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            {course.previewVideo ? (
              <iframe
                src={course.previewVideo.replace("watch?v=", "embed/")}
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

          {/* Price */}
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

          {/* Buy button */}
          <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium">
            Buy Now
          </button>

          {/* Students enrolled */}
          <p className="text-sm text-gray-600">
            👩‍🎓 {course.studentsEnrolled} students enrolled
          </p>

          {/* Features */}
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

          {/* Share */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Share this course</h3>
            <div className="flex gap-3 text-gray-600">
              <span>🔗 FB</span>
              <span>🔗 IG</span>
              <span>🔗 YT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
