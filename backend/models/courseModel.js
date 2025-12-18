import mongoose from "mongoose";
import User from "./userModel.js";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  image: String,

  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category",
    required: true 
  },

  subCategory: String,
  language: String,

  instructor: {
    ref: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    avatar: String
  },

  level: { type: String, enum: ["All", "Beginner", "Intermediate", "Advanced"] },
  duration: Number,
  durationUnit: { type: String, enum: ["hour", "minute", "second", "day"], default: "hour" },
  lecturesCount: Number,

  curriculum: [{
    section: { type: String, required: true },
    lectures: [{
      title: { type: String, required: true },
      videoUrl: String,       // #TODO: file, img, doc
      duration: Number,
      isFree: { type: Boolean, default: false },
      aiData: {
        summary: String,
        lessonNotes: {
          keyConcepts: [{
             term: String,
             definition: String
          }],
          mainPoints: [String], 
          practicalTips: [String] 
        },
        quizzes: [{
          question: String,
          options: [String],
          correctAnswer: String,
          explanation: String
        }],
        status: {
          type: String,
          enum: ['None', 'Processing', 'Completed', 'Failed'],
          default: 'None'
        }
      }
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
  enableDiscount: { type: Boolean, default: false },

  status: { type: String, enum: ["Rejected", "Pending", "Live", "Blocked"], default: "Pending" },

  isPrivate: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

courseSchema.index({ title: "text", category: 1, subCategory: 1, tags: 1 });

courseSchema.pre("save", async function (next) {
  if (!this.isModified("instructor.ref")) return next();

  const user = await User.findById(this.instructor.ref).select("name pfpImg");
  if (user) {
    this.instructor.name = user.name;
    this.instructor.avatar = user.pfpImg;
  }
  next();
});

export default mongoose.model("Course", courseSchema);
