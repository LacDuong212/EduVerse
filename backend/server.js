import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { startAllTasks } from './utils/scheduler.js';

import connectDB from './configs/mongodb.js';
import authRoute from './routes/authRoutes.js';
import userRoute from './routes/userRoutes.js';
import courseRoute from './routes/courseRoutes.js';
import cartRoute from './routes/cartRoutes.js';
import orderRoute from './routes/orderRoutes.js';
import reviewRoute from './routes/reviewRoutes.js';
import chatbotRoute from './routes/chatbotRoutes.js';

//Initialize Express
const app = express();

// Connect to MongoDB
await connectDB();

// Start scheduled tasks
startAllTasks();

const allowedOrigins = ['http://localhost:5173'];

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

// API Endpoints
app.get('/', (req, res) => res.send("API is running"));
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/courses', courseRoute);
app.use('/api/cart', cartRoute);
app.use('/api/orders', orderRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/chatbot', chatbotRoute);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});