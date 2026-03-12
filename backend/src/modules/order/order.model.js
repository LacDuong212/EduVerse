import mongoose from "mongoose";
import Enum from "#utils/enum.js";
import Coupon from "#modules/coupon/coupon.model.js";

export const ORDER_EXPIRATION = 1 * 60 * 60 * 1000;
export const PAYMENT_METHOD_ENUM = new Enum({
  mom: "momo",
  vnpay: "vnpay",
  free: "free"
});
export const STATUS_ENUM = new Enum({
  pending: "pending",
  completed: "completed",
  refunded: "refunded",
  cancelled: "cancelled"
});

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
    enum: PAYMENT_METHOD_ENUM.values(),
    required: true,
  },

  status: {
    type: String,
    enum: STATUS_ENUM.values(),
    default: STATUS_ENUM.pending,
  },

  expiresAt: { type: Date, default: () => Date.now() + ORDER_EXPIRATION },
}, { timestamps: true });

orderSchema.index({ user: 1, "courses.course": 1 });
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "pending" } }
);

export default mongoose.model("Order", orderSchema);