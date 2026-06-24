import { Router } from "express";
import { protect } from "#middlewares/auth.middleware.js";
import * as certificateController from "./certificate.controller.js";

// @route /certificates
const certificateRoute = Router();

// Protected: list current user's certificates (must precede "/:certId")
certificateRoute.get("/me", protect, certificateController.listMyCertificates);

// Protected: issue (or fetch) cert for the current user's completed course
certificateRoute.post(
  "/courses/:courseId/issue",
  protect,
  certificateController.issueCertificate
);

// Public: verify a certificate by its id (no auth)
certificateRoute.get("/:certId", certificateController.verifyCertificate);

export default certificateRoute;
