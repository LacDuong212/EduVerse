import { rateLimit } from "express-rate-limit";

import logger from "#utils/logger.js";
import { sendError } from "#utils/response.js";

// In-memory store — hợp deploy 1 instance. Scale nhiều instance/process (PM2
// cluster) thì phải chuyển sang store dùng chung (Redis/Mongo) qua option `store`.
// Mọi ngưỡng đều override được qua env (xem từng limiter bên dưới).

const minutes = (m) => m * 60 * 1000;

const rateLimitHandler = (message) => (req, res, next, options) => {
  const resetTime = req.rateLimit?.resetTime;
  const retryAfterSec = resetTime
    ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
    : Math.ceil(options.windowMs / 1000);
  res.setHeader("Retry-After", retryAfterSec);

  logger.warn(`Rate limit exceeded: ${req.method} ${req.originalUrl} from IP ${req.ip}`);
  return sendError(res, 429, message);
};

const baseOptions = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
};

// Global — toàn bộ /api. Default ~20 req/s/IP (200 / 10s).
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 10_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  handler: rateLimitHandler("Too many requests. Please try again later."),
});

// Chống brute-force login/register. Default 10 / 15 phút / IP, chỉ tính lần thất bại.
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(Number(process.env.RATE_LIMIT_AUTH_WINDOW_MIN) || 15),
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10,
  skipSuccessfulRequests: true,
  handler: rateLimitHandler(
    "Too many attempts. Please try again in a few minutes."
  ),
});

// Chống spam OTP & brute-force mã. Default 5 / 15 phút / IP.
export const otpLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(Number(process.env.RATE_LIMIT_OTP_WINDOW_MIN) || 15),
  max: Number(process.env.RATE_LIMIT_OTP_MAX) || 5,
  handler: rateLimitHandler(
    "Too many requests for this action. Please try again later."
  ),
});
