import mongoose from "mongoose";

const draftVideoSchema = new mongoose.Schema({
  key: { type: String, required: true },
  contentType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, default: () => Date.now() + 24*60*60*1000 } // draft expires in 24 hours
});

export default mongoose.model("DraftVideo", draftVideoSchema);
