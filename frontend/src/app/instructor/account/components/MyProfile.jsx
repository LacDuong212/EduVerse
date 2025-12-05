import useProfile from "@/hooks/useProfile";
import useInstructor from "../../useInstructor";
import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { BsPlus, BsQuestionCircle, BsTwitter, BsX } from "react-icons/bs";
import { FaAngleRight, FaFacebook, FaGlobe, FaInstagram, FaUndo, FaYoutube } from "react-icons/fa";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";


// constants ---
const MAX_EDUCATION_LENGTH = 5;
const MAX_SKILLS_LENGTH = 6;

// react-quill settings ---
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
// define supported formats (good for security/cleanup)
const QUILL_FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "indent",
  "link",
  "align", "color", "background",
];

// main component ---
const MyProfile = () => {
  // hooks
  const { uploadAvatar, isAvatarUploading } = useProfile();
  const { fetchInstructorProfile, updateInstructorProfile } = useInstructor();

  // fields
  const [instructor, setInstructor] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [introduction, setIntroduction] = useState("");
  const [educationList, setEducationList] = useState([]);
  const [skillList, setSkillList] = useState([]);

  const [errors, setErrors] = useState({});

  // helper
  const currentAvatarSrc = previewAvatar === "" ? null : (previewAvatar || instructor?.pfpImg);

  useEffect(() => {
    const loadInstructor = async () => {
      const { instructor } = await fetchInstructorProfile();
      if (instructor) {
        setInstructor(instructor);
        setEducationList(instructor.education || []);
        setSkillList(instructor.skills || []);
        setIntroduction(instructor.introduction || `<h5>Hello, I am</h5><h1>${instructor.name || "Instructor"}</h1><p>${instructor.occupation || ""}</p>`);
      }
    };
    loadInstructor();
  }, []);

  // avatar handlers ---
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
    e.preventDefault();   // stop form submission (just in case)
    e.stopPropagation();  // stop clicking through to the image/label
    setPreviewAvatar("");
  };

  // education handlers ---
  const handleAddEducation = () => {
    if (educationList.length < MAX_EDUCATION_LENGTH) {
      setEducationList([...educationList, { fieldOfStudy: "", institution: "" }]);
    }
  };
  const handleEducationChange = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };
  const handleRemoveEducation = (index) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  // skills handlers ---
  const handleAddSkill = () => {
    if (skillList.length < MAX_SKILLS_LENGTH) {
      setSkillList([...skillList, { name: "", level: 50 }]);
    }
  };
  const handleSkillChange = (index, field, value) => {
    const updated = [...skillList];
    updated[index][field] = value;
    setSkillList(updated);
  };
  const handleRemoveSkill = (index) => {
    setSkillList(skillList.filter((_, i) => i !== index));
  };

  // validation & submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // reset errors

    // collect data
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const occupation = formData.get("occupation");
    const phonenumber = formData.get("phonenumber");

    // validation ---
    const newErrors = {};

    if (!name || name.trim() === "") newErrors.name = "Name is required";
    if (!occupation || occupation.trim() === "") newErrors.occupation = "Occupation is required";

    if (phonenumber && phonenumber.trim() !== "") {
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(phonenumber)) {
        newErrors.phonenumber = "Invalid phone number format";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }

    const isEducationInvalid = educationList.some(edu => !edu.institution.trim() || !edu.fieldOfStudy.trim());
    if (isEducationInvalid) {
      toast.error("Please fill out all Education fields (Institution & Field of Study)");
      return;
    }

    const isSkillsInvalid = skillList.some(skill => !skill.name.trim());
    if (isSkillsInvalid) {
      toast.error("Please provide a name for all Skills");
      return;
    }

    // construct payload
    const payload = {
      name: name,
      occupation: occupation,
      phonenumber: phonenumber,
      address: formData.get("address"),
      // rich text & arrays (from state)
      introduction: introduction,
      education: educationList,
      skills: skillList,
      // avatar logic
      pfpImg: previewAvatar !== null ? previewAvatar : instructor?.pfpImg,
      // socials
      socials: {
        facebook: formData.get("facebook"),
        twitter: formData.get("twitter"),
        instagram: formData.get("instagram"),
        youtube: formData.get("youtube"),
      },
      website: formData.get("website"),
    };

    try {
      await updateInstructorProfile(payload);

    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom d-flex align-items-center justify-content-between p-3">
        <h3 className="card-header-title mb-0">Edit Profile</h3>
        <Link className="fw-bold" to={instructor?.id ? `/instructors/${instructor.id}` : "/instructors"}>
          My Public Profile<span className="fs-5"><FaAngleRight /></span>
        </Link>
      </CardHeader>
      <CardBody className="p-3">
        <form onSubmit={handleFormSubmit}>
          <Row className="align-items-center g-3">
            {/* AVATAR */}
            <Col xs={12} md="auto">
              <div className="d-flex flex-column align-items-center me-2 gap-3">
                {/* Avatar */}
                <div className="mt-2 position-relative" style={{ width: "160px", height: "160px" }}>
                  {currentAvatarSrc ? (
                    <img src={currentAvatarSrc} className="rounded-3 border border-dark border-3 shadow w-100 h-100 object-fit-cover" alt="Avatar" />
                  ) : (
                    <div className="rounded-3 border border-dark border-3 shadow d-flex align-items-center justify-content-center bg-light w-100 h-100 fs-1 fw-bold">{(instructor?.name?.[0] || "I").toUpperCase()}</div>
                  )}
                  {/* Remove & Undo Buttons */}
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
                {/* Upload Button */}
                <div>
                  <label className="btn btn-primary-soft btn-sm" htmlFor="uploadfile-1">{isAvatarUploading ? "Uploading..." : "Change"}</label>
                  <input id="uploadfile-1" className="d-none" type="file" onChange={handleFileChange} disabled={isAvatarUploading} />
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
                      className={`form-control ${errors.name ? "is-invalid rounded" : ""}`}
                      defaultValue={instructor?.name || ""}
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
                      className={`form-control ${errors.occupation ? "is-invalid rounded" : ""}`}
                      defaultValue={instructor?.occupation || ""}
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
                      overlay={<Tooltip>Can be changed in Settings</Tooltip>}
                    >
                      <BsQuestionCircle className="text-primary small ms-1 mb-1" />
                    </OverlayTrigger>
                  </label>
                  <div className="input-group">
                    <input type="text" className="form-control" defaultValue={instructor?.email || ''} disabled />
                  </div>
                </Col>
                {/* Phonenumber */}
                <Col md={6}>
                  <label className="form-label mb-0">Phone Number</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      name="phonenumber" 
                      className={`form-control ${errors.phonenumber ? "is-invalid rounded" : ""}`} 
                      defaultValue={instructor?.phonenumber || ''} 
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
                <input type="text" name="address" className="form-control" defaultValue={instructor?.address || ""} />
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
                  value={introduction}
                  onChange={setIntroduction}
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
                <input className="form-control" type="text" name="facebook" defaultValue={instructor?.socials?.facebook} placeholder="facebook.com/your_username" />
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center mb-0">
                  <BsTwitter className="bi bi-twitter text-twitter mb-1 me-2 fs-5" />
                  Twitter profile URL
                </label>
                <input className="form-control" type="text" name="twitter" defaultValue={instructor?.socials?.twitter} placeholder="x.com/your_username" />
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center mb-0">
                  <FaInstagram className="fab fa-instagram text-danger mb-1 me-2 fs-5" />
                  Instagram profile URL
                </label>
                <input className="form-control" type="text" name="instagram" defaultValue={instructor?.socials?.instagram} placeholder="instagram.com/your_username" />
              </div>
              <div className="">
                <label className="form-label d-flex align-items-center mb-0">
                  <FaYoutube className="fab fa-youtube text-youtube mb-1 me-2 fs-5" />
                  YouTube channel URL
                </label>
                <input className="form-control" type="text" name="youtube" defaultValue={instructor?.socials?.youtube} placeholder="youtube.com/@your_channel" />
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
                <input className="form-control" type="text" name="website" defaultValue={instructor?.website} placeholder="https://www.example.com" />
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
                    value={edu.fieldOfStudy}
                    onChange={(e) => handleEducationChange(index, "fieldOfStudy", e.target.value)}
                  />
                  <span className="input-group-text bg-light">at</span>
                  <input
                    type="text"
                    className={`form-control ${(edu.institution === "" && educationList.length > 0) ? "border-danger" : ""}`}
                    placeholder="University..."
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-danger-soft border p-0"
                    onClick={() => handleRemoveEducation(index)}
                    title="Remove education"
                  >
                    <BsX size={23} />
                  </button>
                </div>
              ))}
              {educationList.length < MAX_EDUCATION_LENGTH && (
                <button type="button" className="btn btn-sm btn-light mb-0 d-flex align-items-center" onClick={handleAddEducation}>
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
                    value={skill.name}
                    onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                  />
                  <span className="input-group-text text-primary" title="Evaluation">
                    {skill.level}%
                  </span>
                  <button
                    type="button"
                    className="btn btn-danger-soft border p-0"
                    onClick={() => handleRemoveSkill(index)}
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
                    value={skill.level}
                    onChange={(e) => handleSkillChange(index, "level", Number(e.target.value))}
                  />
                  <span className="ms-2">100</span>
                </div>
              </Col>
            ))}
            <div className="mt-0">
              {skillList.length < MAX_SKILLS_LENGTH && (
                <button type="button" className="btn btn-sm btn-light mb-0 d-flex align-items-center" onClick={handleAddSkill}>
                  <BsPlus className="mb-1 me-1 fs-5" /> Add Skill
                </button>
              )}
            </div>
          </Row>

          {/* SUBMISSION */}
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
