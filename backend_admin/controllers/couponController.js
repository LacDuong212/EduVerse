import Coupon from "../models/couponModel.js";

export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiryDate, startDate, description } = req.body;

    if (!code || !discountPercent || !expiryDate || !startDate || !description) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
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

    if (discountPercent < 1 || discountPercent > 100) {
      return res.status(400).json({ success: false, message: "The percentage reduction must be between 1 and 100" });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountPercent,
      startDate: start,
      expiryDate: end
    });

    await newCoupon.save();

    res.status(201).json({
      success: true,
      message: `Coupon ${code.toUpperCase()} created successfully`,
      data: newCoupon
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

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};