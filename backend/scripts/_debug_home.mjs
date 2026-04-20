import 'dotenv/config';
import connectDB from '../src/config/database.js';
import Course from '../src/modules/course/course.model.js';
await connectDB();
try {
  const r = await Course.aggregate([
    { $match: {isDeleted:false,isPrivate:false,discountPrice:{$ne:null}} },
    { $addFields:{discountAmount:{$subtract:['$price','$discountPrice']}} },
    { $sort:{discountAmount:-1} },
    { $limit:4 }
  ]);
  console.log('Agg OK:', r.length, r.map(c=>c.title));
  await Course.populate(r, [{path:'category',select:'name slug'},{path:'instructor',select:'name pfpImg'}]);
  console.log('Populate OK');
} catch(e) { console.error('Error:', e.message); }
process.exit(0);
