import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextAreaFormInput from "@/components/form/TextAreaFormInput";
import TextFormInput from "@/components/form/TextFormInput";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

const Banner = () => {
  const { userData } = useSelector((state) => state.auth);

  const [isInstructor, setIsInstructor] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  const FormSchema = z.object({
    name: z.string().trim().min(1, "Please enter your name"),
    email: z.string().trim().min(1, "Please enter your Email").email("Please enter valid email"),
    description: z.string().trim().min(1, "Please enter your description"),
  });

  const {
    control,
    handleSubmit,
    setValue,
  } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      description: ""
    }
  });

  useEffect(() => {
    if (userData) {
      setValue("name", userData.name ?? "");
      setValue("email", userData.email ?? "");
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
    const res = await handleRequest(authApi.get("/instructors/me"));

    if (res.success && res.result?.insId) {
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
    }

    setIsLoadingCheck(false);
  };

  const onSubmit = async (data) => {
    const res = await handleRequest(authApi.post("/instructors", data));

    if (res.success) {
      toast.success(res.message);
      setIsRegistered(true);
    } else {
      toast.error(res.message || "Something went wrong, please try again later!");
    }
  };

  return (
    <section className="bg-light py-5 position-relative overflow-hidden">
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
            <p className="lead">
              Unlock the potential of learners around the globe by sharing your expertise.
              Whether you're an industry pro or a passionate enthusiast, you have the power to inspire.
            </p>
            <p className="lead">
              Connect with millions of students, make a real difference in their careers, and turn your knowledge into a rewarding journey doing what you love.
            </p>
            <div className="alert alert-warning d-flex align-items-center mt-2 w-100">
              <div>
                <strong>Warning!</strong><br />
                After your instructor status is approved, you will lose access to your existing student data.
              </div>
            </div>
            {!isLoadingCheck && isRegistered && !isInstructor && (
              <div className="alert alert-info d-flex align-items-center mt-2 w-100">
                <div>
                  <strong>Application Pending!</strong><br />
                  Your instructor profile is waiting for approval.
                  If the review takes too long, please contact via email &lt;lduongwinf@gmail.com&gt; for support!
                </div>
              </div>
            )}
            {isInstructor && (
              <div className="alert alert-success d-flex align-items-center mt-2 w-100">
                <div>
                  <strong>Application Approved!</strong><br />
                  Your are already an instructor!
                  Happy teaching!
                </div>
              </div>
            )}
          </Col>
          <Col lg={5} md={12}>
            <Card className="card-body shadow-lg border-0 p-4 p-md-5">
              <h3 className="fw-bold text-center">
                {isLoadingCheck ? "Checking Status..." : isRegistered ? "Application Status" : "Confirm this form"}
              </h3>
              <form className="row g-3 mt-1 position-relative z-index-9" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextFormInput
                      {...field}
                      containerClassName="col-md-6"
                      label="Name"
                      required
                      disabled={isRegistered || isLoadingCheck}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextFormInput
                      {...field}
                      containerClassName="col-md-6"
                      label="Email"
                      required
                      disabled={isRegistered || isLoadingCheck}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextAreaFormInput
                      {...field}
                      containerClassName="col-12"
                      label="Add Summary"
                      required
                      disabled={isRegistered || isLoadingCheck}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Col xs={12} className="mt-4">
                  <button
                    type="submit"
                    className={`btn w-100 mb-0 py-2 fw-bold shadow-sm ${isRegistered ? "btn-success" : "btn-primary"}`}
                    disabled={isRegistered || isLoadingCheck}
                  >
                    {isLoadingCheck ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Checking...
                      </>
                    ) : isRegistered ? (
                      <>
                        <FaCheck className="me-2 mb-1" />
                        Application Submitted
                      </>
                    ) : (
                      "Submit Form"
                    )}
                  </button>
                </Col>
              </form>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Banner;