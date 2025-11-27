import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import {
    getDashboardStats,
    getEarningsChart
} from '../controllers/dashboardController.js';


const dashboardRoute = express.Router();

dashboardRoute.get("/dashboard-stats", adminAuth, getDashboardStats);
dashboardRoute.get("/earnings-chart", adminAuth, getEarningsChart);

export default dashboardRoute;