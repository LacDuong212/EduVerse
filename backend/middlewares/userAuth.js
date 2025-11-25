import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const userAuth = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    try {

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(tokenDecode.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }

        req.userId = user._id;
        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
}

export const checkAuth = async (req, res, next) => {
    let token;
    if (req.cookies.token) token = req.cookies.token;

    if (!token) {
        req.user = null; 
        return next();
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(tokenDecode.id).select('-password');

        if (user) {
            req.userId = user._id;
            req.user = user;
        } else {
            req.user = null;
        }
        next();

    } catch (error) {
        req.user = null;
        next();
    }
}

export default userAuth;