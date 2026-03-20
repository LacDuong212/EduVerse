import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as orderService from "./order.service.js";
import * as orderMapper from "./order.mapper.js";

// @route GET /
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user?.userId);
  return sendSuccessResponse(res, 200, "Orders fetched", orderMapper.toOrderDtoList(orders));
});

// @route GET /:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.validated?.params.id, req.user?.userId);
  return sendSuccessResponse(res, 200, "Order fetched", orderMapper.toOrderDto(order));
});

// @route POST /
export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user?.userId, req.validated?.body);
  return sendSuccessResponse(res, 201, "Order created", orderMapper.toOrderDto(order));
});

// @route PATCH /:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.validated?.params.id, req.user?.userId);
  return sendSuccessResponse(res, 200, "Order cancelled", orderMapper.toOrderDto(order));
});