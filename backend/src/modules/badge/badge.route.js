import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import * as badgeController from "./badge.controller.js";

// @route /api/badges
const badgeRoute = Router();

// Public — anyone can browse the badge catalog
badgeRoute.get("/", badgeController.listBadges);

// Protected — student's own earned/locked badges
badgeRoute.use(protect, restrictTo("student"));
badgeRoute.get("/me", badgeController.getMyBadges);

export default badgeRoute;
