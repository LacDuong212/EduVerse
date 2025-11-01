import useToggle from '@/hooks/useToggle';
import { Collapse, Row } from 'react-bootstrap';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import Playlist from './Playlist';
const VideoPlayerDetail = () => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  return <section className="py-0 bg-dark position-relative">
      <Row className="g-0">
        <div className="d-flex">
          <div className="overflow-hidden fullscreen-video w-100">
            <div className="video-player rounded-3">
              <Plyr playsInline crossOrigin="anonymous" controls source={{
              tracks: [{
                kind: 'captions',
                label: 'English',
                src: '/videos/en.vtt',
                srcLang: 'en',
                default: true
              }, {
                kind: 'captions',
                label: 'French',
                src: '/videos/fr.vtt',
                srcLang: 'fr'
              }],
              type: 'video',
              poster: '/videos/poster.jpg',
              sources: [{
                src: '/videos/360p.mp4',
                size: 360
              }, {
                src: '/videos/720p.mp4',
                size: 720
              }, {
                src: '/videos/1080p.mp4',
                size: 1080
              }]
            }} />
            </div>
          </div>
          <div className="justify-content-end position-relative">
            <button onClick={toggle} className="navbar-toggler btn btn-white mt-4 plyr-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded={isOpen} aria-controls="collapseWidthExample">
              <span className="navbar-toggler-animation">
                <span />
                <span />
                <span />
              </span>
            </button>
            <Collapse className="collapse-horizontal" in={isOpen}>
              <div>
                <Playlist />
              </div>
            </Collapse>
          </div>
        </div>
      </Row>
    </section>;
};
export default VideoPlayerDetail;
