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
    bio: { type: String },
    avatar: { type: String }
  },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
  duration: Number, // giờ học
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
  requirements: [String],
  outcomes: [String],
  studentsEnrolled: { type: Number, default: 0 },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  thumbnail: String,
  previewVideo: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Course", courseSchema);
