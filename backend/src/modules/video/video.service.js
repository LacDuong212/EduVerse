import mongoose, { get } from "mongoose";
import AppError from "#exceptions/app.error.js";
import { getCourseInfoForVideoId } from "#modules/course/course.service.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import { generateStreamUrl } from "#services/s3.service.js";
import DraftVideo from "./draft-video.model.js";

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

  const { courseId, insId, isFree } = await getCourseInfoForVideoId(videoId);
  
  const key = getKey(insId, videoId);
  if (!key) throw new AppError("Video not found.", 404);

  if (!isFree) {
    const isInstructor = user?.role === "instructor" && user?.userId === insId;
    const isEnrolled = user?.role === "student" && await existsEnrollment(user?.userId, courseId);

    if (!isInstructor && !isEnrolled) {
      throw new AppError("You don't have access to this video.", 403);
    }
  }

  const viewUrl = await generateStreamUrl(key);
  if (!viewUrl) throw new AppError("Failed to generate stream link.", 500);

  return viewUrl;
};


export default {
  getKey,
  getKeys,
  getVideoViewUrl,

};