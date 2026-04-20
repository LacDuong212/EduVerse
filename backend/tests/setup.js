import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../src/config/database.js";

// Connect to DB once before all test suites
beforeAll(async () => {
  await connectDB();
}, 20000);

// Disconnect after all test suites
afterAll(async () => {
  await mongoose.connection.close();
});

