import AppError from "#exceptions/app.error.js";
import Course from "#modules/course/course.model.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import { getPaginationOptions } from "#utils/pagination.js";
import * as qaMapper from "./qa.mapper.js";
import QnA from "./qa.model.js";

const checkCourseAccess = async (userId, courseId) => {
  const course = await Course.findOne({ _id: courseId, isDeleted: false })
    .select("instructor")
    .lean();
  if (!course) throw new AppError("Course not found.", 404);

  const isInstructor = course.instructor?.ref?.toString() === userId;

  if (!isInstructor) {
    const enrolled = await existsEnrollment(userId, courseId);
    if (!enrolled)
      throw new AppError("You must be enrolled in this course.", 403);
  }

  return { isInstructor };
};

export const getQnaForCourse = async (
  userId,
  courseId,
  { page, limit, lectureId }
) => {
  await checkCourseAccess(userId, courseId);

  const { page: pageNum, limit: limitCount, skip } = getPaginationOptions(
    page,
    limit
  );

  const rootQuery = {
    courseId,
    parentId: null,
    isDeleted: false,
    ...(lectureId ? { lectureId } : {}),
  };

  const [roots, total] = await Promise.all([
    QnA.find(rootQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitCount)
      .populate("author", "name pfpImg")
      .lean(),
    QnA.countDocuments(rootQuery),
  ]);

  const rootIds = roots.map((r) => r._id);
  const replies = rootIds.length
    ? await QnA.find({ parentId: { $in: rootIds }, isDeleted: false })
        .sort({ createdAt: 1 })
        .populate("author", "name pfpImg")
        .lean()
    : [];

  const replyMap = {};
  for (const reply of replies) {
    const key = reply.parentId.toString();
    if (!replyMap[key]) replyMap[key] = [];
    replyMap[key].push(reply);
  }

  const result = roots.map((root) =>
    qaMapper.toQuestionDto(
      root,
      replyMap[root._id.toString()] || [],
      userId
    )
  );

  return { result, total, page: pageNum, limit: limitCount };
};

export const createQuestion = async (userId, courseId, { content, lectureId }) => {
  const { isInstructor } = await checkCourseAccess(userId, courseId);

  const qa = await QnA.create({
    courseId,
    author: userId,
    content,
    lectureId: lectureId || null,
    parentId: null,
    isInstructorPost: isInstructor,
  });

  const populated = await QnA.findById(qa._id)
    .populate("author", "name pfpImg")
    .lean();

  return qaMapper.toQuestionDto(populated, [], userId);
};

export const createReply = async (userId, questionId, { content }) => {
  const parent = await QnA.findOne({
    _id: questionId,
    parentId: null,
    isDeleted: false,
  }).lean();
  if (!parent) throw new AppError("Question not found.", 404);

  const { isInstructor } = await checkCourseAccess(
    userId,
    parent.courseId.toString()
  );

  const reply = await QnA.create({
    courseId: parent.courseId,
    author: userId,
    content,
    parentId: questionId,
    lectureId: parent.lectureId,
    isInstructorPost: isInstructor,
  });

  const populated = await QnA.findById(reply._id)
    .populate("author", "name pfpImg")
    .lean();

  return qaMapper.toReplyDto(populated, userId);
};

export const deleteQna = async (userId, userRole, id) => {
  const qa = await QnA.findOne({ _id: id, isDeleted: false }).lean();
  if (!qa) throw new AppError("Q&A not found.", 404);

  const isAuthor = qa.author.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isAuthor && !isAdmin) {
    const course = await Course.findOne({ _id: qa.courseId, isDeleted: false })
      .select("instructor")
      .lean();
    const isCourseInstructor =
      course?.instructor?.ref?.toString() === userId;
    if (!isCourseInstructor)
      throw new AppError("You are not authorized to delete this.", 403);
  }

  await QnA.updateOne({ _id: id }, { $set: { isDeleted: true } });

  if (!qa.parentId) {
    await QnA.updateMany({ parentId: id }, { $set: { isDeleted: true } });
  }

  return true;
};

export const toggleResolve = async (userId, id) => {
  const qa = await QnA.findOne({
    _id: id,
    parentId: null,
    isDeleted: false,
  }).lean();
  if (!qa) throw new AppError("Question not found.", 404);

  const course = await Course.findOne({ _id: qa.courseId, isDeleted: false })
    .select("instructor")
    .lean();
  const isInstructor = course?.instructor?.ref?.toString() === userId;
  const isAuthor = qa.author.toString() === userId;

  if (!isAuthor && !isInstructor)
    throw new AppError("You are not authorized.", 403);

  const updated = await QnA.findOneAndUpdate(
    { _id: id },
    { $set: { isResolved: !qa.isResolved } },
    { new: true, lean: true }
  );

  return { isResolved: updated.isResolved };
};
