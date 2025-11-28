import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true
  },
  
  slug: { 
    type: String, 
    lowercase: true, 
    index: true 
  }
}, {
  timestamps: true
});

categorySchema.pre("save", function(next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Category", categorySchema);