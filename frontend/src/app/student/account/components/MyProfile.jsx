import { useMemo } from "react";
import { Card, CardBody, CardHeader, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { BsQuestionCircle, BsX } from "react-icons/bs";
import { FaFacebook, FaGlobe, FaInstagram, FaLinkedin, FaUndo, FaYoutube } from "react-icons/fa";
import useMyProfile from "../useMyProfile";

const MAX_INPUT_LENGTH = {
  name: 48,
  phonenumber: 18,
  bio: 256,
  facebook: 128,
  instagram: 128,
  linkedin: 128,
  youtube: 128,
  website: 128,
};

const MAX_BIO_LINES = 5;

const MyProfile = () => {
  const {
    student,
    updateField,
    avatarLogic,
    handleFileChange,
    submitProfile,
    errors,
    loading,
    submitting,
    isDirty,
  } = useMyProfile();

  const disableSubmit = avatarLogic.isUploading || loading || submitting || !isDirty;

  const getFieldProps = (fieldName) => ({
    isinvalid: errors?.[fieldName],
    className: `form-control ${errors?.[fieldName] ? "is-invalid" : ""}`,
  });

  const avatarText = useMemo(() => {
    return (student?.name?.[0] || "S").toUpperCase();
  }, [student?.name]);

  const handleBioChange = (e) => {
    const value = e.target.value;
    const lines = value.split(/\r\n|\r|\n/);

    if (lines.length <= MAX_BIO_LINES) {
      updateField("bio", value);
    }
  };

  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="card-header-title mb-0">Edit Profile</h3>
      </CardHeader>

      <CardBody>
        <form onSubmit={submitProfile}>
          <Row className="align-items-center g-3">
            <Col xs={12} md="auto">
              <div className="d-flex flex-column align-items-center me-2 gap-3">
                <div className="mt-2 position-relative" style={{ width: "160px", height: "160px" }}>
                  {avatarLogic.currentSrc ? (
                    <img
                      src={avatarLogic.currentSrc}
                      className="rounded-3 border border-body border-3 shadow w-100 h-100 object-fit-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="rounded-3 border border-body border-3 shadow d-flex align-items-center justify-content-center bg-light w-100 h-100 fs-1 fw-bold">
                      {avatarText}
                    </div>
                  )}

                  {avatarLogic.currentSrc ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex align-items-center justify-content-center border border-2 border-white"
                      onClick={avatarLogic.remove}
                      style={{ width: "30px", height: "30px" }}
                    >
                      <BsX size={24} />
                    </button>
                  ) : (
                    avatarLogic.hasSavedAvatar && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex align-items-center justify-content-center border border-2 border-white"
                        onClick={avatarLogic.undo}
                        style={{ width: "30px", height: "30px" }}
                      >
                        <FaUndo size={14} />
                      </button>
                    )
                  )}
                </div>

                <div>
                  <label className="btn btn-primary-soft btn-sm" htmlFor="uploadfile-1">
                    {avatarLogic.isUploading ? "Uploading..." : "Change"}
                  </label>
                  <input
                    id="uploadfile-1"
                    className="d-none"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={avatarLogic.isUploading}
                  />
                </div>
              </div>
            </Col>

            <Col xs={12} md>
              <Row className="g-3 g-md-4 mb-3">
                <Col>
                  <label className="form-label mb-0">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="name"
                      maxLength={MAX_INPUT_LENGTH.name}
                      value={student?.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      {...getFieldProps("name")}
                    />
                    {errors?.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                </Col>
              </Row>

              <Row className="g-3 g-md-4">
                <Col md={6}>
                  <label className="form-label mb-0">
                    Email
                    <OverlayTrigger
                      placement="right"
                      overlay={<Tooltip>Currently unchangeable, sorry!</Tooltip>}
                    >
                      <BsQuestionCircle className="text-primary small ms-1 mb-1" />
                    </OverlayTrigger>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={student?.email || ""}
                      disabled
                      readOnly
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <label className="form-label mb-0">Phone Number</label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="phonenumber"
                      maxLength={MAX_INPUT_LENGTH.phonenumber}
                      value={student?.phonenumber || ""}
                      onChange={(e) => updateField("phonenumber", e.target.value)}
                      {...getFieldProps("phonenumber")}
                    />
                    {errors?.phonenumber && (
                      <div className="invalid-feedback">{errors.phonenumber}</div>
                    )}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          <Col xs={12}>
            <label className="h5 form-label mt-4">Bio</label>
            <textarea
              className={`form-control ${errors?.bio ? "is-invalid" : ""}`}
              maxLength={MAX_INPUT_LENGTH.bio}
              name="bio"
              rows={3}
              placeholder="I am not a robot..."
              value={student?.bio || ""}
              onChange={handleBioChange}
            />
            {errors?.bio && <div className="invalid-feedback">{errors.bio}</div>}
            <div className="form-text">Brief description for your profile. Max 5 lines.</div>
          </Col>

          <Col xs={12}>
            <h5 className="card-header-title mt-4 mb-3">Social Media</h5>

            <div className="mb-3">
              <label className="form-label d-flex align-items-center">
                <FaFacebook className="fab fa-facebook text-facebook me-2 fs-5" />
                Facebook profile URL
              </label>
              <div className="input-group">
                <input
                  maxLength={MAX_INPUT_LENGTH.facebook}
                  type="text"
                  name="facebook"
                  placeholder="facebook.com/your_username"
                  value={student?.socials?.facebook || ""}
                  onChange={(e) => updateField("socials.facebook", e.target.value)}
                  {...getFieldProps("socials.facebook")}
                />
                {errors?.["socials.facebook"] && (
                  <div className="invalid-feedback">{errors["socials.facebook"]}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label d-flex align-items-center mb-0">
                <FaInstagram className="fab fa-instagram text-danger mb-1 me-2 fs-5" />
                Instagram profile URL
              </label>
              <div className="input-group">
                <input
                  maxLength={MAX_INPUT_LENGTH.instagram}
                  type="text"
                  name="instagram"
                  placeholder="instagram.com/your_username"
                  value={student?.socials?.instagram || ""}
                  onChange={(e) => updateField("socials.instagram", e.target.value)}
                  {...getFieldProps("socials.instagram")}
                />
                {errors?.["socials.instagram"] && (
                  <div className="invalid-feedback">{errors["socials.instagram"]}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label d-flex align-items-center mb-0">
                <FaLinkedin className="fa fa-linkedin text-linkedin mb-1 me-2 fs-5" />
                Linkedin profile URL
              </label>
              <div className="input-group">
                <input
                  maxLength={MAX_INPUT_LENGTH.linkedin}
                  type="text"
                  name="linkedin"
                  placeholder="linkedin.com/in/your_username"
                  value={student?.socials?.linkedin || ""}
                  onChange={(e) => updateField("socials.linkedin", e.target.value)}
                  {...getFieldProps("socials.linkedin")}
                />
                {errors?.["socials.linkedin"] && (
                  <div className="invalid-feedback">{errors["socials.linkedin"]}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label d-flex align-items-center mb-0">
                <FaYoutube className="fab fa-youtube text-youtube mb-1 me-2 fs-5" />
                YouTube channel URL
              </label>
              <div className="input-group">
                <input
                  maxLength={MAX_INPUT_LENGTH.youtube}
                  type="text"
                  name="youtube"
                  placeholder="youtube.com/@your_channel"
                  value={student?.socials?.youtube || ""}
                  onChange={(e) => updateField("socials.youtube", e.target.value)}
                  {...getFieldProps("socials.youtube")}
                />
                {errors?.["socials.youtube"] && (
                  <div className="invalid-feedback">{errors["socials.youtube"]}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label d-flex align-items-center mb-0">
                <FaGlobe className="text-success mb-1 me-2 fs-5" />
                Website URL
              </label>
              <div className="input-group">
                <input
                  maxLength={MAX_INPUT_LENGTH.website}
                  type="text"
                  name="website"
                  placeholder="https://www.example.com"
                  value={student?.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  {...getFieldProps("website")}
                />
                {errors?.website && <div className="invalid-feedback">{errors.website}</div>}
              </div>
            </div>
          </Col>

          <div className="d-flex justify-content-center justify-content-md-end mt-4">
            <button type="submit" className="btn btn-primary mb-0" disabled={disableSubmit}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default MyProfile;