import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

import { COOKIE_MAX_AGE, JWT_EXPIRATION } from "#constants/others.js";
import { checkAuth } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/validate.js";
import * as authController from "#modules/auth/auth.controller.js";
import * as authSchema from "#modules/auth/auth.validation.js";


const authRoute = express.Router();

// authRoute.post("/register", validate(authSchema.registerSchema), authController.register);
// authRoute.post("/login", validate(authSchema.loginSchema), authController.login);
// authRoute.post("/logout", authController.logout);

authRoute.get("/google", (req, res, next) => {
  const redirectTo = req.query.redirectTo || "/";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirectTo,
  })(req, res, next);
});

authRoute.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/auth/sign-in`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: COOKIE_MAX_AGE,
    });

    const redirectTo = req.query.state || '/';
    res.redirect(process.env.CLIENT_URL + redirectTo);
  }
);

export default authRoute;