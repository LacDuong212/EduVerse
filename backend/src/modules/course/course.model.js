import mongoose from "mongoose";

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

  level: { type: String, enum: ["all", "beginner", "intermediate", "advanced"] },
  duration: Number,
  durationUnit: { type: String, enum: ["hour", "minute", "second", "day"], default: "second" },
  lecturesCount: Number,

  curriculum: [{
    section: { type: String, required: true },
    lectures: [{
      title: { type: String, required: true },
      videoUrl: String,
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
          explanation: String,
          topic: { type: String, default: "General Knowledge" }
        }],
        status: {
          type: String,
          enum: ["none", "processing", "completed", "failed"],
          default: "none"
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

  status: { type: String, enum: ["draft", "pending", "live", "blocked", "rejected"], default: "draft" },

  isPrivate: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

courseSchema.index({ title: "text", category: 1, subCategory: 1, tags: 1 });

// #TODO: PLEASE MOVE TO SERVICE
// courseSchema.pre("save", async function (next) {
//   if (!this.isModified("instructor.ref")) return next();

//   const user = await User.findById(this.instructor.ref).select("name pfpImg");
//   if (user) {
//     this.instructor.name = user.name;
//     this.instructor.avatar = user.pfpImg;
//   }
//   next();
// });

export default mongoose.model("Course", courseSchema);