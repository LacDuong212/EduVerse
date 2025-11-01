// app/pages/course/video-player/page.jsx
import { useParams } from 'react-router-dom';
import PageMetaData from '@/components/PageMetaData';
import VideoPlayerDetail from './components/VideoPlayerDetail';
import useCourseById from './useCourseById';

export default function VideoPlayer() {
  const { courseId, lectureId } = useParams();           // 👈 ĐỌC PARAMS Ở ĐÂY
  const { course, loading, error } = useCourseById(courseId);
console.log('params in parent', { courseId, lectureId });
  return (
    <>
      <PageMetaData title="Course Video" />
      <main>
        <VideoPlayerDetail
          course={course}
          loading={loading}
          error={error}
          courseId={courseId}
          lectureId={lectureId}                           // 👈 TRUYỀN XUỐNG
        />
      </main>
    </>
  );
}