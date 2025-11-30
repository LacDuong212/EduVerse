import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";


export const adminAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await adminModel.findById(tokenDecode.id).select('-password');

    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin not found" });
    }

    req.adminId = admin._id;
    req.admin = admin;

    next();

  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
}