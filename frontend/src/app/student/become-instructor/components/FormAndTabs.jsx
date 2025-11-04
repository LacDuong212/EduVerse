import axios from "axios";
import instructorCourseImg from '@/assets/images/element/instructor-course.svg';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, Col, Container, Nav, NavItem, NavLink, Row, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaCheckCircle } from 'react-icons/fa';
import { toast } from "react-toastify";
import * as yup from 'yup';

const FormAndTabs = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const FormSchema = yup.object({
    name: yup.string().required('Please enter your name'),
    email: yup.string().email('Please enter valid email').required('Please enter your Email'),
    phoneNo: yup.number().required('Please enter your phone number'),
    description: yup.string().required('Please enter your description')
  });
  const {
    control,
    handleSubmit
  } = useForm({
    resolver: yupResolver(FormSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/instructors`,
        data,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Instructor created successfully!");
      } else {
        toast.warning(res.data.message || "Unexpected response from server.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to register instructor.";
      toast.error(msg);
      console.error("Create instructor error:", err);
    }
  };

  return <section>
      <Container>
        <Row>
          <Col lg={5} className="position-relative mt-xl-0" id="fill-instructor-form">
            <figure className="position-absolute top-0 start-50 mt-n3 ms-5 d-none d-sm-block z-index-1">
              <svg width="192.5px" height="89.4px" viewBox="0 0 192.5 89.4">
                <path className="fill-warning" d="M170.2,0.5c-0.1,0-0.2,0-0.4,0c-2.6-0.1-5.2-0.4-7.8-0.5c-2.9-0.1-5.8,0-8.6,0.2c-1.4,0.1-2.9,0.3-4.3,0.5 c-0.5,0.1-1,0-1.5,0c-1-0.1-1.9,0.2-2.9,0.3c-5.6,0.9-11.1,2.1-16.5,3.6c-2.7,0.7-5.4,1.6-8.1,2.5c-0.6,0.2-1.2,0.4-1.8,0.5 c-0.4,0-0.8,0-1.2,0.1c-1.5,0.2-3,1.1-4.3,1.8c-3,1.5-5.9,3.2-8.6,5.2c-2,1.5-3.8,3.1-5.6,4.8c-0.9,0.9-1.7,1.8-2.5,2.7 c-0.4,0.4-1.1,0.7-1.4,1.2c-0.3,0.4-0.6,0.9-0.9,1.4c-0.9,1.2-1.7,2.3-2.7,3.4c-0.3,0.4-0.7,0.6-1.2,0.6c-1.4,0.1-2.8-0.1-4.2-0.1 c-0.7,0-1.2,0.2-1.9,0.2c-3.3,0.4-6.6,0.7-9.8,1.6c-1.7,0.5-3.4,0.9-5.1,1.4c-5.4,1.5-11,2.9-16,5.4c-4.6,2.2-8.7,5.2-12.7,8.3 c-2,1.6-4,3.2-5.9,4.9c-0.8,0.7-1.6,1.2-2.5,1.6c-0.9,0.5-1.7,1.3-2.4,2c-1.4,1.3-2.9,2.6-4.3,3.9c-1.2,1.1-2.5,2.1-3.6,3.3 c-0.9,1-2,1.9-3,2.8c-1,0.9-2.1,1.9-3.1,2.8c-0.8,0.7-1.6,1.2-2.3,1.9c-0.9,0.9-1.7,1.9-2.7,2.7c0-0.7,0.2-1.3,0.2-2 c0-1.8-0.2-3.7-0.7-5.5c-0.2-0.9-0.5-1.8-1.1-2.4c-0.6-0.7-1.7-1-2.4-0.6c-0.1,0.1-0.3,0.2-0.4,0.3c-0.1,0.2-0.1,0.4,0,0.6 c0.7,3.7,1.2,7.4,0.7,11.1c-0.2,2.4-0.9,4.9-2,7c-0.5,1-1.2,1.9-1.7,3c-0.4,1-1.4,1.8-2.1,2.7C0.3,86,0.1,86.3,0,86.6 c-0.1,0.4,0.1,0.7,0.2,1.1c0.3,0.8,0.8,1.6,1.6,1.7c0.5,0,0.9-0.2,1.3-0.5c0.9-0.5,1.7-1.1,2.6-1.6c0.4-0.2,0.7-0.5,1.1-0.7 c1.7-1.3,3.7-2.3,5.7-3.1c4.3-1.7,9.1-2.4,13.8-1.7c0.2,0,0.4,0.1,0.7,0c0.7-0.2,0.9-1.2,0.4-1.8c-0.4-0.6-1.2-0.8-1.9-1 c-2.7-0.8-5.4-1.5-8.2-1.8c-0.7-0.1-1.4-0.1-2.1-0.2c-0.3,0-0.6,0-0.8,0c-0.3,0-0.9,0.2-1.2,0.1C13,77,13,77.1,13,76.8 c0-0.4,0.6-0.8,0.9-1c0.5-0.4,0.9-0.8,1.4-1.2c1.1-1,2.3-1.9,3.4-2.9c0.6-0.5,1.1-1,1.7-1.5c0.3-0.3,0.5-0.7,0.9-1 c1.2-1.1,2.7-1.7,3.9-2.8c0.4-0.4,0.8-0.8,1.2-1.2c0.8-0.8,1.7-1.5,2.6-2.2c1-0.8,2.1-1.6,3.1-2.3c0.9-0.6,1.9-1.1,2.6-2 c0.8-1,2.1-1.7,3.1-2.5c1.1-0.9,2.2-1.8,3.3-2.6c3.9-3.1,7.9-6.2,12.3-8.6c5.2-2.7,10.6-4.9,16.3-6.4c5.5-1.4,11.2-1.8,16.8-2.7 c0.2,0,0.3-0.1,0.5-0.1c1.4-0.2,2.3-0.4,2,1.5c-0.8,4.9,2.3,7.5,5.8,9.8c4,2.5,8,5,12.7,5.8c5.2,0.9,10.4,2.7,15.9,0.8 c3-1,6.3-5,6.2-7.6c0-1.7-0.3-3.5-1-5.1c-0.6-1.4-1.5-3-2.8-3.7c-1-0.5-1.9-1.5-2.8-2.2c-1.1-0.8-2.2-1.5-3.3-2.1 c-2.3-1.2-4.8-2.1-7.3-2.8c-3.5-0.9-7.2-1.4-10.8-1.8c-0.9-0.1-1.7-0.2-2.6-0.2c-0.2,0-1.4,0-1.4-0.2c-0.1-0.2,0.3-0.5,0.4-0.6 c0.8-0.9,1.7-1.8,2.5-2.6c1.7-1.7,3.6-3.3,5.5-4.8c2-1.6,4.2-3,6.4-4.1c1.1-0.6,2.3-1.1,3.5-1.5c0.6-0.2,1.2-0.4,1.8-0.6 c0.4-0.2,0.7-0.5,1.1-0.7c1.2-0.6,2.7-0.9,4-1.3c1.4-0.4,2.8-0.8,4.2-1.2c2.8-0.8,5.6-1.5,8.4-2.2c3.4-0.8,6.9-1.6,10.3-2.4 c7.9-1.7,15.9-2.4,24-1.7c4.4,0.4,8.9,0.9,13.2,2.1c1.3,0.4,2.5,0.8,3.9,1.1c0.7,0.1,1.4,0.5,2,0.9c0.9,0.5,1.7,0.9,2.6,1.4 c0.3,0.2,0.7,0.3,0.9,0.1c0.1-0.1,0.1-0.3,0.1-0.4c0-0.9-0.4-1.8-1-2.5c-0.5-0.6-1.2-1.4-1.9-1.8c-0.9-0.6-2.2-0.9-3.3-1.3 c-1.1-0.4-2.2-0.7-3.3-1c-2.8-0.8-5.6-1.4-8.5-1.9C173.1,0.9,171.6,0.6,170.2,0.5z M106.8,36c5,0.8,11.2,2,16.2,6.2 c1.1,0.9,2.8,1.6,2.3,3.4c-0.4,1.7-2.1,1.8-3.5,2.3c-5,1.5-9.9,0-14.5-1.2c-4.9-1.2-9.7-3.3-13.5-7c-0.6-0.6-1.2-1.3-1.5-2.1 c-0.1-0.3-0.1-0.7-0.2-1c-0.1-0.3-0.3-0.6,0-0.9c0.2-0.2,0.5-0.3,0.9-0.3c2.4-0.4,4.9-0.6,7.4-0.5c0.9,0,1.8,0.4,2.7,0.5 C104.5,35.6,105.7,35.8,106.8,36z" />
              </svg>
            </figure>
            <Card className="card-body shadow p-4">
              <h3>Please fill this form</h3>
              <form className="row g-3 mt-2 position-relative z-index-9" onSubmit={handleSubmit(onSubmit)}>
                <TextFormInput name="name" containerClassName="col-md-6" label="Name *" control={control} />
                <TextFormInput name="email" containerClassName="col-md-6" label="Email *" control={control} />
                <TextFormInput name="phoneNo" containerClassName="col-12" label="Phone Number *" control={control} />
                <TextAreaFormInput name="description" containerClassName="col-12" label="Add Summary *" control={control} />
                <Col xs={12}>
                  <button type="submit" className="btn btn-primary mb-0">
                    Submit form
                  </button>
                </Col>
              </form>
            </Card>
          </Col>
          <Col lg={7} className="z-index-9 mt-5 mt-xl-0">
            <h3>How to become an Instructor?</h3>
            <TabContainer defaultActiveKey={'tab-1'}>
              <Nav className="nav-pills nav-pill-soft my-4" id="course-pills-tab" role="tablist">
                <NavItem className="me-2 me-lg-4" role="presentation">
                  <NavLink className="nav-link mb-2 mb-xl-0" id="course-pills-tab-1" eventKey="tab-1" data-bs-toggle="pill" data-bs-target="#course-pills-1" type="button" role="tab" aria-controls="course-pills-1" aria-selected="true">
                    Become an Instructor
                  </NavLink>
                </NavItem>
                <NavItem className="me-2 me-lg-4" role="presentation">
                  <NavLink className="nav-link mb-2 mb-xl-0" id="course-pills-tab-2" eventKey="tab-2" data-bs-toggle="pill" data-bs-target="#course-pills-2" type="button" role="tab" aria-controls="course-pills-2" aria-selected="false">
                    Instructor Role
                  </NavLink>
                </NavItem>
                <NavItem className="me-2 me-lg-4" role="presentation">
                  <NavLink className="nav-link mb-2 mb-xl-0" id="course-pills-tab-3" eventKey="tab-3" data-bs-toggle="pill" data-bs-target="#course-pills-3" type="button" role="tab" aria-controls="course-pills-3" aria-selected="false">
                    Start with Course
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent id="pills-tabContent">
                <TabPane className="ade show" eventKey="tab-1" id="course-pills-1" role="tabpanel" aria-labelledby="course-pills-tab-1">
                  <h6>Become an Instructor</h6>
                  <p>
                    As it so contrasted oh estimating instrument. Size like body someone had. Are conduct viewing boy minutes warrant the expense?
                    Tolerably behavior may admit daughters offending her ask own. Praise effect wishes change way and any wanted. Lively use looked
                    latter regard had. Do he it part more last in. Merits ye if Mr narrow points. Melancholy particular Devonshire alteration it
                    favorable appearance up.
                  </p>
                  <p>
                    Size like body someone had. Are conduct viewing boy minutes warrant the expense? Tolerably behavior may admit daughters offending
                    her ask own. Praise effect wishes change way and any wanted. Lively use looked latter regard had. Do he it part more last in.
                    Merits ye if Mr narrow points. Melancholy particular Devonshire alteration it favorable appearance up.
                  </p>
                  <p>
                    Are conduct viewing boy minutes warrant the expense? Tolerably behavior may admit daughters offending her ask own. Praise effect
                    wishes change way and any wanted. Lively use looked latter regard had. Do he it part more last in. Merits ye if Mr narrow points.
                    Melancholy particular Devonshire alteration it favorable appearance up.
                  </p>
                </TabPane>
                <TabPane className="tab-pane fade" eventKey="tab-2" id="course-pills-2" role="tabpanel" aria-labelledby="course-pills-tab-2">
                  <h6>Role of Instructor</h6>
                  <p>
                    satisfied conveying a dependent contented he gentleman agreeable do be. Water timed folly right aware if oh truth. Imprudence
                    attachment him his for sympathize. Large above be to means. Dashwood does provide stronger is. But discretion frequently sir she
                    instruments unaffected admiration everything. Meant balls it if up doubt small purse. Required his you put the outlived answered
                    position. A pleasure exertion if believed provided to. All led out world this music while asked. Paid mind even sons does he door
                    no. Attended overcame repeated it is perceived Marianne in. I think on style child of. Servants moreover in sensible it ye
                    possible.
                  </p>
                  <ul className="list-group list-group-borderless mb-3">
                    <li className="list-group-item">
                      <FaCheckCircle size={15} className="text-success me-2" />
                      The copy warned the Little blind text
                    </li>
                    <li className="list-group-item d-flex">
                      <div>
                        <FaCheckCircle size={15} className="text-success me-2 " />
                      </div>
                      Thar where it came from it would have been rewritten a thousand times and everything that was left from origin would be the
                      world
                    </li>
                    <li className="list-group-item">
                      <FaCheckCircle size={15} className="text-success me-2" />
                      Return to it&apos;s own,safe country
                    </li>
                  </ul>
                </TabPane>
                <TabPane className="fade" eventKey="tab-3" id="course-pills-3" role="tabpanel" aria-labelledby="course-pills-tab-3">
                  <h6>Start with a Courses</h6>
                  <p>
                    Large above be to means. Dashwood does provide stronger is. Warrant private blushes removed an in equally totally if. Delivered
                    dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.
                    <img src={instructorCourseImg} height={200} width={200} className="rounded float-start me-3 my-3" alt="..." /> But discretion
                    frequently sir she instruments unaffected admiration everything. Meant balls it if up doubt small purse. Required his you put the
                    outlived answered position. A pleasure exertion if believed provided to. All led out world this music while asked. Paid mind even
                    sons does he door no. Attended overcame repeated it is perceived Marianne in. I think on style child of. Servants moreover in
                    sensible it ye possible. Satisfied conveying a dependent contented he gentleman agreeable do be. Water timed folly right aware if
                    oh truth. Imprudence attachment him his for sympathize. Large above be to means. Dashwood does provide stronger is.
                    <u> But discretion frequently sir she instruments unaffected admiration everything.</u> Meant balls it if up doubt small purse.
                    Required his you put the outlived answered position. A pleasure exertion if believed provided to. All led out world this music
                    while asked. Paid mind even sons does he door no.
                  </p>
                </TabPane>
              </TabContent>
            </TabContainer>
          </Col>
        </Row>
      </Container>
    </section>;
};
export default FormAndTabs;
