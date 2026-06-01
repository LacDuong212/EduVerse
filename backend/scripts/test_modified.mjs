import '../src/config/database.js';
import Curriculum from '../src/modules/course/curriculum.model.js';
import mongoose from 'mongoose';

const cur = await Curriculum.findOne({});
console.log('courseId:', cur?.courseId);

const result = await Curriculum.updateOne(
  { courseId: cur.courseId },
  { $set: { "sections.$[].lectures.$[lec].aiData": null } },
  { arrayFilters: [{ "lec._id": new mongoose.Types.ObjectId('000000000000000000000001') }] }
);
console.log('matchedCount:', result.matchedCount, 'modifiedCount:', result.modifiedCount);
process.exit(0);
