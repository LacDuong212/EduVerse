import mongoose from "mongoose";
import DraftVideo from "../models/draftVideoModel.js";
import { generateStreamUrl } from "../utils/s3.service.js";

const getKey = (insId, videoId) => {
  if (!videoId || !videoId.trim()) return null;

  if (insId && mongoose.Types.ObjectId.isValid(insId)) {
    return `videos/${insId}/${videoId}`;
  }

  return `videos/edv2/${videoId}`;
};

export const getAdminViewUrl = async (req, res) => {
  try {
    const admin = req.admin;
    const { videoId } = req.params || {};

    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid video ID.",
      });
    }

    const video = await DraftVideo.findOne({ videoId }).lean();

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    const insId = video.userId?.toString();
    const key = video.key || getKey(insId, videoId);

    if (!key) {
      return res.status(404).json({
        success: false,
        message: "Video key not found.",
      });
    }

    const viewUrl = await generateStreamUrl(key);

    if (!viewUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate stream link.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Get admin video stream URL successfully.",
      result: viewUrl,
    });
  } catch (error) {
    console.error("Failed to get admin video stream URL:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get admin video stream URL.",
      error: error.message,
    });
  }
};