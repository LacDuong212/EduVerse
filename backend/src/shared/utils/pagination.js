import { z } from "zod";

export const pageSchema = z.coerce
  .number("Page must be a number")
  .default(1)
  .transform((val) => Math.max(val, 1));

export const limitSchema = (defaultLimit = 10, maxLimit = 100) => z.coerce
  .number("Limit must be a number")
  .default(defaultLimit)
  .transform((val) => Math.min(Math.max(val, 1), maxLimit));

export const getPaginationOptions = (pageReq = 1, limitReq = 10, maxLimit = 100) => {
  const page = Math.max(1, parseInt(pageReq) || 1);
  const limit = Math.max(1, Math.min(maxLimit, parseInt(limitReq) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};