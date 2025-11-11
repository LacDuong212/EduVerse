import { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Col } from 'react-bootstrap';
import { BsXLg } from 'react-icons/bs';

// Define constraints
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const VALID_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-matroska', 'video/quicktime'];
// Simple URL regex (starts with http:// or https://)
const URL_REGEX = /^(https|http):\/\/[^\s$.?#].[^\s]*$/;


const AddLecture = ({ show, onClose, onSave, initialLecture = null }) => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(false);

  const [videoSource, setVideoSource] =useState('url');
  const [videoFile, setVideoFile] = useState(null);
  const [fileName, setFileName] = useState('');

  // New state for validation
  const [errors, setErrors] = useState({});

  // Reset all state when modal opens/props change
  useEffect(() => {
    if (show) {
      if (initialLecture) {
        setTitle(initialLecture.title);
        setVideoUrl(initialLecture.videoUrl || '');
        setDescription(initialLecture.description);
        setIsFree(initialLecture.isFree);
        setVideoSource('url');
        setVideoFile(null);
        setFileName('');
      } else {
        setTitle('');
        setVideoUrl('');
        setDescription('');
        setIsFree(false);
        setVideoSource('url');
        setVideoFile(null);
        setFileName('');
      }
      // Clear errors when modal is opened
      setErrors({});
    }
  }, [initialLecture, show]);

  // Clear errors when switching source
  const handleSourceChange = (e) => {
    const source = e.target.value;
    setVideoSource(source);
    setErrors({}); // Clear all errors
    if (source === 'url') {
      setVideoFile(null);
      setFileName('');
    } else {
      setVideoUrl('');
    }
  };

  // Validate file immediately on selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Clear previous file/errors
    setVideoFile(null);
    setFileName('');
    setErrors(prev => ({ ...prev, video: null })); // Clear only video error

    if (file) {
      // Check file type
      // Note: 'video/*' in accept is broad. We check common types here.
      // .mkv is 'video/x-matroska'
      if (!VALID_VIDEO_TYPES.includes(file.type) && !file.type.startsWith('video/')) {
        setErrors(prev => ({ ...prev, video: 'Invalid file type. Please select a valid video file.' }));
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ ...prev, video: `File is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` }));
        return;
      }

      // File is valid
      setVideoFile(file);
      setFileName(file.name);
      setVideoUrl('');
      setErrors(prev => ({ ...prev, video: null })); // Clear video error
    }
  };
  
  // Central validation function
  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Lecture title is required.';
    }

    if (videoSource === 'url') {
      if (!videoUrl.trim()) {
        newErrors.video = 'Video link is required.';
      } else if (!URL_REGEX.test(videoUrl)) {
        newErrors.video = 'Please enter a valid URL (e.g., https://...).';
      }
    } else { // 'file'
      if (!videoFile) {
        newErrors.video = 'Please select a video file.';
      }
      // Note: File type/size errors are set in handleFileChange, 
      // but we double-check 'videoFile' existence here.
      if (errors.video) { // Carry over existing file error
          newErrors.video = errors.video;
      }
    }
    
    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop submission
    }

    // All good, proceed to save
    setErrors({});
    let lectureData = {
      title,
      description,
      isFree,
      duration: 0,
      videoUrl: videoSource === 'url' ? videoUrl : '',
      videoFile: videoSource === 'file' ? videoFile : null,
    };

    onSave(lectureData);
  };

  return (
    <Modal show={show} onHide={onClose} tabIndex={-1} aria-labelledby="addLectureLabel" aria-hidden="true">
      <ModalHeader className="bg-dark">
        <h5 className="modal-title text-white" id="addLectureLabel">
          {initialLecture ? 'Edit Lecture' : 'Add Lecture'}
        </h5>
        <button type="button" className="btn btn-sm btn-light mb-0 ms-auto" onClick={onClose} aria-label="Close">
          <BsXLg />
        </button>
      </ModalHeader>

      <ModalBody>
        <form className="row text-start g-3" onSubmit={e => e.preventDefault()}>
          <Col md={12}>
            <label className="form-label">Lecture Title <span className="text-danger">*</span></label>
            <input
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              type="text"
              placeholder="Enter lecture title"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: null }));
              }}
            />
            {errors.title && <small className="text-danger">{errors.title}</small>}
          </Col>

          <Col xs={12} className="mt-3">
            <label className="form-label">Video Source:</label>
            <div className="btn-group ms-2" role="group" aria-label="Video source">
              <input
                type="radio"
                className="btn-check"
                name="videoSource"
                id="videoSourceUrl"
                value="url"
                checked={videoSource === 'url'}
                onChange={handleSourceChange}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="videoSourceUrl">
                Video URL
              </label>

              <input
                type="radio"
                className="btn-check"
                name="videoSource"
                id="videoSourceFile"
                value="file"
                checked={videoSource === 'file'}
                onChange={handleSourceChange}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="videoSourceFile">
                Upload File
              </label>
            </div>
          </Col>

          {videoSource === 'url' ? (
            <Col md={12} className="mt-3">
              <label className="form-label">Video Link <span className="text-danger">*</span></label>
              <input
                className={`form-control ${errors.video ? 'is-invalid' : ''}`}
                type="text"
                placeholder="Enter Video link (e.g., YouTube, Vimeo)"
                value={videoUrl}
                onChange={e => {
                  setVideoUrl(e.target.value);
                  if (errors.video) setErrors(prev => ({ ...prev, video: null }));
                }}
              />
              {errors.video && <small className="text-danger">{errors.video}</small>}
            </Col>
          ) : (
            <Col md={12} className="mt-3">
              <label className="form-label">Upload Video <span className="text-danger">*</span></label>
              <input
                className={`form-control ${errors.video ? 'is-invalid' : ''}`}
                type="file"
                accept="video/*,.mkv"
                onChange={handleFileChange}
              />
              {fileName && <small className="form-text text-muted">Selected file: {fileName}</small>}
              {errors.video && <small className="text-danger d-block">{errors.video}</small>}
            </Col>
          )}

          <Col xs={12} className="mt-3">
            <label className="form-label">Lecture Description</label>
            <textarea
              className="form-control"
              rows={4}
              spellCheck="false"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Col>

          <Col xs={12} className="mt-3">
            <label className="form-label">Availability:</label>
            <div className="btn-group ms-2" role="group" aria-label="Basic radio toggle button group">
              <input
                type="radio"
                className="btn-check"
                name="options"
                id="option1"
                checked={isFree}
                onChange={() => setIsFree(true)}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="option1">
                Free
              </label>
              <input
                type="radio"
                className="btn-check"
                name="options"
                id="option2"
                checked={!isFree}
                onChange={() => setIsFree(false)}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="option2">
                Premium
              </label>
            </div>
          </Col>
        </form>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn btn-danger-soft my-0" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn-success my-0" onClick={handleSave}>
          Save Lecture
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default AddLecture;
