import { useSelector } from "react-redux";
import { renderToString } from "react-dom/server";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import TinySlider from "@/components/TinySlider";
import CommonCourseCard from "./CommonCourseCard";

const CommonCourseSlider = ({ source }) => {
  const coursesState = useSelector((s) => s.courses || {});
  const list = Array.isArray(coursesState[source]) ? coursesState[source] : [];

  const courseSliderSettings = {
    arrowKeys: true,
    gutter: 30,
    autoplayButton: false,
    autoplayButtonOutput: false,
    controlsText: [
      renderToString(<FaChevronLeft size={16} />),
      renderToString(<FaChevronRight size={16} />),
    ],
    autoplay: true,
    controls: true,
    edgePadding: 2,
    items: 4,
    nav: false,
    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      768: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 },
    },
  };

  if (!list.length) return <p className="text-center text-muted">No courses found.</p>;

  return (
    <TinySlider settings={courseSliderSettings} className="pb-1">
      {list.map((course, idx) => (
        <div key={course.courseId || idx}>
          <CommonCourseCard course={course} />
        </div>
      ))}
    </TinySlider>
  );
};

export default CommonCourseSlider;