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
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    coverImage: {
      type: String, // Cloudinary URL
      default: null,
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
  },
);

// Indexes
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
