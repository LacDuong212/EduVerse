import mongoose from "mongoose";

const bankInfoSchema = new mongoose.Schema({
  bankName:      { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  accountName:   { type: String, required: true, trim: true },
}, { _id: false });

const payoutSchema = new mongoose.Schema({
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount:      { type: Number, required: true, min: 0 },
  bankInfo:    bankInfoSchema,
  status: {
    type: String,
    enum: ["pending", "approved", "paid", "rejected"],
    default: "pending",
  },
  adminNote:   { type: String, trim: true, default: null },
  periodLabel: { type: String, trim: true, default: null },
  processedAt: { type: Date, default: null },
  isDeleted:   { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Payout", payoutSchema);
