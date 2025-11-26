import { useEffect, useMemo, useState } from "react";
import { Col, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import { BsXLg, BsPlayCircleFill } from "react-icons/bs";
import { useVideoUpload } from "../useVideoUpload";
import GlightBox from "@/components/GlightBox";
import { useVideoStream } from "@/hooks/useStreamUrl";


// constants ---
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'mkv', 'avi'];
const URL_REGEX = /^(https|http):\/\/[^\s$.?#].[^\s]*$/;  // simple URL regex (starts with http:// or https://)

// helper: get duration from file
const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
      video.onerror = function () { reject("Cannot load video metadata"); };
      video.src = URL.createObjectURL(file);
    } catch (e) { reject(e); }
  });
};

const AddLecture = ({ show, onClose, onSave, initialLecture = null, courseId }) => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [duration, setDuration] = useState(0); // STORED IN SECONDS

  const [videoSource, setVideoSource] = useState('url');
  const [videoFile, setVideoFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const [errors, setErrors] = useState({});
  const { uploadVideo, progress, isUploading } = useVideoUpload();

  // if videoUrl is a key, fetch the signed URL
  const activeS3Key = (videoUrl && videoUrl.startsWith('videos/')) ? videoUrl : null;
  // always call the hook (Rules of Hooks), but only fetches if activeS3Key not null
  const { streamUrl: s3StreamUrl } = useVideoStream(courseId, activeS3Key);

  // use useMemo to generate the Blob URL for files so it doesn't flicker
  const filePreviewUrl = useMemo(() => {
    if (videoFile) return URL.createObjectURL(videoFile);
    return null;
  }, [videoFile]);

  // determine the final href for GlightBox
  let previewHref = null;
  if (videoSource === 'file') {
    // user selected a NEW file (local preview)
    if (filePreviewUrl) {
      previewHref = filePreviewUrl;
    }
    // editing existing S3 video (server preview)
    else if (activeS3Key && s3StreamUrl) {
      previewHref = s3StreamUrl;
    }
  } else if (videoSource === 'url') {
    // external URL (YouTube, Vimeo,...)
    if (videoUrl) {
      previewHref = videoUrl;
    }
  }

  // reset all state when modal opens/props change
  useEffect(() => {
    if (show) {
      if (initialLecture) {
        setTitle(initialLecture.title);
        setVideoUrl(initialLecture.videoUrl || '');
        setDescription(initialLecture.description);
        setIsFree(initialLecture.isFree);
        setDuration(initialLecture.duration || 0);

        // auto-detect source
        const isInternal = initialLecture.videoUrl && initialLecture.videoUrl.startsWith('videos/');
        setVideoSource(isInternal ? 'file' : 'url');

        setVideoFile(null);
        setFileName('');
      } else {
        setTitle('');
        setVideoUrl('');
        setDescription('');
        setIsFree(false);
        setDuration(0);
        setVideoSource('url');
        setVideoFile(null);
        setFileName('');
      }
      setErrors({});  // clear errors when modal is opened
    }
  }, [initialLecture, show]);

  // clear errors when switching source
  const handleSourceChange = (e) => {
    const source = e.target.value;
    setVideoSource(source);
    setErrors({});

    if (source === 'url') {
      setVideoFile(null);
      setFileName('');
      setDuration(0); // reset duration so user can type it
    } else {
      setVideoUrl('');
      setDuration(0); // reset until file is picked
    }
  };

  // validate file immediately on selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    // clear previous file/errors
    setVideoFile(null);
    setFileName('');
    setDuration(0);
    setErrors(prev => ({ ...prev, video: null })); // clear only video error

    if (file) {
      // check file type
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
        setErrors(prev => ({ ...prev, video: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` }));
        return;
      }

      // check file size
      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ ...prev, video: `File is too large. Max size is 2GB.` }));
        return;
      }

      // calculate duration
      try {
        const seconds = await getVideoDuration(file);
        setDuration(seconds);
      } catch (err) {
        console.error("Duration error", err);
      }

      // valid
      setVideoFile(file);
      setFileName(file.name);
      setVideoUrl('');
      setErrors(prev => ({ ...prev, video: null })); // clear video error
    }
  };

  // validation function
  const validate = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Lecture title is required.';

    if (videoSource === 'url') {
      if (!videoUrl.trim()) {
        newErrors.video = 'Video link is required.';
      } else {
        // check if standard HTTP/HTTPS URL (YouTube, Vimeo, etc.)
        const isExternalUrl = URL_REGEX.test(videoUrl);

        // check if an internal S3 Key
        const isInternalKey = videoUrl.trim().startsWith('videos/');

        // valid on both true
        if (!isExternalUrl && !isInternalKey) {
          newErrors.video = 'Please enter a valid URL or an existing video key.';
        }
      }

      // check duration
      if (duration <= 0) {
        newErrors.duration = 'Please enter the duration.';
      }
    } else { // 'file'
      const hasExistingVideo = initialLecture && initialLecture.videoUrl;
      if (!videoFile && !hasExistingVideo) newErrors.video = 'Please select a video file.';
      if (errors.video) newErrors.video = errors.video;
    }

    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // stop submission
    }

    // helper to finalize data and call parent
    const submitData = (finalVideoPath) => {
      onSave({
        title,
        description,
        isFree,
        duration, // sends SECONDS to parent
        videoUrl: finalVideoPath,
      });
    };

    if (videoSource === 'file' && videoFile) {
      // upload file -> get key -> save
      uploadVideo(videoFile, (uploadedKey) => {
        // this callback runs ONLY after successful upload
        submitData(uploadedKey);
      });
    } else {
      // just a URL (or keeping existing video) -> save immediately
      submitData(videoUrl);
    }
  };

  return (
    <Modal show={show} onHide={!isUploading ? onClose : undefined} backdrop={isUploading ? 'static' : true} size="lg">
      <ModalHeader className="bg-dark">
        <h5 className="modal-title text-white">{initialLecture ? 'Edit Lecture' : 'Add Lecture'}</h5>
        {!isUploading && <button type="button" className="btn btn-sm btn-light mb-0 ms-auto" onClick={onClose}><BsXLg /></button>}
      </ModalHeader>

      <ModalBody>
        <form className="row text-start g-3">
          <Col md={12}>
            <label className="form-label">Lecture Title <span className="text-danger">*</span></label>
            <input
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              type="text" value={title} disabled={isUploading}
              onChange={e => setTitle(e.target.value)}
            />
            {errors.title && <small className="text-danger">{errors.title}</small>}
          </Col>

          <Col xs={12} className="mt-3">
            <label className="form-label">Video Source:</label>
            <div className="btn-group ms-2" role="group">
              <input type="radio" className="btn-check" name="videoSource" id="srcUrl" value="url" checked={videoSource === 'url'} onChange={handleSourceChange} disabled={isUploading} />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="srcUrl">External URL</label>

              <input type="radio" className="btn-check" name="videoSource" id="srcFile" value="file" checked={videoSource === 'file'} onChange={handleSourceChange} disabled={isUploading} />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="srcFile">Upload File</label>
            </div>
          </Col>

          {/* --- VIDEO INPUT AREA --- */}
          {videoSource === 'url' ? (
            <>
              <Col md={8} className="mt-3">
                <label className="form-label">Video Link <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input
                    className={`form-control ${errors.video ? 'is-invalid' : ''}`}
                    type="text" placeholder="https://..." value={videoUrl} disabled={isUploading}
                    onChange={e => setVideoUrl(e.target.value)}
                  />

                  {/* PREVIEW BUTTON (Dynamic GlightBox or Disabled Button) */}
                  {previewHref ? (
                    <GlightBox
                      href={previewHref}
                      className="btn btn-secondary d-inline-flex align-items-center"
                    >
                      <BsPlayCircleFill className="me-2" /> Preview
                    </GlightBox>
                  ) : (
                    <button className="btn btn-secondary" type="button" disabled>
                      <BsPlayCircleFill className="me-2" /> Preview
                    </button>
                  )}
                </div>
                {errors.video && <small className="text-danger">{errors.video}</small>}
              </Col>

              {/* DURATION INPUT (Editable for URL) */}
              <Col md={4} className="mt-3">
                <label className="form-label">Duration (Minutes) <span className="text-danger">*</span></label>
                <input
                  type="number"
                  className={`form-control ${errors.duration ? 'is-invalid' : ''}`}
                  min="0"
                  step="0.1"
                  placeholder="e.g. 10.5"
                  disabled={isUploading}
                  // display: convert seconds to minutes
                  value={duration > 0 ? (duration / 60).toFixed(1) : ''}
                  // update: convert minutes to seconds
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setDuration(isNaN(val) ? 0 : Math.round(val * 60));
                  }}
                />
                {errors.duration && <small className="text-danger">{errors.duration}</small>}
              </Col>
            </>
          ) : (
            <>
              <Col md={8} className="mt-3">
                <label className="form-label">Upload Video <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input
                    className={`form-control ${errors.video ? 'is-invalid' : ''}`}
                    type="file" accept=".mp4,.mov,.mkv,.avi,video/*"
                    disabled={isUploading} onChange={handleFileChange}
                  />

                  {/* PREVIEW BUTTON */}
                  {previewHref ? (
                    <GlightBox
                      href={previewHref}
                      className="btn btn-secondary d-inline-flex align-items-center"
                    >
                      <BsPlayCircleFill className="me-2" /> Preview
                    </GlightBox>
                  ) : (
                    <button className="btn btn-secondary" type="button" disabled>
                      <BsPlayCircleFill className="me-2" /> Preview
                    </button>
                  )}
                </div>
                {fileName && <small className="text-success">Selected: {fileName}</small>}
                {errors.video && <small className="text-danger d-block">{errors.video}</small>}

                {isUploading && (
                  <div className="progress mt-2" style={{ height: '5px' }}>
                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}></div>
                  </div>
                )}
              </Col>

              {/* DURATION DISPLAY (Read-Only for File) */}
              <Col md={4} className="mt-3">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  readOnly
                  // Display nicely formatted time
                  value={duration > 0 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : '0m 0s'}
                />
              </Col>
            </>
          )}

          <Col xs={12} className="mt-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={description} disabled={isUploading} onChange={e => setDescription(e.target.value)} />
          </Col>

          <Col xs={12} className="mt-3">
            <label className="form-label me-2">Availability:</label>
            <div className="btn-group" role="group">
              <input type="radio" className="btn-check" name="options" id="optFree" checked={isFree} onChange={() => setIsFree(true)} disabled={isUploading} />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="optFree">Free</label>
              <input type="radio" className="btn-check" name="options" id="optPrem" checked={!isFree} onChange={() => setIsFree(false)} disabled={isUploading} />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="optPrem">Premium</label>
            </div>
          </Col>
        </form>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn btn-danger-soft my-0" onClick={onClose} disabled={isUploading}>Close</button>
        <button type="button" className="btn btn-success my-0" onClick={handleSave} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Save Lecture'}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default AddLecture;
