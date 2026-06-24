import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './configs/mongodb.js';

import accountRoute from './routes/accountRoutes.js';
import authRoute from './routes/authRoutes.js';
import courseRoute from './routes/courseRoutes.js';
import categoryRoute from './routes/categoryRoutes.js';
import dashboardRoute from './routes/dashboardRoutes.js';
import earningRoute from './routes/earningRoutes.js';
import instructorRoute from './routes/instructorRoutes.js';
import studentRoute from './routes/studentRoutes.js';
import couponRoute from './routes/couponRoutes.js';
import videoRoute from './routes/videoRoutes.js';
import payoutRoute from './routes/payoutRoutes.js';
import auditLogRoute from './routes/auditLogRoutes.js';
import certificateRoute from './routes/certificateRoutes.js';


//Initialize Express
const app = express();

// Connect to MongoDB
await connectDB();

const allowedOrigins = [
  'http://localhost:5172',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
];

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

// API Endpoints
app.get('/', (req, res) => res.send("EDV-ADM API is running"));
app.use('/api/account', accountRoute);
app.use('/api/auth', authRoute);
app.use('/api/courses', courseRoute);
app.use('/api/category', categoryRoute)
app.use('/api/dashboard', dashboardRoute);
app.use('/api/earnings', earningRoute);
app.use('/api/instructors', instructorRoute);
app.use('/api/students', studentRoute);
app.use('/api/coupons', couponRoute);
app.use('/api/videos', videoRoute);
app.use('/api/admin/payouts', payoutRoute);
app.use('/api/admin/audit-logs', auditLogRoute);
app.use('/api/admin/certificates', certificateRoute);

// Port
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});