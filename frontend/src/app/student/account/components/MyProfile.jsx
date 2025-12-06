import useProfile from '@/hooks/useProfile';
import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { BsQuestionCircle, BsTwitter, BsX } from "react-icons/bs";
import { FaFacebook, FaGlobe, FaInstagram, FaUndo, FaYoutube } from "react-icons/fa";
import { toast } from 'react-toastify';

const MyProfile = () => {
  const { user, uploadAvatar, isAvatarUploading } = useProfile();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const currentAvatarSrc = previewAvatar === "" ? null : (previewAvatar || user?.pfpImg);

  useEffect(() => {

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

  const handleUndoAvatar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewAvatar(null);
  };

  const handleRemoveAvatar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewAvatar("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // collect data
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const phonenumber = formData.get("phonenumber");

    // validate input
    // name: required
    // phonenumber: valid phone number (regex) if provided

    const payload = {
      name: name,
      phonenumber: phonenumber,
      pfpImg: currentAvatarSrc,
      bio: formData.get("bio"),
      socials: {
        facebook: formData.get("facebook"),
        twitter: formData.get("twitter"),
        instagram: formData.get("instagram"),
        youtube: formData.get("youtube"),
      },
      website: formData.get("website"),
    };

    console.log("profileData: ", payload);  // temp, testing
    toast.info("Comming soon");
  };

  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="card-header-title mb-0">Edit Profile</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Row className="align-items-center g-3">
            <Col xs={12} md="auto">
              <div className="d-flex flex-column align-items-center me-2 gap-3">
                <div className="mt-2 position-relative" style={{ width: "160px", height: "160px" }}>
                  {currentAvatarSrc ? (
                    <img src={currentAvatarSrc} className="rounded-3 border border-dark border-3 shadow w-100 h-100 object-fit-cover" alt="Avatar" />
                  ) : (
                    <div className="rounded-3 border border-dark border-3 shadow d-flex align-items-center justify-content-center bg-light w-100 h-100 fs-1 fw-bold">{(user?.name?.[0] || "U").toUpperCase()}</div>
                  )}
                  {currentAvatarSrc ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex align-items-center justify-content-center border border-2 border-white"
                      onClick={handleRemoveAvatar}
                      style={{ width: "30px", height: "30px" }}
                    >
                      <BsX size={24} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex align-items-center justify-content-center border border-2 border-white"
                      onClick={handleUndoAvatar}
                      style={{ width: "30px", height: "30px" }}
                    >
                      <FaUndo size={14} />
                    </button>
                  )}
                </div>
                <div>
                  <label className="btn btn-primary-soft btn-sm" htmlFor="uploadfile-1">{isAvatarUploading ? "Uploading..." : "Change"}</label>
                  <input id="uploadfile-1" className="d-none" type="file" onChange={handleFileChange} disabled={isAvatarUploading} />
                </div>
              </div>
            </Col>

            <Col xs={12} md>
              <Row className="g-3 g-md-4 mb-3">
                <Col>
                  <label className="form-label mb-0">Full Name <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      defaultValue={user?.name || ""}
                    />
                  </div>
                </Col>
              </Row>

              <Row className="g-3 g-md-4">
                {/* Email */}
                <Col md={6}>
                  <label className="form-label mb-0">
                    Email
                    <OverlayTrigger
                      placement="right"
                      overlay={<Tooltip>Can be changed in Settings</Tooltip>}
                    >
                      <BsQuestionCircle className="text-primary small ms-1 mb-1" />
                    </OverlayTrigger>
                  </label>
                  <div className="input-group">
                    <input type="text" className="form-control" defaultValue={user?.email || ''} disabled />
                  </div>
                </Col>
                {/* Phonenumber */}
                <Col md={6}>
                  <label className="form-label mb-0">Phone Number</label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="phonenumber"
                      className="form-control"
                      defaultValue={user?.phonenumber || ''}
                    />
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          <Col xs={12}>
            <label className="h5 form-label mt-4">Bio</label>
            <textarea className="form-control" name="bio" rows={3} placeholder='I am not a robot...' defaultValue={user?.bio} />
            <div className="form-text">Brief description for your profile.</div>
          </Col>

          <Col xs={12}>
            <h5 className="card-header-title mt-4 mb-3">Social Media</h5>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center">
                <FaFacebook className="fab fa-facebook text-facebook me-2 fs-5" />
                Facebook profile URL
              </label>
              <input className="form-control" type="text" name="facebook" placeholder="facebook.com/your_username" defaultValue={user?.socials?.facebook || ''} />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center mb-0">
                <BsTwitter className="bi bi-twitter text-twitter mb-1 me-2 fs-5" />
                Twitter profile URL
              </label>
              <input className="form-control" type="text" name="twitter" placeholder="x.com/your_username" defaultValue={user?.socials?.twitter || ''} />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center mb-0">
                <FaInstagram className="fab fa-instagram text-danger mb-1 me-2 fs-5" />
                Instagram profile URL
              </label>
              <input className="form-control" type="text" name="instagram" placeholder="instagram.com/your_username" defaultValue={user?.socials?.instagram || ''} />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center mb-0">
                <FaYoutube className="fab fa-youtube text-youtube mb-1 me-2 fs-5" />
                YouTube channel URL
              </label>
              <input className="form-control" type="text" name="youtube" placeholder="youtube.com/@your_channel" defaultValue={user?.socials?.youtube || ''} />
            </div>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center mb-0">
                <FaGlobe className="text-success mb-1 me-2 fs-5" />
                Website URL
              </label>
              <input className="form-control" type="text" name="website" defaultValue={user?.website || ''} placeholder="https://www.example.com" />
            </div>
          </Col>

          <div className="d-flex justify-content-center justify-content-md-end mt-4">
            <button type="submit" className="btn btn-primary mb-0" disabled={isAvatarUploading}>
              Save Changes
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default MyProfile;
