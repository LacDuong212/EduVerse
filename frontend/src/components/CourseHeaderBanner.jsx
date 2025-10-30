import React from "react";

const CourseHeaderBanner = ({ course }) => {
  if (!course) return null;

  return (
 <div className="bg-blue-300 text-white py-12 px-6 rounded-2xl shadow-md">         
  <div className="max-w-7xl mx-auto space-y-3">
        {/* Title & subtitle */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {course.title}
        </h1>
        {course.subtitle && (
          <p className="text-lg text-gray-600">{course.subtitle}</p>
        )}

        {/* Instructor, rating, students */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          {course.instructor?.avatar && (
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <span className="font-medium">{course.instructor?.name}</span>
          <span>
            ⭐ {course.rating?.average || 0} ({course.rating?.count || 0})
          </span>
          <span>👩‍🎓 {course.studentsEnrolled} students</span>
        </div>

        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {course.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseHeaderBanner;
