import mongoose from "mongoose";

const draftVideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
  key: { type: String, required: true },
  contentType: { type: String, required: true },
  expireAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model("DraftVideo", draftVideoSchema);