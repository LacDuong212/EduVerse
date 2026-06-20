import { getStudentSkillsRadar } from "#modules/chart/chart.service.js";
import { getPaginatedStudentCourses } from "#modules/enrollment/enrollment.service.js";
import { getCourseProgress, getResumeCardData } from "#modules/learning/learning.service.js";
import * as streakService from "#modules/streak/streak.service.js";
import { sendPaginatedResponse, sendSuccessResponse } from "#utils/response.js";
import asyncHandler from "#utils/asyncHandler.js";
import * as studentMapper from "./student.mapper.js";
import * as studentService from "./student.service.js";

// @desc  Patch update a student's profile
// @route PATCH /profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const changes = req.validated?.body || {};
  const result = await studentService.updateStudentProfile(userId, changes);
  return sendSuccessResponse(
    res,
    200,
    "Profile updated successfully!",
    studentMapper.toStudentProfileDto(result)
  );
});

// @desc  Get student's profile
// @route GET /profile
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await studentService.getStudentProfile(userId);
  sendSuccessResponse(
    res,
    200,
    "Get student's profile successfully!",
    studentMapper.toStudentProfileDto(result)
  );
});

// @desc  Update student's interests
// @route PUT /interests
export const updateInterests = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { interests } = req.validated?.body || {};
  const result = await studentService.updateStudentInterests(userId, interests);
  return sendSuccessResponse(res, 200, "Interests updated successfully!", result);
});

// @desc  Get student's enrolled courses
// @route GET /courses?page=&limit=&search=&sort=
export const getEnrolledCourses = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const query = req.validated?.query || {};
  const {
    courses, total, page, limit
  } = await getPaginatedStudentCourses(userId, query);

  return sendPaginatedResponse(
    res,
    200,
    "Get courses successfully!",
    courses,
    { page, limit, totalItems: total }
  );
});

// @desc Get student's courses stats
// @route GET /courses/stats
export const getCoursesStats = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await studentService.getStudentCoursesStats(userId);
  return sendSuccessResponse(res, 200, "Get my courses stats successfully!", result);
});

// @desc  Get student's stats
// @route GET /stats
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await studentService.getStudentStats(userId);
  return sendSuccessResponse(res, 200, "Get student stats successfully!", result);
});

// @desc Get course current learning progress by course ID
// @route GET /courses/:courseId/progress
export const getCourseLearningProgress = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const progress = await getCourseProgress(userId, courseId);
  return sendSuccessResponse(res, 200, "Get course's progress successfully!", progress);
});

// @desc Update lecture progress and handle completion
// @route POST /courses/:courseId/lectures/:lecId/progress
export const updateLectureProgress = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId, lecId } = req.validated?.params || {};
  const body = req.validated?.body || {};
  const updated = await studentService.handleUpdateLectureProgress(userId, courseId, lecId, body);
  return sendSuccessResponse(res, 200, "Update lecture progress successfully!", updated);
});

// @desc  Get student's learning streak data
// @route GET /streak
export const getMyStreak = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await streakService.getStreak(userId);
  return sendSuccessResponse(res, 200, "Get student streak successfully!", result);
});

// @desc Update student's streak
// @route POST /streak
export const updateMyStreak = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await streakService.updateStreak(userId);
  return sendSuccessResponse(res, 200, "Streak updated successfully!", result);
});

// @desc Get student's skill radar
// @route GET /skill-radar
export const getMySkillRadar = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await getStudentSkillsRadar(userId);
  return sendSuccessResponse(res, 200, "Get skill radar successfully!", result);
});

// @desc  Get the single most-recently-accessed in-progress lecture for the resume card
// @route GET /resume
export const getResumeCard = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await getResumeCardData(userId);
  return sendSuccessResponse(res, 200, "Get resume card successfully!", result);
});

// @desc  Get enrolled course detail for learning page
// @route GET /courses/:courseId
export const getLearningCourseDetail = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};

  const course = await studentService.getStudentLearningCourseDetail(
    userId,
    courseId
  );

  return sendSuccessResponse(
    res,
    200,
    "Get learning course detail successfully!",
    { course }
  );
});