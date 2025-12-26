import { useSelector } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import TinySlider from '@/components/TinySlider';
import CommonCourseCard from './CommonCourseCard';


const adaptCourseData = (c) => {
  const ratingAvg = Number.isFinite(c?.rating?.average) ? Number(c.rating.average) : 0;
  const ratingCount = Number.isFinite(c?.rating?.count) ? Number(c.rating.count) : 0;

  const instructorName = c?.instructor?.name ?? 'Unknown';
  const instructorAvatar = c?.instructor?.avatar ?? 'https://placehold.co/80x80?text=In';
  const thumbnail = c?.thumbnail || "https://res.cloudinary.com/dw1fjzfom/image/upload/v1764372521/courses/course_6905f3d6dd25706e06ca2952_image.jpg";

  const price = Number(c?.price ?? 0);
  const discountPrice = c?.discountPrice != null ? Number(c.discountPrice) : null;
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const duration = Number.isFinite(c?.duration) ? `${c.duration}` : c?.duration || '—';

  return {
    id: c?._id || c?.id,
    name: instructorName,
    avatar: instructorAvatar,
    thumbnail: thumbnail,
    badge: { text: c?.level || 'Course' },
    rating: { star: Number(ratingAvg.toFixed(1)), review: ratingCount },
    title: c?.title || 'Untitled',
    price,
    discountPrice,
    discountPercent,
    students: c?.studentsEnrolled ?? 0,
    duration,
    lectures: c?.lecturesCount ?? 0,
    category: c?.category?.name || 'Others',
    _raw: c,
  };
};

const CommonCourseSlider = ({ source }) => {
  const coursesState = useSelector((s) => s.courses || {});
  const rawList = Array.isArray(coursesState[source]) ? coursesState[source] : [];
  
  const list = rawList.map(adaptCourseData);

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
    items: 3,
    nav: false,
    responsive: {
      0: { items: 1 },
      576: { items: 1 },
      768: { items: 2 },
      992: { items: 2 },
      1200: { items: 3 },
    },
  };

  if (!list.length) return <p className="text-center text-muted">No courses found.</p>;

  return (
    <TinySlider settings={courseSliderSettings} className="pb-0">
      {list.slice(0, 8).map((course, idx) => (
        <div key={course.id || course._raw?._id || idx} className="h-100">
          <CommonCourseCard course={course} />
        </div>
      ))}
    </TinySlider>
  );
};

export default CommonCourseSlider;