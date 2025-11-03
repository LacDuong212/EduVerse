// app/pages/course/video-player/page.jsx
import { useParams } from 'react-router-dom';
import PageMetaData from '@/components/PageMetaData';
import VideoPlayerDetail from './components/VideoPlayerDetail';
import useCourseById from './useCourseById';

export default function VideoPlayer() {
  const { courseId, lectureId } = useParams();
  const { course, loading, error } = useCourseById(courseId);

  return (
    <>
      <PageMetaData title="Course Video" />
      <main>
        <VideoPlayerDetail
          key={`${courseId}:${lectureId}`}   // 👈 ép remount subtree
          course={course}
          loading={loading}
          error={error}
          courseId={courseId}
          lectureId={lectureId}
        />
      </main>
    </>
  );
}