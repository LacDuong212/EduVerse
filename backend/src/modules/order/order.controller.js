import * as checkoutService from "#modules/checkout/checkout.service.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendPaginatedResponse, sendSuccessResponse } from "#utils/response.js";
import * as orderService from "./order.service.js";
import * as orderMapper from "./order.mapper.js";

export const getOrdersStats = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await orderService.getUserOrdersStats(userId);
  return sendSuccessResponse(res, 200, "Get order stats successfully!", result);
});

export const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const query = req.validated?.query || {};

  const { orders, total, page, limit } = await orderService.getPaginatedUserOrders(
    userId,
    query
  );

  return sendPaginatedResponse(
    res,
    200,
    "Get orders successfully!",
    orderMapper.toOrderListDtoList(orders),
    { page, limit, totalItems: total }
  );
});

export const getOrderDetail = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { orderId } = req.validated?.params || {};

  const order = await orderService.getUserOrderDetail(userId, orderId);

  return sendSuccessResponse(
    res,
    200,
    "Get order detail successfully!",
    orderMapper.toOrderDetailDto(order)
  );
});

// @route POST /
export const createOrder = asyncHandler(async (req, res) => {
  const body = req.validated?.body || {};
  const order = await checkoutService.placeOrder(req.user?.userId, body);
  return sendSuccessResponse(res, 201, "Order created!", orderMapper.toOrderDetailDto(order));
});

// @route PATCH /:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.validated?.params?.id, req.user?.userId);
  return sendSuccessResponse(res, 200, "Order cancelled!", orderMapper.toOrderDetailDto(order));
});