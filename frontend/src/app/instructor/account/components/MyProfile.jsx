import useProfile from '@/hooks/useProfile';
import useInstructor from '../../useInstructor';
import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Col, Modal, Spinner } from 'react-bootstrap';
import { BsPlus, BsTwitter, BsX } from 'react-icons/bs';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { toast } from 'react-toastify';

const MyProfile = () => {
  // hooks
  const {
    user,

    uploadAvatar,
    isAvatarUploading,
  } = useProfile();
  const { fetchPublicFields } = useInstructor();

  const [instructor, setInstructor] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [educationList, setEducationList] = useState([]);

  // helper
  // if preview = "", shows name initials
  // if preview = null, shows user.pfpImg
  // if preview = <url>, show new avatar
  const currentAvatarSrc = previewAvatar === "" ? null : (previewAvatar || user?.pfpImg);

  useEffect(() => {
    const loadInstructor = async () => {
      const data = await fetchPublicFields(['address', 'education']);
      if (data) {
        setInstructor(data);
        setEducationList(data.education || []);
      }
    };
    loadInstructor();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // upload to get new avatar url
    const uploadedUrl = await uploadAvatar(file);

    // if success show new avatar
    if (uploadedUrl) {
      setPreviewAvatar(uploadedUrl);
    }
  };

  const handleRemoveAvatar = (e) => {
    e.preventDefault(); // stop form submission (just in case)
    e.stopPropagation(); // stop clicking through to the image/label
    setPreviewAvatar(""); // clear the preview
  };

  const handleAdd = () => {
    setEducationList([...educationList, { degree: '', institution: '' }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  const handleRemove = (index) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  // #TODO: validation

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // collect data
    const formData = new FormData(e.target);

    // construct payload
    const payload = {
      name: formData.get('name'),
      bio: formData.get('bio'),
      address: formData.get('address'),
      education: educationList,
      //... more await
      pfpImg: previewAvatar !== null ? previewAvatar : user?.pfpImg,
    };

    toast.info("Comming soon")
    // await updateProfile(payload);
  };

  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="card-header-title mb-0">Edit Profile</h3>
      </CardHeader>
      <CardBody>
        <form className="row g-4" onSubmit={handleFormSubmit}>
          {/* AVATAR */}
          <Col xs={12} className="justify-content-center align-items-center">
            <label className="form-label">Profile Picture</label>
            <div className="d-flex align-items-center">
              {/* Show avatar */}
              <div className="position-relative me-4">
                <div
                  className="avatar avatar-xl position-relative"
                  style={{ cursor: currentAvatarSrc ? 'pointer' : 'default' }} // only clickable if image exists
                  onClick={() => currentAvatarSrc && setShowPreview(true)}
                >
                  {isAvatarUploading ? (
                    <div className="avatar-img rounded-circle border border-light border-3 shadow d-flex align-items-center justify-content-center bg-light">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : currentAvatarSrc ? (
                    <img
                      className="avatar-img rounded-circle border border-light border-3 shadow"
                      src={currentAvatarSrc}
                      alt="Avatar"
                    />
                  ) : (
                    <div className="avatar-img rounded-circle border border-light border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-1">
                      {(user?.name?.[0] || "I").toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Remove avatar */}
                {currentAvatarSrc && (
                  <button
                    type="button"
                    className="uploadremove"
                    onClick={handleRemoveAvatar}
                    style={{ zIndex: 10 }}
                    title="Remove profile picture"
                  >
                    <BsX className="bi bi-x text-white" />
                  </button>
                )}
              </div>
              {/* Upload avatar */}
              <div>
                <label className="btn btn-primary-soft mb-0" htmlFor="uploadfile-1">
                  {isAvatarUploading ? "Uploading..." : "Change"}
                </label>
                <input
                  id="uploadfile-1"
                  className="form-control d-none"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isAvatarUploading}
                />
              </div>
            </div>
          </Col>
          <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
            <Modal.Header closeButton className="py-2">
              <Modal.Title>Profile Picture</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center p-3">
              {currentAvatarSrc && (
                <img
                  src={currentAvatarSrc}
                  alt="Preview"
                  className="img-fluid rounded-circle border border-5  shadow"
                  style={{ width: '300px', height: '300px', objectFit: 'cover' }}
                />
              )}
            </Modal.Body>
          </Modal>

          {/* NAME */}
          <Col xs={12}>
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <input type="text" name="name" className="form-control" defaultValue={user?.name} />
            </div>
          </Col>

          {/* USERNAME */}
          <Col md={5}>
            <label className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text">eduverse.com/</span>
              <input type="text" className="form-control" defaultValue={user?.username} disabled />
            </div>
          </Col>

          {/* EMAIL */}
          <Col xs={7}>
            <label className="form-label">Email</label>
            <div className="input-group">
              <input type="text" className="form-control" defaultValue={user?.email} disabled />
            </div>
          </Col>

          {/* PHONENUMBER */}
          <Col xs={5}>
            <label className="form-label">Phone Number</label>
            <div className="input-group">
              <input type="text" className="form-control" defaultValue={user?.phone} disabled />
            </div>
          </Col>

          {/* ADDRESS */}
          <Col xs={7}>
            <label className="form-label">Address</label>
            <div className="input-group">
              <input type="text" name="address" className="form-control" defaultValue={instructor?.address || ''} />
            </div>
          </Col>

          {/* BIO */}
          <Col xs={12}>
            <label className="form-label">Bio</label>
            <textarea className="form-control" name="bio" rows={3} defaultValue={user?.bio} />
            <div className="form-text">Brief description for your profile.</div>
          </Col>

          {/* SOCIALS */}
          <div>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center">
                <FaFacebook className="fab fa-facebook text-facebook me-2 fs-5" />
                Facebook profile URL
              </label>
              <input className="form-control" type="text" placeholder="facebook.com/your_username" />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center">
                <BsTwitter className="bi bi-twitter text-twitter me-2 fs-5" />
                Twitter profile URL
              </label>
              <input className="form-control" type="text" placeholder="x.com/your_username" />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center">
                <FaInstagram className="fab fa-instagram text-danger me-2 fs-5" />
                Instagram profile URL
              </label>
              <input className="form-control" type="text" placeholder="instagram.com/your_username" />
            </div>
            <div className="">
              <label className="form-label d-flex align-items-center">
                <FaYoutube className="fab fa-youtube text-youtube me-2 fs-5" />
                YouTube channel URL
              </label>
              <input className="form-control" type="text" placeholder="youtube.com/@your_channel" />
            </div>
          </div>

          {/* EDUCATION */}
          {/* <Col xs={12}>
            <label className="form-label me-2">Education</label>
            {educationList.map((edu, index) => (
              <div className="input-group mb-2" key={index}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bachelor in..."
                  style={{ flexBasis: '30%' }}
                  value={edu.degree}
                  onChange={(e) => handleChange(index, 'degree', e.target.value)}
                />
                <span className="input-group-text">at</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="University of..."
                  value={edu.institution}
                  onChange={(e) => handleChange(index, 'institution', e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => handleRemove(index)}
                >
                  &times;
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-light mb-0 icon-center" onClick={handleAdd}>
              <BsPlus className="me-1" />
              Add
            </button>
          </Col> */}

          {/* SUBMISSION */}
          <div className="d-sm-flex justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={isAvatarUploading}>
              Save Changes
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default MyProfile;
