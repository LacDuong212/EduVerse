import { createContext, useContext } from "react";
import useEditCourse from "./edit-course/useEditCourse";

const CourseEditorContext = createContext();

export const CourseEditorProvider = ({ children }) => {
  const courseMethods = useEditCourse();

  return (
    <CourseEditorContext.Provider value={courseMethods}>
      {children}
    </CourseEditorContext.Provider>
  );
};

// custom helper hook so to not import useContext everywhere
export const useCourseEditor = () => {
  const context = useContext(CourseEditorContext);
  if (!context) throw new Error("useCourseEditor must be used within CourseEditorProvider");
  return context;
};