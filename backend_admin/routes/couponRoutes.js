import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import { 
    createCoupon, 
    updateCouponStatus, 
    getAllCoupons,
    deleteCoupon
} from "../controllers/couponController.js";


const couponRoute = express.Router();

couponRoute.use(adminAuth);

couponRoute.post("/", createCoupon);
couponRoute.get("/",getAllCoupons);
couponRoute.put("/:id/status", updateCouponStatus);
couponRoute.delete("/:id", deleteCoupon);

export default couponRoute;