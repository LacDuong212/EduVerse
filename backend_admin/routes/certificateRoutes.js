import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { getAllCertificates } from "../controllers/certificateController.js";

const certificateRoute = express.Router();

certificateRoute.get("/", adminAuth, getAllCertificates);

export default certificateRoute;
