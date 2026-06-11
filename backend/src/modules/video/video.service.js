import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import AppError from "#exceptions/app.error.js";
import { getCourseInfoForVideoId } from "#modules/course/course.service.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import * as s3Service from "#services/s3.service.js";
import { withTransaction } from "#utils/transaction.js";
import logger from "#utils/logger.js";
import DraftVideo, { CONTENT_TYPE } from "./draft-video.model.js";

const EXPIRE_DURATION = 24 * 60 * 60 * 1000;

export const getKey = (insId, videoId) => {
  if (!videoId || !videoId.trim()) return null;

  if (insId && mongoose.Types.ObjectId.isValid(insId)) {
    return `videos/${insId}/${videoId}`;
  } else {
    return `videos/edv2/${videoId}`;
  }
};

export const getKeys = (insId, videoIds) => {
  if (!videoIds || !Array.isArray(videoIds) || !videoIds.length) return [];

  const basePath = insId && mongoose.Types.ObjectId.isValid(insId)
    ? `videos/${insId}/`
    : "videos/edv2/";

  return videoIds.map((videoId) => {
    if (!videoId || !videoId.trim()) return null;
    return basePath + videoId;
  });
};

export const getVideoViewUrl = async (user, videoId) => {
  if (!videoId) throw new AppError("Please provide a valid video ID!", 400);

  return await withTransaction(async (session) => {
    const video = await DraftVideo.findOne({ videoId }).session(session);
    if (!video) throw new AppError("Video not found.", 404);

    const insId = video.userId?.toString();

    const info = await getCourseInfoForVideoId(videoId, insId, session);
    const { courseId, isFree } = info || {};

    // if (!courseId) {
    //   // video.expireAt = new Date(Date.now() + EXPIRE_DURATION);
    //   // await video.save({ session });

    //   logger.warn(`Set expiration for videoId: ${videoId}`);
    //   throw new AppError("Video not found.", 404);
    // }

    const key = getKey(insId, videoId);

    // #TODO?: course must be live to watch videos (student)
    if (courseId && !isFree) {
      const isInstructor = user?.role === "instructor" && user?.userId === insId;
      const isEnrolled = user?.role === "student" && await existsEnrollment(user?.userId, courseId);

      if (!isInstructor && !isEnrolled) {
        throw new AppError("You don't have access to this video.", 403);
      }
    }

    const viewUrl = await s3Service.generateStreamUrl(key);
    if (!viewUrl) throw new AppError("Failed to generate stream link.", 500);

    return viewUrl;
  });
};

export const getVideoUploadUrl = async (insId, courseId, contentType) => {
  if (!insId) throw new AppError("Instructor ID is required", 400);

  if (!CONTENT_TYPE.includes(contentType))
    throw new AppError("Unsupported video format. Please upload MP4, WebM, or OGG.", 400);

  return await withTransaction(async (s) => {
    const extension = contentType.split("/")[1];
    const videoId = `LEC_${uuidv4()}.${extension}`;

    const filePath = getKey(insId, videoId);
    if (!filePath)
      throw new AppError("Failed to generate video storage path. Please try again later.", 500);

    const [draft] = await DraftVideo.create([{
      videoId,
      userId: insId,
      courseId,
      key: filePath,
      contentType,
      expireAt: new Date(Date.now() + EXPIRE_DURATION),
    }], { session: s });

    const { uploadUrl } = await s3Service.generateUploadUrl(filePath, contentType);

    if (!uploadUrl)
      throw new AppError("Failed to generate upload signed URL. Please try again later.", 500);

    return {
      videoId: draft.videoId,
      uploadUrl
    };
  });
};

export const setExpireForVideos = async (videoIds, isExpired = true, session = null) => {
  if (!videoIds || videoIds.length === 0) return;

  let updateQuery;

  if (isExpired) {
    const expirationDate = new Date(Date.now() + EXPIRE_DURATION);
    updateQuery = { $set: { expireAt: expirationDate } };
  } else {
    updateQuery = { $unset: { expireAt: "" } };
  }

  await DraftVideo.updateMany(
    { videoId: { $in: videoIds } },
    updateQuery,
    { session }
  );
};