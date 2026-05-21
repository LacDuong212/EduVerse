
export const toNotifDto = (notif) => {
  if (!notif) return null;

  return {
    notifId: notif._id?.toString(),
    type: notif.type || null,
    message: notif.message || null,
    isRead: notif.isRead ?? false,
    createdAt: notif.createdAt,
  };
};

export const toNotifDtoList = (notifs) => {
  if (!Array.isArray(notifs)) return [];
  return notifs.map(notif => toNotifDto(notif));
};