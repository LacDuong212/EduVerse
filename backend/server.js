import 'dotenv/config';
import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { startAllTasks } from './utils/scheduler.js';
import "./services/CronTasks.js";

import connectDB from './configs/mongodb.js';
import authRoute from './routes/authRoutes.js';
import cartRoute from './routes/cartRoutes.js';
import categoryRoute from './routes/categoryRoutes.js';
import chatbotRoute from './modules/chatbot/chatbotRoutes.js';
import courseRoute from './routes/courseRoutes.js';
import instructorRoute from './routes/instructorRoutes.js';
import orderRoute from './routes/orderRoutes.js';
import paymentRoute from './routes/paymentRoutes.js';
import reviewRoute from './routes/reviewRoutes.js';
import studentRoute from "./routes/studentRoute.js";
import userRoute from './routes/userRoutes.js';
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import quizRoute from './routes/quizRoutes.js';

import session from 'express-session';
import passport from 'passport';
import configurePassport from './configs/passport.js';

import { initSocket } from "./configs/socket.js";
import internalRoutes from "./routes/internalRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


//Initialize Express
const app = express();

const server = http.createServer(app);

app.set('trust proxy', 1);

// Connect to MongoDB
await connectDB();

// Start scheduled tasks
startAllTasks();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
];

//Middleware
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

// app.use(cors({origin: allowedOrigins, credentials: true}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

initSocket(server);

// API Endpoints
app.get('/', (req, res) => res.send("API is running"));
app.use('/api/auth', authRoute);
app.use("/api/student", studentRoute);
app.use('/api/user', userRoute);
app.use('/api', instructorRoute);
app.use('/api/courses', courseRoute);
app.use('/api/category', categoryRoute);
app.use('/api/cart', cartRoute);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use('/api/orders', orderRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/chatbot', chatbotRoute);

app.use("/api/internal", internalRoutes);
app.use("/api/notifications", notificationRoutes)
app.use("/api/quiz", quizRoute);

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});