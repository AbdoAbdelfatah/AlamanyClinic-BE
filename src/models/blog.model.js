import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String, // Cloudinary URL
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Dental Care",
        "Treatments",
        "Cosmetic",
        "Pediatric",
        "News",
        "Other",
      ],
      default: "Other",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
