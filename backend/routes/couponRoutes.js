import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { 
    applyCoupon, 
    getAllCoupons
} from "../controllers/couponController.js";


const couponRoute = express.Router();

couponRoute.use(userAuth);

couponRoute.get("/", getAllCoupons);
couponRoute.post("/apply", applyCoupon);

export default couponRoute;