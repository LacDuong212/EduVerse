import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { getAdminViewUrl } from "../controllers/videoController.js";

const videoRoute = express.Router();

videoRoute.use(adminAuth);

videoRoute.get("/:videoId", getAdminViewUrl);

export default videoRoute;