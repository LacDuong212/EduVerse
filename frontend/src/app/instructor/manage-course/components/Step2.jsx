import galleryImg from '@/assets/images/element/gallery.svg';
import GlightBox from '@/components/GlightBox';
import { useVideoStream } from "@/hooks/useStreamUrl";
import { useImageUpload } from '../useImageUpload';
import { useVideoUpload } from "../useVideoUpload";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Col, Nav, ProgressBar, Row, Tab } from 'react-bootstrap';
import { FaPlay } from 'react-icons/fa';
import { toast } from 'react-toastify';

// simple URL regex
const URL_REGEX = /^(https|http):\/\/[^\s$.?#].[^\s]*$/;

// helper functions ---
const getInitialTab = (image) => {
  if (image) {
    if (image instanceof File) return 'upload';
    if (typeof image === 'string' && image.startsWith('http')) return 'url';
  }
  return 'url';
};

const getImagePreview = (image) => {
  if (image) {
    if (image instanceof File) return URL.createObjectURL(image);
    if (typeof image === 'string' && image.startsWith('http')) return image;
  }
  return null;
};

const Step2 = ({ stepperInstance, draftData, onSave }) => {
  const courseId = draftData._id;

  // hooks
  const { uploadImage, isUploading: isImageUploading, error: imageUploadError } = useImageUpload();
  const { uploadVideo, progress: videoProgress, isUploading: isVideoUploading } = useVideoUpload();

  const isBusy = isVideoUploading || isImageUploading;

  // tracks if we just successfully uploaded
  const uploadSuccessRef = useRef(false);

  // image states ---
  const [courseImageTab, setCourseImageTab] = useState(getInitialTab(draftData.image));
  const [courseImageURL, setCourseImageURL] = useState(
    typeof draftData.image === 'string' ? draftData.image : ''
  );
  const [courseImageFile, setCourseImageFile] = useState(
    draftData.image instanceof File ? draftData.image : null
  );
  const [previewCourseImage, setPreviewCourseImage] = useState(
    getImagePreview(draftData.image)
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

  // determine if videoURL is an S3 key or an URL
  const isS3Key = useMemo(() => {
    return videoURL && typeof videoURL === 'string' && videoURL.startsWith('videos/');
  }, [videoURL]);

  // this ensures the URL string stays the same even when 'progress' triggers re-renders
  const videoObjectUrl = useMemo(() => {
    if (videoFile) {
      return URL.createObjectURL(videoFile);
    }
    return null;
  }, [videoFile]);

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (videoObjectUrl) {
        URL.revokeObjectURL(videoObjectUrl);
      }
    };
  }, [videoObjectUrl]);

  // fetch stream URL if S3 key
  const { streamUrl: s3StreamUrl, loading: streamLoading } = useVideoStream(courseId, isS3Key ? videoURL : null);

  // syncs the component's state with the draftData.image prop
  useEffect(() => {
    const image = draftData.image;
    if (image) {
      if (typeof image === 'string') {
        setCourseImageTab('url');
        setCourseImageURL(image);
        setPreviewCourseImage(image);
        setCourseImageFile(null); // ensure file is cleared
      } else if (image instanceof File) {
        setCourseImageTab('upload');
        setCourseImageFile(image);
        setPreviewCourseImage(getImagePreview(image));
        setCourseImageURL(''); // ensure URL is cleared
      }
    } else {
      // handles when the data is loading or image is truly null
      setCourseImageTab('url');
      setCourseImageURL('');
      setCourseImageFile(null);
      setPreviewCourseImage(null);
    }
  }, [draftData.image]);  // runs whenever draftData.image changes

  // syncs the component's state with the draftData.previewVideo prop
  useEffect(() => {
    const video = draftData.previewVideo;
    if (video) {
      if (typeof video === 'string') {
        setVideoURL(video);

        // if we just uploaded the file, keep the local file in state
        // so the UI doesn't switch to the "Loading S3 Stream" view, causing a flicker.
        if (!uploadSuccessRef.current) {
          setVideoFile(null);
        }
      } else if (video instanceof File) {
        setVideoFile(video);
        setVideoURL('');
      }
    } else {
      setVideoURL('');
      setVideoFile(null);
    }
  }, [draftData.previewVideo]); // runs whenever draftData.previewVideo changes

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
    : 'https://placehold.co/600x300?text=No+Video+Preview';

  const videoHref = youtubeId ? `https://youtu.be/${youtubeId}` : videoURL || '#';

  // image handlers ---
  const handleCourseImageTabChange = (tabKey) => {
    setCourseImageTab(tabKey);
    //handleRemoveCourseImage();
  };
  const handleCourseImageURLChange = (e) => {
    const url = e.target.value;
    setCourseImageURL(url);
    setPreviewCourseImage(url); // update preview
    setCourseImageFile(null);
    if (courseImageInputRef.current) courseImageInputRef.current.value = '';
    setError('');
  };
  const handleCourseImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseImageFile(file);
      setPreviewCourseImage(URL.createObjectURL(file)); // update preview
      setCourseImageURL('');
      setError('');
    }
  };
  const handleRemoveCourseImage = () => {
    setPreviewCourseImage(null); // update preview
    setCourseImageURL('');
    setCourseImageFile(null);
    setError('');
    if (courseImageInputRef.current) courseImageInputRef.current.value = '';
  };

  // new video handlers ---
  const handleVideoURLChange = (e) => {
    setVideoURL(e.target.value);
    setVideoFile(null); // clear file
    if (videoInputRef.current) videoInputRef.current.value = '';
    setError('');
  };
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoURL(''); // clear URL
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
    if (isBusy) return; // prevent double submit
    setError('');

    // get image
    let currentImageData = courseImageTab === 'url' ? courseImageURL : courseImageFile;
    if (!currentImageData) {
      setError('Please provide a course image by uploading or entering a URL.');
      toast.error("Please fix the errors on the page");
      return;
    }

    // check video source
    if (videoURL && !videoFile) {
      // if a valid S3 Key
      const validS3 = videoURL.startsWith('videos/');
      // if a valid URL
      const validUrl = URL_REGEX.test(videoURL);

      if (!validS3 && !validUrl) {
        setError('Invalid Video Source. Must be a valid URL (http/https) or an uploaded file (starting with "videos/..").');
        toast.error("Please fix the errors on the page");
        return;
      }
    }

    try {
      // if image file upload
      let finalImageString = courseImageURL;
      if (courseImageTab === 'upload' && courseImageFile) {
        finalImageString = await uploadImage(courseImageFile, courseId);
      }

      // prepare save function
      const processSave = (finalVideoValue) => {
        // fallback: if youtube, use youtube thumbnail else, default to the Course Image.
        const thumbnailData = (finalVideoValue && youtubeId)
          ? videoThumbnail
          : finalImageString;

        const payload = {
          image: finalImageString,
          previewVideo: finalVideoValue,
          thumbnail: thumbnailData,
        };

        onSave(payload);
        toast.success('Step 2 saved!');
        stepperInstance?.next();
      };

      // handle video upload if chosen a file
      if (videoFile) {
        // use the hook to upload
        await uploadVideo(videoFile, (uploadedKey) => {
          processSave(uploadedKey);  // if success save the returned key
        });
      } else {
        // no new file, just save existing URL/Key or null
        processSave(videoURL);
      }

    } catch (error) {
      console.error("Upload course media failed: ", error);
      toast.error('Failed to upload media');
      setError('Failed to upload media');
    }
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
      {error && <Alert variant="danger">{error}</Alert>}
      <hr />

      <Row>
        {/* --- IMAGE SECTION --- */}
        <Col xs={12} className="mb-5">
          <h5>Course Image <span className="text-danger">*</span></h5>
          <Tab.Container
            activeKey={courseImageTab}
            onSelect={handleCourseImageTabChange}
          >
            {/* Image Tabs */}
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
                  {isImageUploading ? (
                    // Loading State for Image
                    <div className="text-primary">
                      <div className="spinner-border mb-2" role="status" />
                      <p>Uploading Image to Cloud...</p>
                    </div>
                  ) : (
                    <div>
                      <h6 className="my-2"> {/* #TODO */}
                        Drop an image file here, or{' '}
                        <label
                          htmlFor="image"
                          className="text-primary"
                          style={{ cursor: 'pointer' }}
                        >
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
                        <b>Note:</b> Only JPG, JPEG and PNG. Suggested size
                        600×450px.
                      </p>
                    </div>
                  )}
                </div>
                <p className="small mb-0 mt-2">
                  <b>Note:</b> Drop file comming soon!
                </p>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>

          {/* Course Image Preview */}
          {previewCourseImage && !isImageUploading && (
            <div className="mt-4 text-center">
              <h6 className="mb-2">Image Preview</h6>
              <img
                src={previewCourseImage}
                className="img-fluid rounded-3"
                alt="course-image-preview"
                style={{
                  maxHeight: '360px',
                  maxWidth: '100%',
                  objectFit: 'cover',
                  border: '1px solid #eee',
                }}
              />
              <div className="d-sm-flex justify-content-center mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-danger-soft mb-3"
                  onClick={handleRemoveCourseImage}
                >
                  Remove
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
        {imageUploadError && <Alert variant="danger">Upload course image failed</Alert>}
        </Col>

        {/* --- VIDEO SECTION --- */}
        <Col xs={12}>
          <h5>Course Preview Video (Optional)</h5>

          <Col xs={12} className="mt-4">
            <label className="form-label">Enter Video URL</label>
            {/* FIX: Changed type="url" to type="text" to accept S3 keys (videos/...) without browser error */}
            <input
              className="form-control"
              type="text"
              placeholder="Enter a video URL or a video key"
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
            <label className="form-label">Upload Video File</label>
            <div className="input-group mb-3">
              <input
                ref={videoInputRef}
                type="file"
                className="form-control"
                id="videoUpload"
                accept="video/mp4,video/quicktime"
                onChange={handleVideoFileChange}
                disabled={isVideoUploading}
              />
              <label className="input-group-text">.mp4, .mov</label>
            </div>

            {/* progress bar */}
            {isVideoUploading && (
              <div className="mt-3">
                <p className="mb-1 text-primary">Uploading Video... {videoProgress}%</p>
                <ProgressBar now={videoProgress} animated striped variant="success" />
              </div>
            )}
          </Col>

          {/* Video Preview */}
          {/* YouTube Preview */}
          {youtubeId && !videoFile && (
            <>
              <h6 className="mt-4">Video Preview (YouTube)</h6>
              <div className="position-relative text-center px-sm-0 px-lg-5">
                <img
                  src={videoThumbnail}
                  className="rounded-3"
                  alt="video-thumbnail"
                  style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                />
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
              </div>
            </>
          )}

          {/* cloud video preview if existing saved video */}
          {isS3Key && !videoFile && (
            <div className="mt-4">
              <h6 className="mb-2">Video Preview (Uploaded)</h6>
              {streamLoading ? (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : s3StreamUrl ? (
                <video
                  controls
                  width="100%"
                  className="rounded-3 border"
                  style={{ maxHeight: '400px', backgroundColor: '#000' }}
                >
                  <source src={s3StreamUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Alert variant="warning">Unable to load video preview.</Alert>
              )}
            </div>
          )}

          {/* local file preview (before upload) */}
          {videoFile && videoObjectUrl && (
            <div className="mt-4">
              <h6 className="mb-2">File Ready for Upload</h6>
              <Alert variant="info" className="d-flex align-items-center justify-content-between">
                <div>
                  File selected: <strong>{videoFile.name}</strong>
                  <div className="small">
                    {uploadSuccessRef.current ? "Upload Complete! Saving..." : 'Click "Next" to upload and save.'}
                  </div>
                </div>
              </Alert>
              {!isVideoUploading && (
                <video
                  controls
                  width="100%"
                  className="rounded-3 border"
                  style={{ maxHeight: '400px', backgroundColor: '#000' }}
                  src={videoObjectUrl}
                >
                </video>
              )}
            </div>
          )}
        </Col>

        {/* --- NAVIGATION BUTTONS --- */}
        <div className="d-flex justify-content-between mt-5">
          <button
            type="button"
            className="btn btn-secondary prev-btn mb-0"
            onClick={goToPreviousStep}
            disabled={isBusy}
          >
            Previous
          </button>
          <button type="submit" className="btn btn-primary next-btn mb-0" disabled={isBusy}>
            {isImageUploading ? 'Uploading Image...' : isVideoUploading ? 'Uploading Video...' : 'Next'}
          </button>
        </div>
      </Row>
    </form>
  );
};

export default Step2;
