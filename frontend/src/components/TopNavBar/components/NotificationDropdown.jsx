import { useEffect, useState } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, Card, CardHeader, CardBody, OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { BsBan, BsBell, BsCheckCircle, BsInfoCircle, BsExclamationCircle, BsQuestion } from "react-icons/bs";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useSocketContext } from "@/contexts/SocketContext";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";
import { FaCheckDouble } from "react-icons/fa6";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationItem = ({ noti }) => {
  const renderAvatar = () => {
    if (noti.sender?.avatar) {
      return <img className="avatar-img rounded-circle" src={noti.sender.avatar} alt="avatar" />;
    }

    let Icon = BsInfoCircle;
    let colorClass = "text-primary";
    let bgClass = "bg-primary bg-opacity-10";

    switch (noti?.type?.toUpperCase()) {
      case "APPROVED":
      case "SUCCEEDED":
        Icon = BsCheckCircle;
        colorClass = "text-success";
        bgClass = "bg-success bg-opacity-10";
        break;
      case "REJECTED":
      case "FAILED":
        Icon = BsExclamationCircle;
        colorClass = "text-danger";
        bgClass = "bg-danger bg-opacity-10";
        break;
      case "BLOCKED":
        Icon = BsBan;
        colorClass = "text-warning";
        bgClass = "bg-warning bg-opacity-10";
        break;
      default:
        Icon = BsQuestion;
        colorClass = "text-secondary";
        bgClass = "bg-secondary bg-opacity-10";
        break;
    }

    return (
      <div className={`avatar-img rounded-circle d-flex align-items-center justify-content-center ${bgClass}`}>
        <Icon className={colorClass} size={20} />
      </div>
    );
  };

  return (
    <li>
      <Link className={`list-group-item-action border-0 border-bottom d-flex p-3 ${!noti.isRead ? "bg-light" : ""}`}>
        <div className="me-3">
          <div className="avatar avatar-md">
            {renderAvatar()}
          </div>
        </div>
        <div>
          <h6 className="mb-1 text-capitalize">{noti.type || "New Notification"}</h6>
          <p className="text-body m-0">{noti.message}</p>
          <small className="text-secondary">{formatTimeAgo(noti.createdAt)}</small>
        </div>
        {!noti.isRead && (
          <span className="ms-auto p-1 bg-primary rounded-circle align-self-center" style={{ width: 8, height: 8 }}></span>
        )}
      </Link>
    </li>
  );
};

const NotificationDropdown = ({ className }) => {
  const { userData } = useSelector((state) => state.auth);
  const { socket } = useSocketContext();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userData?.userId) {
      const fetchNotifications = async () => {
        const res = await handleRequest(authApi.get("/notifications"));
        if (res?.success) {
          setNotifications(res?.result);
          setUnreadCount(res?.result.filter(n => !n.isRead).length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      };
      fetchNotifications();
    }
  }, [userData]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (data) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    socket.on("getNotification", handleNewNotification);
    return () => {
      socket.off("getNotification", handleNewNotification);
    };
  }, [socket]);

  const handleMarkAllRead = async (isOpen) => {
    if (isOpen && unreadCount > 0 && userData?.userId) {
      const res = await handleRequest(authApi.put("/notifications/read"))
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else toast.error(res.message || "Failed to mark notifications as read..");
    }
  };

  const handleClearAll = async (e) => {
    e.preventDefault();
    if (!userData?.userId) return;
    const res = await handleRequest(authApi.delete("/notifications"));
    if (res.success) {
      setNotifications([]);
      setUnreadCount(0);
    } else toast.error(res.message || "Failed to clear notifications..");
  };

  return (
    <Dropdown
      drop="start"
      className={className}
    // onToggle={handleMarkAllRead}
    >
      <OverlayTrigger placement="bottom" overlay={<Tooltip>Notifications</Tooltip>}>
        <DropdownToggle
          className="btn btn-light btn-round mb-0 arrow-none"
          role="button"
          style={{ overflow: "visible" }}
        >
          <BsBell className="bi bi-cart3 fa-fw fs-10" />
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-warning mt-xl-2 ms-n1" style={{ zIndex: 10, pointerEvents: "none" }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </DropdownToggle>
      </OverlayTrigger>

      <DropdownMenu className="dropdown-animation dropdown-menu-end dropdown-menu-size-md p-0 shadow-lg border-0 mt-2">
        <Card className="bg-transparent">
          <CardHeader className="bg-transparent border-bottom border-3 py-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 me-1">
                Notifications
              </h5>
              <OverlayTrigger placement="top" overlay={<Tooltip>Mark All Read</Tooltip>}>
                <Button
                  variant="link"
                  size="sm"
                  className="text-success p-0 mb-0 btn-round d-flex align-items-center justify-content-center"
                  onClick={handleMarkAllRead}
                >
                  <FaCheckDouble size={20} />
                </Button>
              </OverlayTrigger>
            </div>
            <Link className="small fw-bold" to="#" onClick={handleClearAll}>
              Clear All
            </Link>
          </CardHeader>

          <CardBody className="p-0">
            <ul className="list-group list-unstyled list-group-flush" style={{ maxHeight: "420px", overflowY: "auto" }}>
              {notifications.length > 0 ? (
                notifications.map((noti, idx) => (
                  <NotificationItem key={noti?.notifId || idx} noti={noti} />
                ))
              ) : (
                <li className="p-4 text-center">
                  <BsBell size={24} className="mb-2" />
                  <p className="small m-0">No notifications yet</p>
                </li>
              )}
            </ul>
          </CardBody>
        </Card>
      </DropdownMenu>
    </Dropdown>
  );
};

export default NotificationDropdown;