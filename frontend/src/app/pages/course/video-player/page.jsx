import PageMetaData from '@/components/PageMetaData';
import VideoPlayerDetail from './components/VideoPlayerDetail';
const VideoPlayer = () => {
  return <>
      <PageMetaData title="Course Video" />
      <main>
        <VideoPlayerDetail />
      </main>
    </>;
};
export default VideoPlayer;
