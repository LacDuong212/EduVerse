import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './configs/mongodb.js';
import authRouter from './routes/authRouters.js';
import userRouter from './routes/userRouters.js';

//Initialize Express
const app = express();

// Connect to MongoDB
await connectDB();

const allowedOrigins = ['http://localhost:5173'];

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

// API Endpoints
app.get('/', (req, res) => res.send("API is running"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});