import axios from "axios";
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from "react-toastify";
import * as yup from 'yup';
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';


const Banner = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { userData } = useSelector((state) => state.auth);

  const [isInstructor, setIsInstructor] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  const FormSchema = yup.object({
    name: yup.string().required('Please enter your name'),
    email: yup.string().email('Please enter valid email').required('Please enter your Email'),
    description: yup.string().required('Please enter your description')
  });
  const {
    control,
    handleSubmit,
    setValue
  } = useForm({
    resolver: yupResolver(FormSchema)
  });

  useEffect(() => {
    if (userData) {
      setValue("name", userData.name || userData.fullName || userData.username || "");
      setValue("email", userData.email || "");

      checkInstructorStatus();
    } else {
      setIsLoadingCheck(false);
    }
  }, [userData, setValue]);

  const checkInstructorStatus = async () => {
    if (userData?.role.toLowerCase() === "instructor") {
      setIsLoadingCheck(false);
      setIsRegistered(true);
      setIsInstructor(true);
      return;
    }

    setIsLoadingCheck(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/instructor/me`,
        { withCredentials: true }
      );

      if (res.data.success && res.data.instructor) {
        setIsRegistered(true);
      }
    } catch (error) {
      setIsRegistered(false);
    } finally {
      setIsLoadingCheck(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/instructors`,
        data,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Instructor created successfully!");
        setIsRegistered(true);
      } else {
        toast.warning(res.data.message || "Unexpected response from server.");
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Already registered')) {
        setIsRegistered(true);
        toast.info("You are already registered.");
      } else {
        const msg = err.response?.data?.message || "Failed to register instructor.";
        toast.error(msg);
      }
    }
  };

  return <section className="bg-light py-5 position-relative overflow-hidden">
    <figure className="fill-primary opacity-1 position-absolute top-50 end-0 me-n6 d-none d-sm-block">
      <svg width="211px" height="211px">
        <path d="M210.030,105.011 C210.030,163.014 163.010,210.029 105.012,210.029 C47.013,210.029 -0.005,163.014 -0.005,105.011 C-0.005,47.015 47.013,-0.004 105.012,-0.004 C163.010,-0.004 210.030,47.015 210.030,105.011 Z" />
      </svg>
    </figure>
    <figure className="fill-primary position-absolute top-50 start-100 translate-middle ms-n7 mt-7 d-none d-sm-block">
      <svg className="opacity-5" enableBackground="new 0 0 160.7 159.8" height="180px">
        <path d="m153.2 114.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <path d="m116.4 114.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m134.8 114.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m135.1 96.9c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m153.5 96.9c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <path d="m98.3 96.9c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <ellipse cx="116.7" cy="99.1" rx="2.1" ry="2.2" />
        <path d="m153.2 149.8c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.3 0.9-2.2 2.1-2.2z" />
        <path d="m135.1 132.2c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2 0-1.3 0.9-2.2 2.1-2.2z" />
        <path d="m153.5 132.2c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.3 0.9-2.2 2.1-2.2z" />
        <path d="m80.2 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2z" />
        <path d="m117 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m98.6 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m135.4 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m153.8 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m80.6 61.7c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <ellipse cx="98.9" cy="63.9" rx="2.1" ry="2.2" />
        <path d="m117.3 61.7c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <ellipse cx="62.2" cy="63.9" rx="2.1" ry="2.2" />
        <ellipse cx="154.1" cy="63.9" rx="2.1" ry="2.2" />
        <path d="m135.7 61.7c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m154.4 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m80.9 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <path d="m44.1 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <path d="m99.2 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2z" />
        <ellipse cx="117.6" cy="46.3" rx="2.1" ry="2.2" />
        <path d="m136 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m62.5 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <path d="m154.7 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <path d="m62.8 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <ellipse cx="136.3" cy="28.6" rx="2.1" ry="2.2" />
        <path d="m99.6 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <path d="m117.9 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2z" />
        <path d="m81.2 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
        <path d="m26 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
        <ellipse cx="44.4" cy="28.6" rx="2.1" ry="2.2" />
        <path d="m136.6 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2 0.1 1.2-0.9 2.2-2.1 2.2z" />
        <path d="m155 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2 0.1 1.2-0.9 2.2-2.1 2.2z" />
        <path d="m26.3 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-0.9 2.2-2.1 2.2z" />
        <path d="m81.5 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-0.9 2.2-2.1 2.2z" />
        <path d="m63.1 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-0.9 2.2-2.1 2.2z" />
        <path d="m44.7 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-0.9 2.2-2.1 2.2z" />
        <path d="m118.2 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2 0.1 1.2-0.9 2.2-2.1 2.2z" />
        <path d="m7.9 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2 0.1 1.2-0.9 2.2-2.1 2.2z" />
        <path d="m99.9 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2z" />
      </svg>
    </figure>
    <figure className="position-absolute bottom-0 start-0 d-none d-lg-block">
      <svg width="822.2px" height="301.9px" viewBox="0 0 822.2 110">
        <path className="fill-warning" d="M752.5,51.9c-4.5,3.9-8.9,7.8-13.4,11.8c-51.5,45.3-104.8,92.2-171.7,101.4c-39.9,5.5-80.2-3.4-119.2-12.1 c-32.3-7.2-65.6-14.6-98.9-13.9c-66.5,1.3-128.9,35.2-175.7,64.6c-11.9,7.5-23.9,15.3-35.5,22.8c-40.5,26.4-82.5,53.8-128.4,70.7 c-2.1,0.8-4.2,1.5-6.2,2.2L0,301.9c3.3-1.1,6.7-2.3,10.2-3.5c46.1-17,88.1-44.4,128.7-70.9c11.6-7.6,23.6-15.4,35.4-22.8 c46.7-29.3,108.9-63.1,175.1-64.4c33.1-0.6,66.4,6.8,98.6,13.9c39.1,8.7,79.6,17.7,119.7,12.1C634.8,157,688.3,110,740,64.6 c4.5-3.9,9-7.9,13.4-11.8C773.8,35,797,16.4,822.2,1l-0.7-1C796.2,15.4,773,34,752.5,51.9z" />
      </svg>
    </figure>

    <Container className="position-relative py-5">
      <Row className="g-5 align-items-center justify-content-between">

        <Col lg={6} md={12}>
          <h1 className="display-7 fw-bold mb-4">Apply as Instructor</h1>
          <p className="lead text-secondary mb-4">
            Unlock the potential of learners around the globe by sharing your expertise.
            Whether you're an industry pro or a passionate enthusiast, you have the power to inspire.
          </p>
          <p>
            Connect with millions of students, make a real difference in their careers, and turn your knowledge into a rewarding journey doing what you love.
          </p>
          <div className="alert alert-warning d-flex align-items-center mt-2 w-100">
            <div>
              <strong>Warning:</strong><br />
              After your instructor status is approved, you will lose access to your existing student data.
            </div>
          </div>
          {!isLoadingCheck && isRegistered && !isInstructor && (
            <div className="alert alert-success d-flex align-items-center mt-2 w-100">
              <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              <div>
                <strong>Application Submitted!</strong><br />
                Your instructor profile is waiting for approval.
                If the review takes too long, please contact the admin via email: lduongwinf@gmail.com
              </div>
            </div>
          )}
          {isInstructor && (
            <div className="alert alert-success d-flex align-items-center mt-2 w-100">
              <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              <div>
                <strong>Application Approved!</strong><br />
                Your are already an instructor!
                Happy teaching!
              </div>
            </div>
          )}
        </Col>

        <Col lg={5} md={12}>
          <Card className="card-body shadow-lg border-0 p-md-4">
            <h3 className="fw-bold text-center">
              {isLoadingCheck ? "Checking Status..." :
                isRegistered ? "Application Status" : "Confirm this form"}
            </h3>

            <form className="row g-3 mt-1 position-relative z-index-9" onSubmit={handleSubmit(onSubmit)}>
              <TextFormInput
                name="name" containerClassName="col-md-6" label="Name *" control={control}
                disabled={isRegistered || isLoadingCheck}
              />
              <TextFormInput
                name="email" containerClassName="col-md-6" label="Email *" control={control}
                disabled={isRegistered || isLoadingCheck}
              />
              <TextAreaFormInput
                name="description" containerClassName="col-12" label="Add Summary *" control={control}
                disabled={isRegistered || isLoadingCheck}
              />

              <Col xs={12} className="mt-4">
                <button
                  type="submit"
                  className={`btn w-100 py-2 fw-bold shadow-sm ${isRegistered ? 'btn-success' : 'btn-primary'}`}
                  disabled={isRegistered || isLoadingCheck}
                >
                  {isLoadingCheck ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Checking...
                    </>
                  ) : isRegistered ? (
                    <>✓ Application Submitted</>
                  ) : (
                    "Submit form"
                  )}
                </button>
              </Col>
            </form>
          </Card>
        </Col>

      </Row>
    </Container>
  </section>;
};
export default Banner;
