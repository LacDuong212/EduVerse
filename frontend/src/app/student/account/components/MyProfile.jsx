import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { BsX } from 'react-icons/bs';


const MyProfile = ({ user }) => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const loadStudent = async () => {
      
    };
    loadStudent();
  }, []);

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
                      alt="Student Avatar" />
                  ) : (
                    <div className="avatar-img rounded-circle border border-light border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-1">
                      {(user?.name?.[0] || "S").toUpperCase()}
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
              <input type="text" className="form-control" placeholder="student@example.com" defaultValue={user?.email} disabled />
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
              <input type="text" className="form-control" placeholder="123 Main St, City, Country" defaultValue={student?.address || ''} />
            </div>
          </Col>
          <Col xs={12}>
            <label className="form-label">Bio</label>
            <textarea className="form-control" rows={3} placeholder='I am not a robot...' defaultValue={user?.bio} />
            <div className="form-text">Brief description for your profile.</div>
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
