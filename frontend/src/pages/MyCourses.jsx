import CourseCard from "@/components/CourseCard";
import axios from "axios";
import { useEffect, useState } from "react";


const SectionBlock = ({ title, courses }) => (
  <div className="py-10 md:px-40 px-8">
    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-6">
      {courses.map((course) => (
        <CourseCard key={course.courseId} course={course} />
      ))}
    </div>
  </div>
);

export default function MyCourses() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/courses/my-courses`, {
          withCredentials: true,
        });

        if (data.success) {
          setCourses(data.courses);
        } else {
          setError("Failed to load courses");
        }
      } catch (err) {
        setError("An error occurred while fetching courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [backendUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading your courses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500">
        Unable to load courses. Please try again later.
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        You have not enrolled in any courses yet.
      </div>
    );
  }


  return (
    <div className="w-full">
      <SectionBlock title="My Courses" courses={courses} />
    </div>
  );
}
