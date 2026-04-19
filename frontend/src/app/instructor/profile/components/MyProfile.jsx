import { Card, CardBody, CardHeader, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { BsPlus, BsQuestionCircle, BsX } from "react-icons/bs";
import { FaAngleRight, FaFacebook, FaGlobe, FaInstagram, FaLinkedin, FaUndo, FaYoutube } from "react-icons/fa";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Link } from "react-router-dom";
import { useMyProfile } from "../useMyProfile";

const MAX_EDUCATION_LENGTH = 5;
const MAX_SKILLS_LENGTH = 6;
const MAX_INPUT_LENGTH = {
  name: 70,
  occupation: 80,
  phonenumber: 18,
  address: 128,
  facebook: 128,
  instagram: 128,
  linkedin: 128,
  youtube: 128,
  website: 128,
  fieldOfStudy: 96,
  institution: 56,
  skillName: 60,
};

const QUILL_MODULES = {
  toolbar: [
    // header (1-6) + normal text (false)
    [{ "header": [1, 2, 3, 4, 5, 6, false] }],
    // font styles
    ["bold", "italic", "underline", "strike"],
    // lists & indents
    [{ "list": "ordered" }, { "list": "bullet" }],
    [{ "indent": "-1" }, { "indent": "+1" }],
    // text alignment
    [{ "align": [] }],
    // links
    ["link"],
    // color pickers
    [{ "color": [] }, { "background": [] }],
    // clean formatting
    ["clean"]
  ],
};
const QUILL_FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "indent",
  "link",
  "align", "color", "background",
];

const MyProfile = () => {
  const {
    instructor,
    updateField,
    errors,
    avatarLogic,
    listActions,
    handleFileChange,
    submitProfile
  } = useMyProfile();

  const educationList = instructor.education || [];
  const skillList = instructor.skills || [];

  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom d-flex align-items-center justify-content-between p-3">
        <h3 className="card-header-title mb-0">Edit Profile</h3>
        <Link className="fw-bold" to={instructor.insId ? `/instructors/${instructor.insId}` : "/instructors"}>
          My Public Profile<span className="fs-5"><FaAngleRight /></span>
        </Link>
      </CardHeader>
      <CardBody className="p-3">
        <form onSubmit={submitProfile}>
          <Row className="align-items-center g-3">
            {/* AVATAR */}
            <Col xs={12} md="auto">
              <div className="d-flex flex-column align-items-center me-2 gap-3">
                {/* Avatar */}
                <div className="mt-2 position-relative" style={{ width: "160px", height: "160px" }}>
                  {avatarLogic.currentSrc ? (
                    <img src={avatarLogic.currentSrc} className="rounded-3 border border-body border-3 shadow w-100 h-100 object-fit-cover" alt="Avatar" />
                  ) : (
                    <div className="rounded-3 border border-body border-3 shadow d-flex align-items-center justify-content-center bg-light w-100 h-100 fs-1 fw-bold">
                      {(instructor?.name?.[0] || "I").toUpperCase()}
                    </div>
                  )}
                  {/* Remove & Undo Buttons */}
                  {avatarLogic.currentSrc ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex align-items-center justify-content-center border border-2 border-white"
                      onClick={avatarLogic.remove}
                      style={{ width: "30px", height: "30px" }}
                    >
                      <BsX size={24} />
                    </button>
                  ) : (avatarLogic.hasSavedAvatar &&
                    <button
                      type="button"
                      className="btn btn-primary btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex align-items-center justify-content-center border border-2 border-white"
                      onClick={avatarLogic.undo}
                      style={{ width: "30px", height: "30px" }}
                    >
                      <FaUndo size={14} />
                    </button>
                  )}
                </div>
                {/* Upload Button */}
                <div>
                  <label className="btn btn-primary-soft btn-sm" htmlFor="uploadfile-1">
                    {avatarLogic.isUploading ? "Uploading..." : "Upload"}
                  </label>
                  <input id="uploadfile-1" className="d-none" type="file" onChange={handleFileChange} disabled={avatarLogic.isUploading} />
                </div>
              </div>
            </Col>

            {/* PERSONAL DETAILS */}
            <Col xs={12} md>
              <h5>Personal Details</h5>
              <Row className="g-3 g-md-4 mb-3">
                {/* Name */}
                <Col md={6}>
                  <label className="form-label mb-0">Full Name <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="name"
                      maxLength={MAX_INPUT_LENGTH.name}
                      className={`form-control ${errors.name ? "is-invalid rounded" : ""}`}
                      defaultValue={instructor?.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                    {errors.name && <div className="invalid-feedback rounded">{errors.name}</div>}
                  </div>
                </Col>
                {/* Opcupation */}
                <Col md={6}>
                  <label className="form-label mb-0">Occupation <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="occupation"
                      maxLength={MAX_INPUT_LENGTH.occupation}
                      className={`form-control ${errors.occupation ? "is-invalid rounded" : ""}`}
                      defaultValue={instructor?.occupation || ""}
                      onChange={(e) => updateField("occupation", e.target.value)}
                    />
                    {errors.occupation && <div className="invalid-feedback">{errors.occupation}</div>}
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
                      overlay={<Tooltip>Currently unchangable, sorry!</Tooltip>}
                    >
                      <BsQuestionCircle className="text-primary small ms-1 mb-1" />
                    </OverlayTrigger>
                  </label>
                  <div className="input-group">
                    <input type="text" className="form-control" defaultValue={instructor?.email || ""} disabled />
                  </div>
                </Col>
                {/* Phonenumber */}
                <Col md={6}>
                  <label className="form-label mb-0">Phone Number</label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="phonenumber"
                      maxLength={MAX_INPUT_LENGTH.phonenumber}
                      className={`form-control ${errors.phonenumber ? "is-invalid rounded" : ""}`}
                      defaultValue={instructor?.phonenumber || ""}
                      onChange={(e) => updateField("phonenumber", e.target.value)}
                    />
                    {errors.phonenumber && <div className="invalid-feedback">{errors.phonenumber}</div>}
                  </div>
                </Col>
              </Row>
            </Col>

            {/* Address */}
            <Col xs={12}>
              <label className="form-label mb-0">Address</label>
              <div className="input-group">
                <input
                  type="text"
                  name="address"
                  maxLength={MAX_INPUT_LENGTH.address}
                  className="form-control"
                  defaultValue={instructor?.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
            </Col>
          </Row>

          <Row className="mt-2 g-3">
            {/* INTRODUCTION */}
            <Col xs={12}>
              <h5>Introduction</h5>
              <div className="pb-5">
                <ReactQuill
                  theme="snow"
                  style={{ height: 300 }}
                  value={instructor?.introduction}
                  onChange={(content) => updateField("introduction", content)}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                />
              </div>
            </Col>
          </Row>

          <Row className="mt-3 mt-md-0 mb-2 g-4">
            {/* SOCIALS */}
            <Col md={6}>
              <h5 className="mb-2">Socials</h5>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center mb-0">
                  <FaFacebook className="fab fa-facebook text-facebook mb-1 me-2 fs-5" />
                  Facebook profile URL
                </label>
                <input
                  className="form-control"
                  maxLength={MAX_INPUT_LENGTH.facebook}
                  type="text"
                  name="facebook"
                  defaultValue={instructor?.socials?.facebook}
                  onChange={(e) => updateField("socials.facebook", e.target.value)}
                  placeholder="facebook.com/your_username"
                />
              </div>
              <div className="mb-3">
                <label
                  className="form-label d-flex align-items-center mb-0">
                  <FaInstagram className="fab fa-instagram text-danger mb-1 me-2 fs-5" />
                  Instagram profile URL
                </label>
                <input
                  className="form-control"
                  maxLength={MAX_INPUT_LENGTH.instagram} type="text"
                  name="instagram"
                  defaultValue={instructor?.socials?.instagram}
                  onChange={(e) => updateField("socials.instagram", e.target.value)}
                  placeholder="instagram.com/your_username"
                />
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center mb-0">
                  <FaLinkedin className="fa fa-linkedin text-linkedin mb-1 me-2 fs-5" />
                  Linkedin profile URL
                </label>
                <input
                  className="form-control"
                  maxLength={MAX_INPUT_LENGTH.linkedin}
                  type="text"
                  name="linkedin"
                  defaultValue={instructor?.socials?.linkedin}
                  onChange={(e) => updateField("socials.linkedin", e.target.value)}
                  placeholder="linkedin.com/in/your_username"
                />
              </div>
              <div className="">
                <label className="form-label d-flex align-items-center mb-0">
                  <FaYoutube className="fab fa-youtube text-youtube mb-1 me-2 fs-5" />
                  YouTube channel URL
                </label>
                <input
                  className="form-control"
                  maxLength={MAX_INPUT_LENGTH.youtube}
                  type="text"
                  name="youtube"
                  defaultValue={instructor?.socials?.youtube}
                  onChange={(e) => updateField("socials.youtube", e.target.value)}
                  placeholder="youtube.com/@your_channel"
                />
              </div>
            </Col>

            {/* WEBSITES */}
            <Col md={6}>
              <h5>Websites</h5>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center mb-0">
                  <FaGlobe className="text-success mb-1 me-2 fs-5" />
                  Website URL
                </label>
                <input
                  className="form-control"
                  maxLength={MAX_INPUT_LENGTH.website}
                  type="text"
                  name="website"
                  defaultValue={instructor?.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
            </Col>
          </Row>

          <Row className="mt-md-1 g-4">
            {/* EDUCATION */}
            <Col md={12}>
              <h5>Education</h5>
              {educationList.map((edu, index) => (
                <div className="input-group mb-2" key={index}>
                  <input
                    type="text"
                    className={`form-control ${(edu.fieldOfStudy === "" && educationList.length > 0) ? "border-danger" : ""}`}
                    placeholder="Bachelor in..."
                    style={{ flexBasis: "30%" }}
                    defaultValue={edu.fieldOfStudy}
                    onChange={(e) => listActions.updateEducation(index, "fieldOfStudy", e.target.value)}
                    maxLength={MAX_INPUT_LENGTH.fieldOfStudy}
                  />
                  <span className="input-group-text bg-light">at</span>
                  <input
                    type="text"
                    className={`form-control ${(edu.institution === "" && educationList.length > 0) ? "border-danger" : ""}`}
                    placeholder="University..."
                    defaultValue={edu.institution}
                    onChange={(e) => listActions.updateEducation(index, "institution", e.target.value)}
                    maxLength={MAX_INPUT_LENGTH.institution}
                  />
                  <button
                    type="button"
                    className="btn btn-danger-soft border p-0"
                    onClick={() => listActions.removeEducation(index)}
                    title="Remove Education"
                  >
                    <BsX size={23} />
                  </button>
                </div>
              ))}
              {educationList.length < MAX_EDUCATION_LENGTH && (
                <button type="button" className="btn btn-sm btn-light mb-0 d-flex align-items-center" onClick={listActions.addEducation}>
                  <BsPlus className="mb-1 me-1 fs-5" /> Add Education
                </button>
              )}
            </Col>
          </Row>

          <Row className="mt-2 g-4">
            {/* SKILLS */}
            <h5>Skills</h5>
            {skillList.map((skill, index) => (
              <Col sm={12} md={6} lg={4} key={index} className="mt-0">
                <div className="input-group mb-1">
                  <input
                    type="text"
                    className={`form-control ${(skill.name === "" && skillList.length > 0) ? "border-danger" : ""}`}
                    placeholder="Web Design..."
                    defaultValue={skill.name}
                    onChange={(e) => listActions.updateSkill(index, "level", Number(e.target.value))}
                    maxLength={MAX_INPUT_LENGTH.skillName}
                  />
                  <span className="input-group-text text-primary" title="Evaluation">
                    {skill.level}%
                  </span>
                  <button
                    type="button"
                    className="btn btn-danger-soft border p-0"
                    onClick={() => listActions.removeSkill(index)}
                    title="Remove skill"
                  >
                    <BsX size={23} />
                  </button>
                </div>
                <div className="d-flex align-items-center small mt-1 mb-2">
                  <span className="me-2">0</span>
                  <input
                    type="range"
                    className="form-range flex-grow-1"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={skill.level}
                    onChange={(e) => listActions.updateSkill(index, "level", Number(e.target.value))}
                  />
                  <span className="ms-2">100</span>
                </div>
              </Col>
            ))}
            <div className="mt-0">
              {skillList.length < MAX_SKILLS_LENGTH && (
                <button type="button" className="btn btn-sm btn-light mb-0 d-flex align-items-center" onClick={listActions.addSkill}>
                  <BsPlus className="mb-1 me-1 fs-5" /> Add Skill
                </button>
              )}
            </div>
          </Row>

          {/* SUBMISSION */}
          <div className="d-flex justify-content-center justify-content-md-end mt-4">
            <button type="submit" className="btn btn-primary mb-0" disabled={avatarLogic.isUploading}>
              Save Changes
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default MyProfile;