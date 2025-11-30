import express from 'express';
import {
    getEarningsHistory,
    getEarningsStats
} from '../controllers/earningController.js';
import { adminAuth } from "../middlewares/adminAuth.js";


const earningRoute = express.Router();

earningRoute.get("/history", adminAuth, getEarningsHistory);
earningRoute.get("/stats", adminAuth, getEarningsStats);

export default earningRoute;