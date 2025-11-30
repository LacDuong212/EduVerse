import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import { changePassword, getAdminProfile } from '../controllers/accountController.js'


const accountRoute = express.Router();

accountRoute.patch("/change-password", adminAuth, changePassword);
accountRoute.get("/profile", adminAuth, getAdminProfile);

export default accountRoute;