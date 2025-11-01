import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  image: String,
  category: String,
  subCategory: String,
  language: String,
  
  instructor: {
    ref: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    avatar: String
  },

  level: { type: String, enum: ["All", "Beginner", "Intermediate", "Advanced"] },
  duration: Number,
  lecturesCount: Number,

  curriculum: [{ 
    section: String,
    lectures: [{
      title: String,
      videoUrl: String,
      duration: Number,
      isFree: { type: Boolean, default: false }
    }]
  }],

  studentsEnrolled: { type: Number, default: 0 },

  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 }
  },

  thumbnail: String,
  previewVideo: String,
  tags: [String],

  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0, default: null },

  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ["Rejected", "Pending", "Live"], default: "Pending" },
}, {
  timestamps: true
});

courseSchema.index({ title: "text", category: 1, subCategory: 1, tags: 1 });

export default mongoose.model("Course", courseSchema);
