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
    section: { type: String, required: true },
    lectures: [{
      title: { type: String, required: true },
      videoUrl: String,       // #TODO: file, img, doc
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
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

courseSchema.index({ title: "text", category: 1, subCategory: 1, tags: 1 });

courseSchema.pre('save', function (next) {
  if (this.isModified('curriculum') && this.curriculum?.length) {
    const allLectures = this.curriculum.flatMap(s => s.lectures || []);
    this.lecturesCount = allLectures.length;
    this.duration = allLectures.reduce((sum, lec) => sum + (lec.duration || 0), 0);
  }
  next();
});

export default mongoose.model("Course", courseSchema);
