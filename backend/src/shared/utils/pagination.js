
export const getPaginationOptions = (pageReq = 1, limitReq = 10) => {
  const page = Math.max(1, parseInt(pageReq) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(limitReq) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};