import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  category: { type: String },
  subCategory: { type: String },
  language: { type: String },
  instructor: {
    name: { type: String },
    avatar: { type: String }
  },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
  duration: Number,
  lecturesCount: Number,
  sections: [
    {
      title: String,
      lectures: [
        {
          title: String,
          videoUrl: String,
          duration: Number
        }
      ]
    }
  ],
  studentsEnrolled: { type: Number, default: 0 },
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, min: 0, default: 0 }
  },
  thumbnail: String,
  previewVideo: String,
  tags: [String],
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Course", courseSchema);