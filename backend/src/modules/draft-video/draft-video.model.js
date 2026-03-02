import mongoose from "mongoose";

const draftVideoSchema = new mongoose.Schema({
  key: { type: String, required: true },
  contentType: { type: String, required: true },
  expireAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model("DraftVideo", draftVideoSchema);