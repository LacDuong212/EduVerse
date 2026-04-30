import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const Order = mongoose.model("Order", new mongoose.Schema({}, { strict: false }));

const COURSE_A = "694d046addf90206a887c535";
const COURSE_B = "694e9d90ed8f2ec45dc0e653";
const STUDENT  = "694d32d7ebe694fc49e59a67";

for (const [name, cid] of [["COURSE_A", COURSE_A], ["COURSE_B", COURSE_B]]) {
  const order = await Order.findOne({
    user: new mongoose.Types.ObjectId(STUDENT),
    "courses.course": new mongoose.Types.ObjectId(cid),
  }).lean();
  console.log(`${name} (${cid}): order =`, order ? `status=${order.status}` : "null");
}

await mongoose.disconnect();
