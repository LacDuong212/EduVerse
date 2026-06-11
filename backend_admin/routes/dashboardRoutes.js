import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import {
    getDashboardStats,
    getEarningsChart,
    getUserGrowthChart,
    getCourseStatusChart,
    getTopCoursesChart,
    getMonthlyEnrollmentsChart,
    getOrderStatusChart,
    getCoursesByCategoryChart,
    getTopInstructorsByRevenueChart
} from '../controllers/dashboardController.js';


const dashboardRoute = express.Router();

dashboardRoute.get("/dashboard-stats", adminAuth, getDashboardStats);
dashboardRoute.get("/earnings-chart", adminAuth, getEarningsChart);
dashboardRoute.get("/user-growth-chart", adminAuth, getUserGrowthChart);
dashboardRoute.get("/course-status-chart", adminAuth, getCourseStatusChart);
dashboardRoute.get("/top-courses-chart", adminAuth, getTopCoursesChart);
dashboardRoute.get("/monthly-enrollments-chart", adminAuth, getMonthlyEnrollmentsChart);
dashboardRoute.get("/order-status-chart", adminAuth, getOrderStatusChart);
dashboardRoute.get("/courses-by-category-chart", adminAuth, getCoursesByCategoryChart);
dashboardRoute.get("/top-instructors-revenue-chart", adminAuth, getTopInstructorsByRevenueChart);

export default dashboardRoute;