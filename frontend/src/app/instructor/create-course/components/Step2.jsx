import galleryImg from '@/assets/images/element/gallery.svg';
import GlightBox from '@/components/GlightBox';
import useCourseFormData from '../useCourseFormData';
import { useRef, useState, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FaPlay } from 'react-icons/fa';

const Step2 = ({ stepperInstance }) => {
  const { formData, updateStepData } = useCourseFormData();
  const [imageURL, setImageURL] = useState(formData.thumbnail || '');
  const [videoURL, setVideoURL] = useState(formData.previewVideo || '');
  const [previewImage, setPreviewImage] = useState(formData.thumbnail || null);
  const imageInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleImageURLChange = (e) => {
    const url = e.target.value;
    setImageURL(url);
    setPreviewImage(url || null);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageURL('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const goToPreviousStep = (e) => {
    e.preventDefault();
    stepperInstance?.previous();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      thumbnail: imageURL,
      previewVideo: videoURL,
    };
    await updateStepData('step2', payload);
    stepperInstance?.next();
  };

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

  const videoHref = youtubeId
    ? `https://youtu.be/${youtubeId}`
    : videoURL || '#';

  return (
    <form
      id="step-2"
      role="tabpanel"
      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
      className="content fade"
      aria-labelledby="steppertrigger2"
      onSubmit={handleSubmit}
    >
      <h4>Course media</h4>
      <hr />

      <Row>
        {/* ==== IMAGE SECTION ==== */}
        <Col xs={12} className="mb-5">
          <h5>Upload course image</h5>

          <label className="form-label mt-3">Image URL</label>
          <input
            type="url"
            className="form-control mb-4"
            placeholder="Enter image URL"
            value={imageURL}
            onChange={handleImageURLChange}
          />

          <div className="text-center justify-content-center align-items-center p-4 p-sm-5 border border-2 border-dashed position-relative rounded-3">
            <img
              src={previewImage || galleryImg}
              className="img-fluid rounded-3 mb-3"
              alt="course-image"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
            <div>
              <h6 className="my-2">
                Upload image here, or{' '}
                <label htmlFor="image" className="text-primary" style={{ cursor: 'pointer' }}>
                  Browse
                </label>
              </h6>
              <input
                ref={imageInputRef}
                id="image"
                className="form-control mt-2"
                type="file"
                name="thumbnail"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
              />
              <p className="small mb-0 mt-2">
                <b>Note:</b> Only JPG, JPEG and PNG. Suggested size 600×450px. Larger images will
                be cropped to 4:3.
              </p>
            </div>
          </div>
          <div className="d-sm-flex justify-content-end mt-2">
            <button
              type="button"
              className="btn btn-sm btn-danger-soft mb-3"
              onClick={handleRemoveImage}
            >
              Remove image
            </button>
          </div>
        </Col>

        {/* ==== VIDEO SECTION ==== */}
        <Col xs={12}>
          <h5>Upload course preview video</h5>

          <Col xs={12} className="mt-4 mb-5">
            <label className="form-label">Video URL</label>
            <input
              className="form-control"
              type="text"
              placeholder="Enter video URL"
              value={videoURL}
              onChange={(e) => setVideoURL(e.target.value)}
            />
          </Col>

          <div className="position-relative my-4">
            <hr />
            <p className="small position-absolute top-50 start-50 translate-middle bg-body px-3 mb-0">
              Or
            </p>
          </div>

          <Col xs={12}>
            <label className="form-label">Upload video file</label>
            <div className="input-group mb-3">
              <input type="file" className="form-control" id="videoUpload" accept="video/*" />
              <label className="input-group-text">.mp4</label>
            </div>
          </Col>

          <h5 className="mt-4">Video preview</h5>
          <div className="position-relative text-center px-sm-0 px-lg-5">
            <img
              src={videoThumbnail}
              className="rounded-3"
              alt="video-thumbnail"
              style={{
                height: '300px',
                width: '100%',
                objectFit: 'cover',
              }}
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
        </Col>

        <div className="d-flex justify-content-between mt-4">
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
