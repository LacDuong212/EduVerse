import React from "react";
import { useSelector } from "react-redux";
import CourseCard from "./CourseCard";

const SectionBlock = ({ title, courses }) => (
  <div className="py-10 md:px-40 px-8 ">
    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-6">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  </div>
);

const CoursesSection = () => {
  const { newest, bestSellers, topRated, biggestDiscounts } = useSelector(
    (state) => state.courses
  );

  return (
    <div className="w-full">
      <SectionBlock title="Newest Courses" courses={newest} />
      <SectionBlock title="Best Sellers" courses={bestSellers} />
      <SectionBlock title="Top Rated" courses={topRated} />
      <SectionBlock title="Biggest Discounts" courses={biggestDiscounts} />
    </div>
  );
};

export default CoursesSection;
