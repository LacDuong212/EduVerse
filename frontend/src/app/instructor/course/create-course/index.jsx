import { useEffect } from "react";
import useCreateCourse from "./useCreateCourse";

const CreateCoursePage = () => {
  const { createCourse } = useCreateCourse();

  useEffect(() => {
    createCourse();
  }, []);

  return (
    <div className="flex flex-col align-items-center justify-content-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-semibold text-primary">Creating course...</h3>
        <p className="text-gray-500 text-sm mt-2">We're building a draft for you, give us a second!</p>
      </div>
    </div>
  );
};

export default CreateCoursePage;