import galleryImg from '@/assets/images/element/gallery.svg';
import GlightBox from '@/components/GlightBox';
import { useRef, useState, useMemo } from 'react';
import { Col, Row, Nav, Tab, Alert } from 'react-bootstrap';
import { FaPlay } from 'react-icons/fa';
import { toast } from 'react-toastify';

// helper functions ---
const getInitialPreview = (thumbnail) => {
  if (thumbnail) {
    if (thumbnail instanceof File) return URL.createObjectURL(thumbnail);
    if (typeof thumbnail === 'string' && thumbnail.startsWith('http')) return thumbnail;
  }
  return null;
};
const getInitialTab = (thumbnail) => {
  if (thumbnail) {
    if (thumbnail instanceof File) return 'upload';
    if (typeof thumbnail === 'string' && thumbnail.startsWith('http')) return 'url';
  }
  return 'url';
};

const Step2 = ({ stepperInstance, draftData, onSave }) => {
  // image states ---
  const [courseImageTab, setCourseImageTab] = useState(getInitialTab(draftData.image));
  const [courseImageURL, setCourseImageURL] = useState(
    typeof draftData.image === 'string' ? draftData.image : ''
  );
  const [courseImageFile, setCourseImageFile] = useState(
    draftData.image instanceof File ? draftData.image : null
  );
  const [previewCourseImage, setPreviewCourseImage] = useState(
    getInitialPreview(draftData.image)
  );
  const courseImageInputRef = useRef(null);

  // video states ---
  const [videoURL, setVideoURL] = useState(
    typeof draftData.previewVideo === 'string' ? draftData.previewVideo : ''
  );
  const [videoFile, setVideoFile] = useState(
    draftData.previewVideo instanceof File ? draftData.previewVideo : null
  );
  const videoInputRef = useRef(null);

  // other states ---
  const [error, setError] = useState('');

  // YouTube URL parsing ---
  const youtubeId = useMemo(() => {
    if (!videoURL) return null;
    const match = videoURL.match(
      /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }, [videoURL]);

  const videoThumbnail = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : 'https://via.placeholder.com/600x300?text=No+Video+Preview';

  const videoHref = youtubeId ? `https://youtu.be/${youtubeId}` : videoURL || '#';

  // image handlers ---
  const handleCourseImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseImageFile(file);
      setPreviewCourseImage(URL.createObjectURL(file));
      setCourseImageURL('');
      setError('');
    }
  };
  const handleCourseImageURLChange = (e) => {
    const url = e.target.value;
    setCourseImageURL(url);
    setPreviewCourseImage(url);
    setCourseImageFile(null);
    if (courseImageInputRef.current) courseImageInputRef.current.value = '';
    setError('');
  };
  const handleCourseImageTabChange = (tabKey) => {
    setCourseImageTab(tabKey);
    handleRemoveCourseImage();
  };
  const handleRemoveCourseImage = () => {
    setPreviewCourseImage(null);
    setCourseImageURL('');
    setCourseImageFile(null);
    setError('');
    if (courseImageInputRef.current) courseImageInputRef.current.value = '';
  };

  // new video handlers ---
  const handleVideoURLChange = (e) => {
    setVideoURL(e.target.value);
    setVideoFile(null); // Clear file
    if (videoInputRef.current) videoInputRef.current.value = '';
    setError('');
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoURL(''); // Clear URL
      setError('');
    }
  };

  // navigation
  const goToPreviousStep = (e) => {
    e.preventDefault();
    stepperInstance?.previous();
  };

  // validation & submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // get image
    let courseImageData = courseImageTab === 'url' ? courseImageURL : courseImageFile;
    if (!courseImageData) {
      setError('Please provide a course image by uploading or entering a URL.');
      toast.error("Please fix the errors on the page");
      return;
    }

    // get video
    let previewVideoData = videoURL || videoFile || null; // will be string, File, or null
    let thumbnailData = (videoURL && youtubeId) ? videoThumbnail : null;

    // validate YouTube URL
    if (videoURL && !youtubeId) {
      setError('The preview video URL must be a valid YouTube URL.');
      toast.error("Please fix the errors on the page");
      return;
    }

    // submit, #TODO: video upload
    const payload = {
      image: courseImageData,
      previewVideo: previewVideoData,
      thumbnail: thumbnailData,
    };

    await onSave(payload);
    stepperInstance?.next();
  };

  return (
    <form
      id="step-2"
      role="tabpanel"
      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
      className="content fade"
      aria-labelledby="steppertrigger2"
      onSubmit={handleSubmit}
    >
      <h4>Course Media <span className="text-danger">*</span></h4>
      <hr />

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {/* --- IMAGE SECTION --- */}
        <Col xs={12} className="mb-5">
          <h5>Upload Course Image <span className="text-danger">*</span></h5>
          <Tab.Container activeKey={courseImageTab} onSelect={handleCourseImageTabChange}>
            {/* Image Tabs  */}
            <Nav variant="tabs" className="nav-tabs-line mt-3">
              <Nav.Item>
                <Nav.Link eventKey="url">Image URL</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="upload">Upload Image</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content className="pt-4">
              <Tab.Pane eventKey="url">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="Enter image URL (e.g., https://...)"
                  value={courseImageURL}
                  onChange={handleCourseImageURLChange}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="upload">
                <div className="text-center justify-content-center align-items-center p-4 p-sm-5 border border-2 border-dashed position-relative rounded-3">
                  <div>
                    <h6 className="my-2">
                      Drop an image file here, or{' '}
                      <label htmlFor="image" className="text-primary" style={{ cursor: 'pointer' }}>
                        Browse
                      </label>
                    </h6>
                    <input
                      ref={courseImageInputRef}
                      id="image"
                      className="form-control d-none"
                      type="file"
                      name="image"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleCourseImageFileChange}
                    />
                    <p className="small mb-0 mt-2">
                      <b>Note:</b> Only JPG, JPEG and PNG. Suggested size 600×450px.
                    </p>
                  </div>
                </div>
                <p className="small mb-0 mt-2">
                  <b>Note:</b> Drop file comming soon!
                </p>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>

          {/* Course Image Preview */}
          {previewCourseImage && (
            <div className="mt-4 text-center">
              <h6 className="mb-2">Image Preview</h6>
              <img
                src={previewCourseImage}
                className="img-fluid rounded-3"
                alt="course-image-preview"
                style={{
                  maxHeight: '200px',
                  maxWidth: '100%',
                  objectFit: 'cover',
                  border: '1px solid #eee'
                }}
              />
              <div className="d-sm-flex justify-content-end mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-danger-soft mb-3"
                  onClick={handleRemoveCourseImage}
                >
                  Remove Image
                </button>
              </div>
            </div>
          )}
          {!previewCourseImage && (
            <div className="text-center justify-content-center align-items-center p-4 p-sm-5 border border-2 border-dashed position-relative rounded-3 mt-4">
              <img
                src={galleryImg}
                className="img-fluid rounded-3 mb-3"
                alt="placeholder"
                style={{ maxHeight: '150px' }}
              />
            </div>
          )}
        </Col>

        {/* --- VIDEO SECTION --- */}
        <Col xs={12}>
          <h5>Upload Course Preview Video (Optional)</h5>

          <Col xs={12} className="mt-4">
            <label className="form-label">YouTube Video URL</label>
            <input
              className="form-control"
              type="url"
              placeholder="Enter YouTube video URL"
              value={videoURL}
              onChange={handleVideoURLChange}
            />
          </Col>

          <div className="position-relative my-4">
            <hr />
            <p className="small position-absolute top-50 start-50 translate-middle bg-body px-3 mb-0">
              OR
            </p>
          </div>

          <Col xs={12}>
            <label className="form-label">Upload video file</label>
            <div className="input-group mb-3">
              <input
                ref={videoInputRef}
                type="file"
                className="form-control"
                id="videoUpload"
                accept="video/mp4,video/quicktime"
                onChange={handleVideoFileChange}
              />
              <label className="input-group-text">.mp4</label>
            </div>
            <p className="small mb-0 mt-1">
              <b>Note:</b> File upload comming soon!
            </p>
          </Col>

          {/* Video Preview */}
          {/* show YouTube preview if URL is set */}
          {videoURL && (
            <>
              <h6 className="mt-4">Video Preview</h6>
              <div className="position-relative text-center px-sm-0 px-lg-5">
                <img
                  src={videoThumbnail}
                  className="rounded-3"
                  alt="video-thumbnail"
                  style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                />
                {youtubeId && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <GlightBox
                      key={videoHref}
                      href={videoHref}
                      className="btn btn-lg text-danger btn-round btn-light-shadow"
                      data-glightbox
                      data-gallery="video-tour"
                    >
                      <FaPlay />
                    </GlightBox>
                  </div>
                )}
              </div>
            </>
          )}

          {/* show file info if a file is selected */}
          {videoFile && (
            <Alert variant="info" className="mt-4">
              File selected: <strong>{videoFile.name}</strong>
              <p className="small mb-0">
                This file is ready for the next step.
              </p>
            </Alert>
          )}

        </Col>

        {/* --- NAVIGATION BUTTONS --- */}
        <div className="d-flex justify-content-between mt-5">
          <button
            type="button"
            className="btn btn-secondary prev-btn mb-0"
            onClick={goToPreviousStep}
          >
            Previous
          </button>
          <button type="submit" className="btn btn-primary next-btn mb-0">
            Next
          </button>
        </div>
      </Row>
    </form>
  );
};

export default Step2;
