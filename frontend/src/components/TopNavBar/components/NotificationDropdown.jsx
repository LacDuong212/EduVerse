import { useEffect, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, Card, CardHeader, CardBody, CardFooter, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsBan, BsBell, BsCheckCircle, BsInfoCircle, BsExclamationCircle } from 'react-icons/bs';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useSocketContext } from '@/context/SocketContext';

// URL Backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// --- Helper: Format thời gian ---
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
  return date.toLocaleDateString();
};

// --- Component Item (Style giống NotificationCard) ---
const NotificationItem = ({ noti }) => {
  // Logic hiển thị Avatar: Ảnh (nếu có) hoặc Icon (nếu không)
  const renderAvatar = () => {
    // Nếu data có ảnh người gửi, ưu tiên hiển thị ảnh
    if (noti.sender?.avatar) {
      return <img className="avatar-img rounded-circle" src={noti.sender.avatar} alt="avatar" />;
    }

    // Nếu không, hiển thị Icon trạng thái
    let Icon = BsInfoCircle;
    let colorClass = "text-primary";
    let bgClass = "bg-primary bg-opacity-10";

    switch (noti.type) {
      case 'APPROVED':
      case 'SUCCEEDED':
        Icon = BsCheckCircle;
        colorClass = "text-success";
        bgClass = "bg-success bg-opacity-10";
        break;
      case 'REJECTED':
      case 'FAILED':
        Icon = BsExclamationCircle;
        colorClass = "text-danger";
        bgClass = "bg-danger bg-opacity-10";
        break;
      case 'BLOCKED':
        Icon = BsBan;
        colorClass = "text-warning";
        bgClass = "bg-warning bg-opacity-10";
        break;
      default:
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
      <Link
        className={`list-group-item-action border-0 border-bottom d-flex p-3 ${!noti.isRead ? 'bg-light' : ''}`}
      >
        <div className="me-3">
          <div className="avatar avatar-md">
            {renderAvatar()}
          </div>
        </div>
        <div>
          <h6 className="mb-1">{noti.type || "New Notification"}</h6>
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
    if (userData?._id) {
      const fetchNotifications = async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/notifications/${userData._id}`);
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
          console.error("Error loading notification:", err);
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

  // 3. Xử lý Mark Read
  const handleToggle = async (isOpen) => {
    if (isOpen && unreadCount > 0 && userData?._id) {
      try {
        setUnreadCount(0);
        await axios.put(`${BACKEND_URL}/api/notifications/mark-all-read/${userData._id}`);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  const handleClearAll = async (e) => {
    e.preventDefault();

    if (!userData?._id) return;

    try {
      setNotifications([]);
      setUnreadCount(0);

      await axios.delete(`${BACKEND_URL}/api/notifications/clear-all/${userData._id}`);

      console.log("All notifications have been deleted!");
    } catch (err) {
      console.error("Error deleting notifications:", err);
    }
  };

  return (
    <Dropdown
      drop="start"
      className={className}
      onToggle={handleToggle}
    >
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>Notifications</Tooltip>}
      >
        <DropdownToggle
          className="btn btn-light btn-round mb-0 arrow-none"
          role="button"
          style={{ overflow: 'visible' }}
        >
          <BsBell className="bi bi-cart3 fa-fw fs-10" />
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-warning mt-xl-2 ms-n1" style={{ zIndex: 10, pointerEvents: 'none' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </DropdownToggle>
      </OverlayTrigger>

      <DropdownMenu className="dropdown-animation dropdown-menu-end dropdown-menu-size-md p-0 shadow-lg border-0 mt-2">
        <Card className="bg-transparent">
          <CardHeader className="bg-transparent border-bottom py-3 d-flex justify-content-between">
            <h6 className="m-0">
              Notifications
            </h6>
            <Link className="small fw-bold" to="#" onClick={handleClearAll}>
              Clear all
            </Link>
          </CardHeader>

          <CardBody className="p-0">
            <ul className="list-group list-unstyled list-group-flush" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {notifications.length > 0 ? (
                notifications.map((noti, idx) => (
                  <NotificationItem key={noti._id || idx} noti={noti} />
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