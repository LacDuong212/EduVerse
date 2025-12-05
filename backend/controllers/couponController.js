import Coupon from "../models/couponModel.js";

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

export const applyCoupon = async (req, res) => {
  try {
    const { code, originalPrice } = req.body;
    const userId = req.userId;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code!" });
    }

    const now = new Date();

    if (now < new Date(coupon.startDate)) {
        return res.status(400).json({ success: false, message: "This coupon is not active yet." });
    }

    if (now > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: "The coupon code has expired." });
    }

    if (coupon.usersUsed.includes(userId)) {
      return res.status(400).json({ success: false, message: "You have already used this code!" });
    }

    const discountAmount = (originalPrice * coupon.discountPercent) / 100;
    

    const finalPrice = originalPrice - discountAmount;

    res.status(200).json({
      success: true,
      message: "Code applied successfully",
      data: {
        couponCode: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: discountAmount,
        newPrice: finalPrice < 0 ? 0 : finalPrice
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};