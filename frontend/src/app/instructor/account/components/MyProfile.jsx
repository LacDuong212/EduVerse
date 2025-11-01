import useProfile from '@/hooks/useProfile';
import useInstructor from '../../useInstructor';
import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { BsPlus, BsX } from 'react-icons/bs';


const MyProfile = () => {
  const { user } = useProfile();
  const { fetchPublicFields } = useInstructor();
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    const loadInstructor = async () => {
      const data = await fetchPublicFields(['address', 'education']);
      if (data) setInstructor(data);
    };
    loadInstructor();
  }, []);

  const [educationList, setEducationList] = useState([]);

  useEffect(() => {
    if (instructor) setEducationList(instructor.education || []);
  }, []);

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

  const handleSubmit = () => {

  };

  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="card-header-title mb-0">Edit Profile</h3>
      </CardHeader>
      <CardBody>
        <form className="row g-4" onSubmit={handleSubmit(() => { })}>
          <Col xs={12} className="justify-content-center align-items-center">
            <label className="form-label">Profile Picture</label>
            <div className="d-flex align-items-center">
              <label className="position-relative me-4" htmlFor="uploadfile-1" title="Replace this pic">
                <span className="avatar avatar-xl">
                  {user?.pfpImg ? (
                    <img
                      className="avatar-img rounded-circle border border-light border-3 shadow"
                      src={user.pfpImg}
                      alt="Instructor Avatar" />
                  ) : (
                    <div className="avatar-img rounded-circle border border-light border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-1">
                      {(user?.name?.[0] || "I").toUpperCase()}
                    </div>
                  )}
                </span>
                <button type="button" className="uploadremove">
                  <BsX className="bi bi-x text-white" />
                </button>
              </label>
              <label className="btn btn-primary-soft mb-0" htmlFor="uploadfile-1">
                Change
              </label>
              <input id="uploadfile-1" className="form-control d-none" type="file" />
            </div>
          </Col>
          <Col xs={12}>
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Eg. Edu Verse" defaultValue={user?.name} />
            </div>
          </Col>
          <Col md={5}>
            <label className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text">eduverse.com/</span>
              <input type="text" className="form-control" placeholder="eduVerse_01" defaultValue={user?.username} />
            </div>
          </Col>
          <Col xs={7}>
            <label className="form-label">Email</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="instructor@example.com" defaultValue={user?.email} disabled />
            </div>
          </Col>
          <Col xs={5}>
            <label className="form-label">Phone Number</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="+84123456789 or 0123456789, etc." defaultValue={user?.phone} disabled />
            </div>
          </Col>
          <Col xs={7}>
            <label className="form-label">Address</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="123 Main St, City, Country" defaultValue={instructor?.address || ''} />
            </div>
          </Col>
          <Col xs={12}>
            <label className="form-label">Bio</label>
            <textarea className="form-control" rows={3} placeholder='I am not a robot...' defaultValue={user?.bio} />
            <div className="form-text">Brief description for your profile.</div>
          </Col>
          <Col xs={12}>
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
            <button className="btn btn-sm btn-light mb-0 icon-center" onClick={handleAdd}>
              <BsPlus className="me-1" />
              Add
            </button>
          </Col>
          <div className="d-sm-flex justify-content-end">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default MyProfile;
