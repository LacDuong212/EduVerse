import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import configurePassport from "#config/passport.js";
import { COOKIE_MAX_AGE } from "#constants/others.js";
import errorMiddleware from "#middlewares/error.middleware.js";
import apiRouter from "#modules/index.js";

const app = express();

// request logger (for development)
if (process.env.NODE_ENV === "development") {
  const { requestLogger } = await import("#middlewares/requestLogger.middleware.js");
  app.use(requestLogger);
}

// basic security & parsing
app.set("trust proxy", 1);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());

// CORS config
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

// session & auth
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: COOKIE_MAX_AGE
  }
}));

configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// routes
app.get("/", (req, res) => res.send("EduVerse2 API is running"));
app.use("/api", apiRouter);

// global error handler (MUST BE LAST)
app.use(errorMiddleware);

export default app;