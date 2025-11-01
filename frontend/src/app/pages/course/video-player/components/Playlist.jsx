import TextFormInput from '@/components/form/TextFormInput';
import { getAllPlaylist } from '@/helpers/data';
import { useFetchData } from '@/hooks/useFetchData';
import useToggle from '@/hooks/useToggle';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, CardFooter, CardHeader, Col, Collapse, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BsLockFill, BsPencilSquare, BsPlayFill, BsTrashFill } from 'react-icons/bs';
import { FaPlay } from 'react-icons/fa';
import * as yup from 'yup';
const PlayNote = () => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  return <>
      <Button onClick={toggle} variant="warning" className="btn btn-xs" role="button" aria-expanded="false" aria-controls="addnote-1">
        View note
      </Button>
      <Collapse in={isOpen}>
        <div>
          <Card className="card-body p-0">
            <div className="d-flex justify-content-between bg-light rounded-2 p-2 mb-2">
              <div className="d-flex align-items-center">
                <span className="badge bg-dark me-2">5:20</span>
                <h6 className="d-inline-block text-truncate w-40px w-sm-150px mb-0 fw-light">Describe SEO Engine</h6>
              </div>
              <div className="d-flex">
                <Button variant="light" size="sm" className="btn-round me-2 mb-0">
                  <BsPlayFill className="fa-fw" />
                </Button>
                <Button variant="light" size="sm" className="btn-round mb-0">
                  <BsTrashFill className="fa-fw" />
                </Button>
              </div>
            </div>
            <div className="d-flex justify-content-between bg-light rounded-2 p-2 mb-2">
              <div className="d-flex align-items-center">
                <span className="badge bg-dark me-2">10:20</span>
                <h6 className="d-inline-block text-truncate w-40px w-sm-150px mb-0 fw-light">Know about all marketing</h6>
              </div>
              <div className="d-flex">
                <Button variant="light" size="sm" className="btn-round me-2 mb-0">
                  <BsPlayFill className="fa-fw" />
                </Button>
                <Button variant="light" size="sm" className="btn-round mb-0">
                  <BsTrashFill className="bi fa-fw bi-trash-fill" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Collapse>
    </>;
};
const Playlist = () => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  const allPlaylists = useFetchData(getAllPlaylist);
  const noteSchema = yup.object({
    note: yup.string().required('please enter your note')
  });
  const {
    control,
    handleSubmit
  } = useForm({
    resolver: yupResolver(noteSchema)
  });
  return <>
      <Card className="vh-100 overflow-auto rounded-0 w-280px w-sm-400px">
        <CardHeader className="bg-light rounded-0">
          <h1 className="mt-2 fs-5">The Complete Digital Marketing Course - 12 Courses in 1</h1>
          <h6 className="mb-0 fw-normal">
            <a href="#">By Jacqueline Miller</a>
          </h6>
        </CardHeader>
        <CardBody>
          <div className="d-sm-flex justify-content-sm-between">
            <h5>Course content</h5>
            <Button variant="warning" size="sm" type="button" onClick={toggle}>
              <BsPencilSquare className="fa-fw me-2" />
              Add note
            </Button>
          </div>
          <hr />
          <Row>
            <Col xs={12}>
              <Accordion defaultActiveKey="0" flush className="accordion-flush-light" id="accordionExample">
                {allPlaylists?.map((list, idx) => <AccordionItem eventKey={`${idx}`} key={idx}>
                    <AccordionHeader id="headingOne">
                      <span className="mb-0 fw-bold">{list.title}</span>
                    </AccordionHeader>
                    <AccordionBody className="px-3">
                      <div className="vstack gap-3">
                        {list.lectures.map((lecture, idx) => <Fragment key={idx}>
                            {lecture.isNote ? <div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <div className="position-relative d-flex align-items-center">
                                    <a href="#" className="btn btn-danger-soft btn-round btn-sm mb-0 stretched-link position-static">
                                      <FaPlay className="me-0" size={11} />
                                    </a>
                                    <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px">{lecture.title}</span>
                                  </div>
                                  <p className="mb-0 text-truncate">{lecture.time}</p>
                                </div>
                                <PlayNote />
                              </div> : <div className="d-flex justify-content-between align-items-center">
                                <div className="position-relative d-flex align-items-center">
                                  {lecture.isPremium ? <Button variant="light" size="sm" className="btn-round mb-0 stretched-link position-static">
                                      <BsLockFill size={11} />
                                    </Button> : <Button variant="danger-soft" size="sm" className="btn-round mb-0 stretched-link position-static">
                                      <FaPlay className="me-0" size={11} />
                                    </Button>}
                                  <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px">{lecture.title}</span>
                                </div>
                                <p className="mb-0 text-truncate">{lecture.time}</p>
                              </div>}
                          </Fragment>)}
                      </div>
                    </AccordionBody>
                  </AccordionItem>)}
              </Accordion>
            </Col>
          </Row>
        </CardBody>
        <CardFooter>
          <div className="d-grid">
            <Link to="/pages/course/detail" className="btn btn-primary-soft mb-0">
              Back to course
            </Link>
          </div>
        </CardFooter>
      </Card>

      <Modal show={isOpen} onHide={toggle} className="fade" id="Notemodal" tabIndex={-1} aria-labelledby="NotemodalLabel" aria-hidden="true">
        <form onSubmit={handleSubmit(() => {})}>
          <ModalHeader closeButton>
            <h5 className="modal-title" id="NotemodalLabel">
              Add New Note
            </h5>
          </ModalHeader>
          <ModalBody>
            <TextFormInput name="note" label="Type your note *" placeholder="Type your note" control={control} containerClassName="col-12" />
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={toggle}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Note
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>;
};
export default Playlist;
