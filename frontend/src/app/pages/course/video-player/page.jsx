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
      <section className='py-0'>
        <VideoPlayerDetail
          key={`${courseId}:${lectureId}`}
          course={course}
          loading={loading}
          error={error}
          courseId={courseId}
          lectureId={lectureId}
        />
      </section>
    </>
  );
}