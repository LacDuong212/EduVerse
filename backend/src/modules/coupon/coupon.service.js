import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js"
import Coupon from "./coupon.model.js";
import { sendNotification } from "#modules/notification/notification.service.js";
import { TYPE_ENUM as NOTIF_TYPE } from "#modules/notification/notification.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";

export const getAllCoupons = async () => {
  return Coupon.find()
    .sort({ createdAt: -1 })
    .lean();
};

export const applyCoupon = async (couponCode, originalPrice, userId) => {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
    usersUsed: { $ne: new mongoose.Types.ObjectId(userId) }
  }).lean();

  if (!coupon) {
    const exists = await Coupon.findOne({
      code: couponCode.toUpperCase()
    }).lean();

    if (!exists) {
      throw new AppError("Invalid coupon code.", 404);
    }

    if (exists.usersUsed.some(id => id.toString() === userId.toString())) {
      throw new AppError("You already used this coupon.", 409);
    }

    throw new AppError("Invalid coupon code.", 404);
  }

  const now = new Date();

  if (now < new Date(coupon.startDate))
    throw new AppError("This coupon is not active yet.", 400);

  if (now > new Date(coupon.expiryDate))
    throw new AppError("Coupon already expired.", 400);

  if (
    coupon.courseId &&
    !(coupon.refundees || []).some(id => id.toString() === userId.toString())
  ) {
    throw new AppError("You are not allowed to use this refund coupon.", 403);
  }

  let discountAmount = 0;

  if (coupon.discountType === "percent") {
    discountAmount = (originalPrice * coupon.discountValue) / 100;
  } else if (coupon.discountType === "money") {
    discountAmount = coupon.discountValue;
  }

  const finalPrice = Math.max(originalPrice - discountAmount, 0);

  return {
    couponCode: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    newPrice: finalPrice,
    expiryDate: coupon.expiryDate
  };
};

export const validateCoupon = async (couponCode, userId, session = null) => {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    usersUsed: { $ne: userId },
    isActive: true,
  }).session(session)
    .lean();

  if (!coupon)
    throw new AppError("Invalid coupon or coupon already used.", 400);

  const now = new Date();
  if (now < new Date(coupon.startDate))
    throw new AppError("This coupon is not active yet.", 400);

  if (now > new Date(coupon.expiryDate))
    throw new AppError("Coupon already expired.", 400);

  return coupon;
};

export const updateUsedCoupon = async (couponId, userId, session = null) => {
  return await Coupon.findByIdAndUpdate(
    couponId,
    { $addToSet: { usersUsed: userId } },
    { session }
  ).lean();
};

const formatExpiryDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const getRefundCouponStatus = async (courseId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new AppError("Invalid course id.", 400);
  }

  const coupon = await Coupon.findOne({
    courseId,
    discountType: "money",
    isActive: true
  }).lean();

  if (!coupon) {
    return {
      exists: false,
      claimed: false,
      expired: false,
      coupon: null
    };
  }

  const now = new Date();
  const expired = now > new Date(coupon.expiryDate);

  const claimed = (coupon.refundees || []).some(
    id => id.toString() === userId.toString()
  );

  return {
    exists: true,
    claimed,
    expired,
    coupon: {
      code: claimed ? coupon.code : null,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate
    }
  };
};

export const claimRefundCoupon = async (courseId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new AppError("Invalid course id.", 400);
  }

  if (!userId) {
    throw new AppError("User ID is required.", 401);
  }

  const enrollment = await Enrollment.exists({
    student: userId,
    course: courseId,
    status: ENROLL_STATUS.active
  });

  if (!enrollment) {
    throw new AppError(
      "Refund coupons are only available to students who joined this course.",
      403
    );
  }

  const coupon = await Coupon.findOne({
    courseId,
    discountType: "money",
    isActive: true
  });

  if (!coupon) {
    throw new AppError("Refund coupon is not available for this course.", 404);
  }

  const now = new Date();

  if (now < new Date(coupon.startDate)) {
    throw new AppError("This refund coupon is not active yet.", 400);
  }

  if (now > new Date(coupon.expiryDate)) {
    throw new AppError("This refund coupon has expired.", 400);
  }

  const alreadyClaimed = coupon.refundees.some(
    id => id.toString() === userId.toString()
  );

  if (alreadyClaimed) {
    return {
      claimed: true,
      alreadyClaimed: true,
      message: "You have already claimed this refund coupon.",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expiryDate: coupon.expiryDate
      }
    };
  }

  coupon.refundees.addToSet(userId);
  await coupon.save();

  setTimeout(async () => {
    try {
      await sendNotification(
        userId,
        NOTIF_TYPE.info,
        `Your refund coupon is ready.\nCoupon code: ${coupon.code}\nValue: ${coupon.discountValue}\nExpires on: ${formatExpiryDate(coupon.expiryDate)}`
      );
    } catch (err) {
      console.error(
        "[Claim Refund Coupon]: Failed to send delayed refund coupon notification:",
        err.message
      );
    }
  }, 60 * 1000);

  return {
    claimed: true,
    alreadyClaimed: false,
    message: "Refund coupon claimed successfully. You will receive a notification in 60 seconds.",
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      expiryDate: coupon.expiryDate
    }
  };
};