import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse, sendPaginatedResponse } from "#utils/response.js";
import * as payoutService from "./payout.service.js";
import { toPayoutDto, toAdminPayoutDto } from "./payout.mapper.js";

export const requestPayout = asyncHandler(async (req, res) => {
  const instructorId = req.user.userId;
  const payout = await payoutService.requestPayout(instructorId, req.body);
  return sendSuccessResponse(res, 201, "Payout request submitted.", toPayoutDto(payout));
});

export const getMyPayouts = asyncHandler(async (req, res) => {
  const instructorId = req.user.userId;
  const { payouts, total, page, limit, totalPaid } = await payoutService.getMyPayouts(instructorId, req.query);
  const lim = Number(limit);
  const pg  = Number(page);
  return res.status(200).json({
    success: true,
    message: "Payout history fetched.",
    result: payouts.map(toPayoutDto),
    totalPaid,
    pagination: {
      page: pg,
      limit: lim,
      totalItems: total,
      totalPages: Math.ceil(total / lim),
      hasNextPage: pg * lim < total,
      hasPrevPage: pg > 1,
    },
    timestamp: new Date().toISOString(),
  });
});

export const getAllPayouts = asyncHandler(async (req, res) => {
  const { payouts, total, page, limit } = await payoutService.getAllPayouts(req.query);
  return sendPaginatedResponse(res, 200, "Payouts fetched.", payouts.map(toAdminPayoutDto), { page, limit, totalItems: total });
});

export const updatePayoutStatus = asyncHandler(async (req, res) => {
  const payout = await payoutService.updatePayoutStatus(req.params.id, req.body);
  return sendSuccessResponse(res, 200, "Payout status updated.", toAdminPayoutDto(payout));
});
