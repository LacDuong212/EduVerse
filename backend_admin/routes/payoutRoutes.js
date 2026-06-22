import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { getAllPayouts, updatePayoutStatus } from "../controllers/payoutController.js";

const payoutRoute = express.Router();

payoutRoute.get("/",     adminAuth, getAllPayouts);
payoutRoute.patch("/:id", adminAuth, updatePayoutStatus);

export default payoutRoute;
