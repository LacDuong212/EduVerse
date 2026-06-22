import AuditLog from "../models/auditLogModel.js";

export const ACTION = {
  // Auth
  LOGIN_SUCCESS:        "LOGIN_SUCCESS",
  LOGIN_FAILED:         "LOGIN_FAILED",
  LOGOUT:               "LOGOUT",
  // Course
  COURSE_APPROVE:       "COURSE_APPROVE",
  COURSE_REJECT:        "COURSE_REJECT",
  COURSE_BLOCK:         "COURSE_BLOCK",
  COURSE_UNBLOCK:       "COURSE_UNBLOCK",
  COURSE_DELETE:        "COURSE_DELETE",
  COURSE_RESTORE:       "COURSE_RESTORE",
  // Instructor
  INSTRUCTOR_APPROVE:   "INSTRUCTOR_APPROVE",
  INSTRUCTOR_REJECT:    "INSTRUCTOR_REJECT",
  INSTRUCTOR_BLOCK:     "INSTRUCTOR_BLOCK",
  INSTRUCTOR_UNBLOCK:   "INSTRUCTOR_UNBLOCK",
  // Payout
  PAYOUT_MARK_PAID:     "PAYOUT_MARK_PAID",
  PAYOUT_REJECT:        "PAYOUT_REJECT",
  // Coupon
  COUPON_CREATE:        "COUPON_CREATE",
  COUPON_UPDATE_STATUS: "COUPON_UPDATE_STATUS",
  COUPON_DELETE:        "COUPON_DELETE",
  // Category
  CATEGORY_CREATE:      "CATEGORY_CREATE",
  CATEGORY_UPDATE:      "CATEGORY_UPDATE",
  CATEGORY_DELETE:      "CATEGORY_DELETE",
};

export const ENTITY = {
  AUTH:        "AUTH",
  COURSE:      "COURSE",
  INSTRUCTOR:  "INSTRUCTOR",
  PAYOUT:      "PAYOUT",
  COUPON:      "COUPON",
  CATEGORY:    "CATEGORY",
};

/**
 * Fire-and-forget audit log writer.
 * Never throws — log failure must never block the main request.
 */
export const logAction = ({
  adminId,
  adminName,
  action,
  entityType,
  entityId   = null,
  entityLabel = null,
  before     = null,
  after      = null,
  success    = true,
  failReason = null,
  req        = null,
}) => {
  const ipAddress = req
    ? (req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || null)
    : null;
  const userAgent = req?.headers?.["user-agent"] || null;

  AuditLog.create({
    adminId,
    adminName,
    action,
    entityType,
    entityId:    entityId ? String(entityId) : null,
    entityLabel: entityLabel || null,
    before,
    after,
    success,
    failReason,
    ipAddress,
    userAgent,
  }).catch((err) =>
    console.error("[AuditLog] Failed to write log:", err.message)
  );
};
