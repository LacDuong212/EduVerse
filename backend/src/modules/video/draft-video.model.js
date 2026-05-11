import mongoose from "mongoose";

export const CONTENT_TYPE = Object.freeze([
  "video/mp4",
  "video/webm",
  "video/ogg"
]);

const draftVideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId:  { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  key: { type: String, required: true },
  contentType: { type: String, enum: CONTENT_TYPE, required: true },
  expireAt: { type: Date }
}, {
  timestamps: true
});

draftVideoSchema.index({ expireAt: 1 }/*, { expireAfterSeconds: 0 }*/);
draftVideoSchema.index({ videoId: 1 });

export default mongoose.model("DraftVideo", draftVideoSchema);