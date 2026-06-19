import asyncHandler from "#utils/asyncHandler.js";
import {
  sendPaginatedResponse,
  sendSuccessResponse,
} from "#utils/response.js";
import * as qaService from "./qa.service.js";

export const getQna = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params ?? req.params;
  const { page, limit, lectureId } = req.validated?.query ?? req.query;

  const { result, total, page: pageNum, limit: limitCount } =
    await qaService.getQnaForCourse(userId, courseId, { page, limit, lectureId });

  return sendPaginatedResponse(res, 200, "Q&A fetched successfully.", result, {
    page: pageNum,
    limit: limitCount,
    totalItems: total,
  });
});

export const createQuestion = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params ?? req.params;
  const body = req.validated?.body ?? req.body;

  const result = await qaService.createQuestion(userId, courseId, body);
  return sendSuccessResponse(res, 201, "Question posted.", result);
});

export const createReply = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { questionId } = req.validated?.params ?? req.params;
  const body = req.validated?.body ?? req.body;

  const result = await qaService.createReply(userId, questionId, body);
  return sendSuccessResponse(res, 201, "Reply posted.", result);
});

export const deleteQna = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { id } = req.validated?.params ?? req.params;

  await qaService.deleteQna(userId, userRole, id);
  return sendSuccessResponse(res, 200, "Deleted successfully.");
});

export const toggleResolve = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.validated?.params ?? req.params;

  const result = await qaService.toggleResolve(userId, id);
  return sendSuccessResponse(res, 200, "Updated.", result);
});
