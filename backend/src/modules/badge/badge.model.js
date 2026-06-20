import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    category: {
      type: String,
      enum: ["streak", "completion", "performance"],
      required: true,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common",
    },
    condition: {
      type: { type: String, required: true },
      threshold: { type: Number },
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Badge", badgeSchema, "badges");
