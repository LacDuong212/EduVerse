import * as chartService from "#modules/chart/chart.service.js";
import * as courseService from "#modules/course/course.service.js";
import * as enrollmentService from "#modules/enrollment/enrollment.service.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendPaginatedResponse, sendSuccessResponse, sendUnsuccessResponse } from "#utils/response.js";
import * as instructorMapper from "./instructor.mapper.js";
import * as instructorService from "./instructor.service.js";

// @desc  Handle student's request to become an instructor
// @route POST instructors/
export const becomeInstructor = asyncHandler(async (req, res) => {
  const user = req.user;
  await instructorService.handleBecomeInstructor(user);
  sendSuccessResponse(res, 200, "Apply for instructor successfully. Please wait for approval!");
});

// @desc  Get instructor public statistics
// @route GET instructors/:insId/stats
export const getInstructorPublicStats = asyncHandler(async (req, res) => {
  const { insId } = req.validated?.params || {};
  const stats = await instructorService.getInstructorStats(insId, false);
  sendSuccessResponse(res, 200, "Get instructor stats successfully.", { ...stats })
});

// @desc  Get instructor private statistics
// @route GET instructor/stats
export const getInstructorStats = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const stats = await instructorService.getInstructorStats(userId, true);
  sendSuccessResponse(res, 200, "Get instructor stats successfully.", { ...stats })
});

// @desc  Get sum of all courses monthly revenue (12 months)
// @route GET instructor/courses/revenue
export const getCoursesMonthlyRevenue = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await chartService.getAllCoursesMonthlyRevenueByInstructorId(userId);
  sendSuccessResponse(res, 200, "Get courses monthly revenue successfully!", result);
});

// @desc  Get instructor top revenue courses this month
// @route GET instructor/courses/top-courses
export const getTopRevenueCourses = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { limit } = req.validated?.query || {};
  const result = await chartService.getTopRevenueCoursesThisMonth(userId, limit);
  sendSuccessResponse(res, 200, "Get top revenue courses successfully!", result);
});

// @desc  Get instructor's public profile
// @route GET instructors/:insId
export const getPublicProfile = asyncHandler(async (req, res) => {
  const { insId } = req.validated?.params || {};
  const result = await instructorService.getInstructorProfile(insId);
  sendSuccessResponse(
    res,
    200,
    "Get instructor's profile successfully!",
    instructorMapper.toInstructorDetails(result, true)
  );
});

// @desc  Get instructor's private profile
// @route GET instructor/profile
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await instructorService.getInstructorProfile(userId);
  sendSuccessResponse(
    res,
    200,
    "Get instructor's profile successfully!",
    instructorMapper.toInstructorDetails(result, true)
  );
});

// @desc  Patch update an instructor's profile
// @route PATCH instructor/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const changes = req.validated?.body || {};
  const updated = await instructorService.updateInstructorProfile(userId, changes);
  return sendSuccessResponse(
    res,
    200,
    "Profile updated successfully!",
    instructorMapper.toInstructorDetails(updated));
});

// @desc  Get course monthly revenue (12 months) by id
// @route GET instructor/courses/:courseId/revenue
export const getCourseMonthlyRevenue = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const result = await chartService.getCourseMonthlyRevenue(userId, courseId);
  sendSuccessResponse(res, 200, "Get course monthly revenue successfully!", result);
});

// @desc  Get course monthly enrollments (12 months) by id
// @route GET instructor/courses/:courseId/enrollments
export const getCourseMonthlyEnrollments = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const result = await chartService.getCourseMonthlyEnrollments(userId, courseId);
  sendSuccessResponse(res, 200, "Get course monthly enrollments successfully!", result);
});

// @desc  Get instructor's students
// @route GET instructor/students?page=&limit=&search=&sort=
export const getStudents = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const query = req.validated?.query || {};
  const {
    students, total, page, limit
  } = await enrollmentService.getPaginatedStudentsByInstructorId(userId, query);

  return sendPaginatedResponse(
    res,
    200,
    "Get students successfully!",
    students,
    { page, limit, totalItems: total }
  );
});

// @desc  Get instructor's courses
// @route GET instructor/courses?page=&limit=&search=&sort=
export const getCourses = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const query = req.validated?.query || {};
  const {
    courses, total, page, limit
  } = await courseService.getPaginatedInstructorCourses(userId, query);

  return sendPaginatedResponse(
    res,
    200,
    "Get courses successfully!",
    courses,
    { page, limit, totalItems: total }
  );
});

// @desc  Get current user's instructor profile if exists
// @route GET instructors/me
export const getCurrentInstructor = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const instructor = await instructorService.getCurrentInstructor(userId);
  if (instructor)
    return sendSuccessResponse(res, 200, "Instructor profile found!", instructor);
  else
    return sendUnsuccessResponse(res, 200, "You don't have an instructor profile.");
});

// @desc  Get instructor course detail by id
// @route GET instructor/courses/:courseId/details
export const getCourseDetails = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const course = await courseService.getInstructorCourseDetails(userId, courseId);
  return sendSuccessResponse(res, 200, "Get course details successfully!", course);
});

// @desc  Get instructor earning analytics
// @route GET instructor/earnings
export const getInstructorEarnings = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await chartService.getInstructorEarnings(userId);
  return sendSuccessResponse(res, 200, "Get instructor monthly earning successfully!", result);
});

// @desc  Get instructor's public courses (infinite scroll)
// @route GET instructors/:insId/courses?limit=&skip=
export const getInstructorPublicCourses = asyncHandler(async (req, res) => {
  const { insId } = req.validated?.params || {};
  const { limit, skip } = req.validated?.query || {};
  const result = await courseService.getPublicInstructorCourses(
    insId, limit, skip
  );
  return sendSuccessResponse(
    res,
    200,
    "Get instructor's public courses successfully!",
    result
  );
});

// @desc Create a new draft course
// @route POST instructor/courses
export const createCourse = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const course = await instructorService.createDraftCourse(userId);
  return sendSuccessResponse(res, 201, "Course created successfully!", course);
});

// @desc Update course
// @route PATCH instructor/courses/:courseId
export const updateCourse = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const changes = req.validated?.body || {};
  const result = await courseService.updateCourse(userId, courseId, changes);
  return sendSuccessResponse(res, 200, "Update course successfully!", result);
});

// @desc Submit course for review
// @route POST instructor/courses/:courseId/submit
export const submitCourse = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const changes = req.validated?.body || {};
  const result = await courseService.submitCourse(userId, courseId, changes);
  return sendSuccessResponse(res, 200, "Submit course successfully!", result);
});

// @desc Clear pending changes of a course
// @route DELETE instructor/courses/:courseId/changes
export const clearCourseChanges = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const result = await courseService.clearPendingChanges(userId, courseId);
  return sendSuccessResponse(res, 200, "Clear course changes successfully!", result);
});

// @desc Get course for edit (merged with pending changes if exists)
// @route GET instructor/courses/:courseId
export const getCourseForEdit = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const course = await courseService.getCourseForEdit(userId, courseId);
  return sendSuccessResponse(res, 200, "Get course successfully!", course);
});

// #TODO: REMOVE!!
export const approveCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.validated?.params || {};
  const result = await courseService.approveCourseUpdate(courseId);
  return sendSuccessResponse(res, 200, "Unauthorized approve of course success!!");
});

// @desc Get instructor's courses stats
// @route GET instructor/courses/stats
export const getCoursesStats = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await courseService.getInstructorCoursesStats(userId);
  return sendSuccessResponse(res, 200, "Get my courses stats successfully", result);
});

// @desc Get course students by courseId
// @route GET instructor/courses/:courseId/students
export const getCourseStudents = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const query = req.validated?.query || {};
  const {
    students, total, page, limit
  } = await enrollmentService.getCourseStudentsReport(userId, courseId, query);
  return sendPaginatedResponse(
    res,
    200,
    "Get course's students successfully!",
    students,
    { page, limit, totalItems: total }
  );
});

// @desc Get instructor's students stats
// @route GET instructor/students/stats
export const getStudentsStats = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await enrollmentService.getInstructorStudentsStats(userId);
  return sendSuccessResponse(res, 200, "Get my students stats successfully", result);
});

// @desc Soft delete one instructor's draft course
// @route DELETE instructor/courses/drafts/:courseId
export const removeCourse = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.validated?.params || {};
  const result = await instructorService.removeDraftCourse(userId, courseId);
  return sendSuccessResponse(res, 200, "Removed draft course successfully!");
});