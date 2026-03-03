import mongoose from "mongoose";
import { normalizeId } from "#utils/mongoose-plugins.js";

mongoose.plugin(normalizeId);

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  })

  await mongoose.connect(`${process.env.MONGODB_URI}/eduverse2`);
}

export default connectDB;