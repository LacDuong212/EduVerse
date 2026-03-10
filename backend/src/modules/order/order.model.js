import mongoose from "mongoose";
import Coupon from "#modules/coupon/coupon.model.js";

export const ORDER_EXPIRATION = 1 * 60 * 60 * 1000;
export const PAYMENT_METHOD_ENUM = ["momo", "vnpay", "free"];
export const STATUS_ENUM = ["pending", "completed", "refunded", "cancelled"];

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  courses: [
    new mongoose.Schema({
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
      pricePaid: { type: Number, required: true },
    }, { _id: false })
  ],

  subTotal: { type: Number, required: true },

  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    default: null
  },

  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  paymentMethod: {
    type: String,
    enum: PAYMENT_METHOD_ENUM,
    required: true,
  },

  status: {
    type: String,
    enum: STATUS_ENUM,
    default: STATUS_ENUM[0],
  },

  expiresAt: { type: Date, default: () => Date.now() + ORDER_EXPIRATION },
}, { timestamps: true });

orderSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "pending" } }
);

export default mongoose.model("Order", orderSchema);