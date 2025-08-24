import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './configs/mongodb.js';
import authRouter from './routes/authRouters.js';

//Initialize Express
const app = express();

// Connect to MongoDB
await connectDB();

//Middleware
app.use(cors({credentials: true}));
app.use(express.json());
app.use(cookieParser());

// API Endpoints
app.get('/', (req, res) => res.send("API is running"));
app.use('/api/auth', authRouter);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});