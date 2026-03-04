import jwt from "jsonwebtoken";
import { COOKIE_MAX_AGE } from "#constants/others.js";

/**
 * Generates JWT and sets an HTTP-only cookie.
 * @param {Object} userId - The user ID
 * @param {Response} res - Express response object
 */
export const setTokenCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return token;
};