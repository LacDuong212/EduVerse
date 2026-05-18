import { useState } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, Modal, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight, FaBan, FaCheck, FaPlay, FaSearch, FaTimes, FaTrash, FaTrashRestore } from "react-icons/fa";
import { MdOutlinePending } from "react-icons/md";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  approveCourse, deleteCourse, restoreCourse, unblockCourse, updateCourseStatus
} from "@/helpers/data";
import { DEFAULT_AVATAR_IMG, DEFAULT_COURSE_IMG } from "../../../context/constants";
import { formatCurrency } from "../../../utils/currency";

const STATUSES = Object.freeze({
  blocked: "blocked",
  live: "live",
  pending: "pending",
  rejected: "rejected",
});

const ACTIONS = Object.freeze({
  approve: "approve",
  block: "block",
  delete: 'delete',
  pending: "pending",
  reject: "reject",
  restore: "restore",
  unblock: "unblock",
});

const HIGHLIGHT_THICKNESS = 4;

const CourseActionModal = ({ show, actionType, handleClose, handleConfirm }) => {
  let theme = null;
  let title = null;
  let help = null;

  switch (actionType) {
    case ACTIONS.pending:
      theme = 'warning';
      title = "Mark course as Pending?";
      help = '';
      break;
    case ACTIONS.approve:
      theme = 'success';
      title = 'Approve this course?';
      help = '';
      break;
    case ACTIONS.reject:
      theme = 'orange';
      title = 'Reject this course?';
      help = '';
      break;
    case ACTIONS.block:
      theme = 'purple';
      title = 'Block this course?';
      help = '';
      break;
    case ACTIONS.unblock:
      theme = 'info';
      title = 'Unblock this course?';
      help = '';
      break;
    case ACTIONS.delete:
      theme = 'danger';
      title = 'Delete this course?';
      help = '';
      break;
    case ACTIONS.restore:
      theme = 'primary';
      title = 'Restore this course?';
      help = '';
      break;
    default:
      theme = 'secondary';
      title = 'Comfirm this action?';
      help = '';
  }

  const [message, setMessage] = useState('');

  const onConfirm = () => {
    if (typeof handleConfirm === 'function') handleConfirm(message);
    else toast.error('Action undefined.');
    setMessage('');
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="md"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className={`border-0 bg-${theme}`}>
        <Modal.Title className={`h5 ${actionType === ACTIONS.pending ? '' : 'text-white'}`}>
          {title || "Confirm Action"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="modalTextArea">
          <Form.Label className="fw-bold">Message (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Reason for this action..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline-secondary" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant={theme} size="sm" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const CourseCard = ({ course, index, onUpdate, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState({ type: null, onConfirm: null });

  const {
    _id,
    title,
    image,
    instructor,
    updatedAt,
    status,
    price, enableDiscount, discountPrice,
    isPrivate, isDeleted,
    requestUpdate,
  } = course || {};

  const {
    _id: insId,
    name: insName,
    pfpImg: insAvatar,
  } = instructor || {};

  const statusBadge = (stts) => {
    const s = stts?.toLowerCase();
    if (s === "live") return "success";
    if (s === "pending") return "warning";
    if (s === "draft") return "info";
    if (s === "rejected") return "orange";
    if (s === "blocked") return "purple";
    return "secondary";
  };

  const levelBadge = (lvl) => {
    const l = lvl?.toLowerCase();
    if (l === "all") return "info";
    if (l === "beginner") return "success";
    if (l === "intermediate") return "warning";
    if (l === "advanced") return "orange";
    return "secondary";
  };

  const approvable = status === STATUSES.rejected;
  const blockable = status !== STATUSES.blocked;
  const deletable = isDeleted === false;
  const pending = status === STATUSES.pending || requestUpdate;
  const unblockable = status === STATUSES.blocked;

  const openActionModal = (actionType, execAction = () => { }) => {
    setAction({ type: actionType, onConfirm: execAction });
    setShowModal(true);
  };

  const onApprove = () => openActionModal(
    ACTIONS.approve,
    async (msg) => {
      const { success } = await approveCourse(_id, msg) || {};
      if (success) onRefresh();
    }
  );
  const onBlock = () => openActionModal(
    ACTIONS.block,
    async (msg) => {
      const { success } = await updateCourseStatus(_id, STATUSES.blocked, msg) || {};
      if (success) onUpdate(_id || index, "status", STATUSES.blocked);
    }
  );
  const onDelete = () => openActionModal(
    ACTIONS.delete,
    async (msg) => {
      const { success } = await deleteCourse(_id, msg) || {};
      if (success) onUpdate(_id || index, "isDeleted", true);
    }
  );
  const onPending = async () => openActionModal(
    ACTIONS.pending,
    async (msg) => {
      const { success } = await updateCourseStatus(_id, STATUSES.pending, msg) || {};
      if (success) onUpdate(_id || index, "status", STATUSES.pending);
    }
  );
  const onReject = () => openActionModal(
    ACTIONS.reject,
    async (msg) => {
      const { success } = await updateCourseStatus(_id, STATUSES.rejected, msg) || {};
      if (success) onUpdate(_id || index, "status", STATUSES.rejected);
    }
  );
  const onRestore = async () => openActionModal(
    ACTIONS.restore,
    async (msg) => {
      const { success } = await restoreCourse(_id, msg) || {};
      if (success) onUpdate(_id || index, "isDeleted", false);
    }
  );
  const onUnblock = () => openActionModal(
    ACTIONS.unblock,
    async (msg) => {
      const { success, result } = await unblockCourse(_id, msg) || {};
      console.log(result);
      if (success) onUpdate(_id || index, "status", result?.status);
    }
  );

  return (
    <>
      <tr className="position-relative">
        <td className={pending ? `border-0 border-start border-warning border-${HIGHLIGHT_THICKNESS} p-0` : "p-0"}>
          {pending && (
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Need Approval</Tooltip>}
            >
              <div
                className="position-absolute start-0 top-0 w-100 h-100"
                style={{ zIndex: 0 }}
              />
            </OverlayTrigger>
          )}
        </td>

        <td>
          <div className="d-flex align-items-center" style={{ minWidth: 240, maxWidth: 360 }}>
            <div className="flex-shrink-0 rounded border border-2 border-light overflow-hidden" style={{ width: "80px", height: "80px" }}>
              <img
                src={image || DEFAULT_COURSE_IMG}
                alt="Course Image"
                className="img-fluid h-100 w-100 object-fit-cover"
                onError={(e) => e.target.src = DEFAULT_COURSE_IMG}
              />
            </div>
            <div className="ms-2 flex-grow-1 text-wrap">
              <h6 className="mb-0">
                <Link
                  to={`/courses/${_id || ""}`}
                  className={`position-relative d-inline-block ${isDeleted ? "text-danger text-decoration-line-through" : ''}`}
                  style={{ zIndex: 2 }}
                >
                  {title || "(No title)"}
                </Link>
              </h6>
              <div className="small row">
                <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                </div>
                <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                </div>
              </div>
            </div>
          </div>
        </td>

        <td className="text-center">
          <div className="d-flex flex-column justify-content-center align-items-center">
            <div className="avatar avatar-xs flex-shrink-0">
              {insAvatar ? (
                <img
                  src={insAvatar}
                  className="rounded-circle border-white border-2 shadow"
                  alt="avatar"
                  onError={(e) => e.target.src = DEFAULT_AVATAR_IMG}
                />
              ) : (
                <div className="avatar-img rounded-circle border-white border-2 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-5">
                  {(insName?.[0] || "I").toUpperCase()}
                </div>
              )}
            </div>
            <div className="mt-2">
              <h6 className="mb-0 fw-light">{insName || "(Nameless Instructor)"}</h6>
            </div>
          </div>
        </td>

        <td className="text-center">
          {updatedAt
            ? new Date(updatedAt).toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit"
            })
            : "N/A"}
        </td>

        <td className="text-center">
          <span className={`badge text-${statusBadge(status)} bg-${statusBadge(status)} bg-opacity-15`}>
            {status?.toUpperCase()}
          </span>
        </td>

        <td className={isDeleted ? "text-decoration-line-through" : ""}>
          {!Number.isFinite(price) ? (
            <div className="text-center">
              -
            </div>
          ) : enableDiscount ? (
            <div className="text-end">
              <div className="text-decoration-line-through small">
                {formatCurrency(price)}
              </div>
              <div>
                {formatCurrency(discountPrice)}
              </div>
            </div>
          ) : (
            <div className="text-end">
              {formatCurrency(price)}
            </div>
          )}
        </td>

        <td className="text-center small fw-bold">
          <span className={`${isDeleted ? "text-danger" : isPrivate ? "" : "text-info"}`}>
            {(isDeleted ? "deleted" : isPrivate ? "private" : "public").toUpperCase()}
          </span>
        </td>

        <td className="text-center">
          {deletable ? (
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
              {approvable && <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Pending</Tooltip>}
              >
                <Button
                  variant="warning-soft"
                  size="sm"
                  className="btn-round mb-0"
                  onClick={() => onPending()}
                >
                  <MdOutlinePending size={18} />
                </Button>
              </OverlayTrigger>}
              {pending && <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Approve</Tooltip>}
              >
                <Button
                  variant="success-soft"
                  size="sm"
                  className="btn-round mb-0"
                  onClick={() => onApprove()}
                >
                  <FaCheck size={14} />
                </Button>
              </OverlayTrigger>}
              {pending && <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Reject</Tooltip>}
              >
                <Button
                  variant="orange-soft"
                  size="sm"
                  className="btn-round mb-0"
                  onClick={() => onReject()}
                >
                  <FaTimes size={16} />
                </Button>
              </OverlayTrigger>}
              {blockable && <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Block</Tooltip>}
              >
                <Button
                  variant="purple-soft"
                  size="sm"
                  className="btn-round mb-0"
                  onClick={() => onBlock()}
                >
                  <FaBan size={16} />
                </Button>
              </OverlayTrigger>}
              {unblockable && <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Unblock</Tooltip>}
              >
                <Button
                  variant="info-soft"
                  size="sm"
                  className="btn-round mb-0"
                  onClick={() => onUnblock()}
                >
                  <FaPlay />
                </Button>
              </OverlayTrigger>}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Delete</Tooltip>}
              >
                <Button
                  variant="danger-soft"
                  size="sm"
                  className="btn-round mb-0"
                  onClick={() => onDelete()}
                >
                  <FaTrash />
                </Button>
              </OverlayTrigger>
            </div>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Restore</Tooltip>}
            >
              <Button
                variant="primary-soft"
                size="sm"
                className="btn-round mb-0"
                onClick={() => onRestore()}
              >
                <FaTrashRestore />
              </Button>
            </OverlayTrigger>
          )}
        </td>

        <CourseActionModal
          show={showModal}
          actionType={action.type}
          handleClose={() => setShowModal(false)}
          handleConfirm={action.onConfirm}
        />
      </tr>
    </>
  );
};

const CoursesList = ({
  courses,
  setCourses,
  meta,
  loading,
  search,
  setSearch,
  setPage,
  refreshCourses
}) => {
  const start = (meta?.currentPage - 1) * 8 + 1;
  const end = Math.min(meta?.currentPage * 8, meta?.totalCourses);

  const getPageNumbers = () => {
    const pages = [];
    const totalPages = meta?.totalPages || 1;
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleUpdateCourse = (id, fieldName, fieldValue) => {
    setCourses(prev =>
      prev.map((course, i) =>
        (id === course?._id || id === i) ? { ...course, [fieldName]: fieldValue } : course
      )
    );
  };

  return (
    <Card className="bg-transparent border">
      <CardHeader className="bg-light border-bottom">
        <Row className="g-3 align-items-center justify-content-between">
          <Col md={12}>
            <form className="rounded position-relative" onSubmit={(e) => e.preventDefault()}>
              <input
                className="form-control bg-body"
                type="text"
                placeholder="Search courses..."
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="bg-transparent p-2 me-1 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                type="submit"
              >
                <FaSearch />
              </button>
            </form>
          </Col>
        </Row>
      </CardHeader>

      <CardBody className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive border-0">
            <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
              <thead className={`border-0 border-start border-${HIGHLIGHT_THICKNESS} border-dark`}>
                <tr>
                  <th className="border-0 p-0"></th>
                  <th className="border-0 text-start">Course</th>
                  <th className="border-0 text-center">Instructor</th>
                  <th className="border-0 text-center">Last Update</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-center">Price</th>
                  <th className="border-0 text-center">State</th>
                  <th className="border-0 text-center rounded-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((item, idx) => (
                    <CourseCard
                      key={item._id || idx}
                      index={idx}
                      course={item}
                      onUpdate={handleUpdateCourse}
                      onRefresh={refreshCourses}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      No courses found matching "{search}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>

      <CardFooter className="bg-transparent">
        <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
          <p className="mb-0 text-center text-sm-start">
            Showing {meta?.totalCourses === 0 ? 0 : start} to {end} of {meta?.totalCourses} courses
          </p>

          <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
            <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
              <li className={`page-item mb-0 ${meta.currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(meta.currentPage - 1)}
                  disabled={meta.currentPage === 1}
                >
                  <FaAngleLeft />
                </button>
              </li>

              {getPageNumbers().map((pageNum) => (
                <li
                  key={pageNum}
                  className={`page-item mb-0 ${pageNum === meta.currentPage ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                </li>
              ))}

              <li className={`page-item mb-0 ${meta.currentPage >= meta.totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(meta.currentPage + 1)}
                  disabled={meta.currentPage >= meta.totalPages}
                >
                  <FaAngleRight />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CoursesList;