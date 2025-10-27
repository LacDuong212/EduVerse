import TextFormInput from '@/components/form/TextFormInput';

import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BsPlus, BsX } from 'react-icons/bs';
import * as yup from 'yup';


const MyProfile = () => {
  const instructorSchema = yup.object({
    fullname: yup.string().required('Please enter your full name'),
    username: yup.string().required('Please enter your username'),
    address: yup.string()
  });

  const {
    handleSubmit
  } = useForm({
    resolver: yupResolver(instructorSchema)
  });

  const instructorData = {
    name: 'Duckle Munchkin',
    username: 'duckle0munchkin',
    email: 'duckle.munchkin@example.com',
    bio: 'I am NOT a duck!',
    address: '18th Main St., Heather City, Heaven',
    pfpImg: 'https://res.cloudinary.com/dw1fjzfom/image/upload/v1761585729/7bd60af2-97e7-4c08-a35f-5a614d92052d.png'
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
                  {instructorData?.pfpImg ? (
                    <img
                      className="avatar-img rounded-circle border border-white border-3 shadow"
                      src={instructorData.pfpImg}
                      alt="Instructor Avatar" />
                  ) : (
                    <div className="avatar-img rounded-circle border border-white border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-1">
                      {(instructorData?.name?.[0] || "I").toUpperCase()}
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
              <input type="text" className="form-control" placeholder="Eg. Edu Verse" defaultValue={instructorData?.name} />
            </div>
          </Col>
          <Col md={5}>
            <label className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text">eduverse.com/</span>
              <input type="text" className="form-control" placeholder="eduVerse_01" defaultValue={instructorData?.username} />
            </div>
          </Col>
          <Col xs={7}>
            <label className="form-label">Email</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="instructor@example.com" defaultValue={instructorData?.email} disabled />
            </div>
          </Col>
          <Col xs={5}>
            <label className="form-label">Phone Number</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="+84123456789 or 0123456789, etc." defaultValue={instructorData?.phone} disabled />
            </div>
          </Col>
          <Col xs={7}>
            <label className="form-label">Address</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="123 Main St, City, Country" defaultValue={instructorData?.address} />
            </div>
          </Col>
          <Col xs={12}>
            <label className="form-label">Bio</label>
            <textarea className="form-control" rows={3} placeholder='I am not a robot...' defaultValue={instructorData?.bio} />
            <div className="form-text">Brief description for your profile.</div>
          </Col>
          <Col xs={12}>
            <label className="form-label">Education</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Bachelor in..."
                style={{ flexBasis: '30%' }}
                defaultValue={instructorData?.degree}
              />
              <span className="input-group-text">at</span>
              <input
                type="text"
                className="form-control"
                placeholder="University of..."
                defaultValue={instructorData?.school}
              />
            </div>
            <button className="btn btn-sm btn-light mb-0 icon-center">
              <BsPlus className="me-1" />
              Add more
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
