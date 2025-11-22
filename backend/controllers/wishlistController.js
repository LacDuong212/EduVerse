import Wishlist from "../models/wishlistModel.js";
import mongoose from "mongoose";

export const addToWishlist = async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID or Course ID"
            });
        }

        const newItem = await Wishlist.create({ userId, courseId });

        const populatedItem = await newItem.populate("courseId");

        return res.status(201).json({
            success: true,
            message: "Added to wishlist",
            data: populatedItem
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Course already in wishlist"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.body.userId || req.query.userId;
        const courseId = req.body.courseId || req.query.courseId;

        if (!userId || !courseId) {
            return res.status(400).json({ success: false, message: "Missing userId or courseId" });
        }

        const deleted = await Wishlist.findOneAndDelete({ userId, courseId });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Course not found in wishlist" });
        }

        return res.status(200).json({
            success: true,
            message: "Removed from wishlist",
            data: courseId
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        const list = await Wishlist.find({ userId })
            .populate("courseId")
            .sort({ addedAt: -1 })
            .lean();

        const cleanList = list.filter(item => item.courseId !== null);

        return res.status(200).json({
            success: true,
            data: cleanList
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const checkWishlist = async (req, res) => {
    try {
        const { userId, courseId } = req.query;

        const exists = await Wishlist.exists({ userId, courseId });

        return res.status(200).json({
            success: true,
            exists: !!exists
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const countWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        const count = await Wishlist.countDocuments({ userId });

        return res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
