import Coupon from "../models/couponModel.js";
import { logAction, ACTION, ENTITY } from "../utils/auditLogger.js";

// Validate discountType + discountValue against the model rules.
// Returns an error message string, or null when valid.
const validateDiscount = (discountType, discountValue) => {
  if (!['percent', 'money'].includes(discountType)) {
    return "Discount type must be either 'percent' or 'money'";
  }

  const value = Number(discountValue);
  if (isNaN(value) || value < 1) {
    return "Discount value must be a positive number";
  }

  if (discountType === 'percent' && value > 100) {
    return "The percentage reduction must be between 1 and 100";
  }

  return null;
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, startDate, description } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate || !startDate || !description) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    const discountError = validateDiscount(discountType, discountValue);
    if (discountError) {
      return res.status(400).json({ success: false, message: discountError });
    }

    const start = new Date(startDate);
    const end = new Date(expiryDate);

    if (start >= end) {
      return res.status(400).json({ success: false, message: "Start date must be before expiry date" });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: "This code already exists" });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      startDate: start,
      expiryDate: end
    });

    await newCoupon.save();

    logAction({
      adminId: req.admin?._id || req.adminId,
      adminName: req.admin?.name || "Admin",
      action: ACTION.COUPON_CREATE,
      entityType: ENTITY.COUPON,
      entityId: newCoupon._id,
      entityLabel: newCoupon.code,
      after: { code: newCoupon.code, discountType, discountValue: Number(discountValue), startDate, expiryDate },
      req,
    });

    res.status(201).json({
      success: true,
      message: `Coupon ${code.toUpperCase()} created successfully`,
      data: newCoupon
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, expiryDate, startDate, description } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate || !startDate || !description) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    const discountError = validateDiscount(discountType, discountValue);
    if (discountError) {
      return res.status(400).json({ success: false, message: discountError });
    }

    const start = new Date(startDate);
    const end = new Date(expiryDate);

    if (start >= end) {
      return res.status(400).json({ success: false, message: "Start date must be before expiry date" });
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    const upperCode = code.toUpperCase();
    if (upperCode !== coupon.code) {
      const duplicate = await Coupon.findOne({ code: upperCode, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "This code already exists" });
      }
    }

    const before = {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate
    };

    coupon.code = upperCode;
    coupon.description = description;
    coupon.discountType = discountType;
    coupon.discountValue = Number(discountValue);
    coupon.startDate = start;
    coupon.expiryDate = end;

    await coupon.save();

    logAction({
      adminId: req.admin?._id || req.adminId,
      adminName: req.admin?.name || "Admin",
      action: ACTION.COUPON_UPDATE,
      entityType: ENTITY.COUPON,
      entityId: coupon._id,
      entityLabel: coupon.code,
      before,
      after: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        startDate: coupon.startDate,
        expiryDate: coupon.expiryDate
      },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} updated successfully`,
      data: coupon
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    logAction({
      adminId: req.admin?._id || req.adminId,
      adminName: req.admin?.name || "Admin",
      action: ACTION.COUPON_UPDATE_STATUS,
      entityType: ENTITY.COUPON,
      entityId: coupon._id,
      entityLabel: coupon.code,
      before: { isActive: !isActive },
      after: { isActive },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} is now ${isActive ? "Active" : "Inactive"}`,
      data: coupon
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    logAction({
      adminId: req.admin?._id || req.adminId,
      adminName: req.admin?.name || "Admin",
      action: ACTION.COUPON_DELETE,
      entityType: ENTITY.COUPON,
      entityId: coupon._id,
      entityLabel: coupon.code,
      req,
    });

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};