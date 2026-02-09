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
      type: String, // Cloudinary URL (multer + Cloudinary)
      default: null,
    },
    images: [
      {
        type: String, // Cloudinary URLs for blog content images
      },
    ],
    videos: [
      {
        type: String, // Cloudinary URLs for blog content videos
      },
    ],
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

blogSchema.index({ category: 1 });

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
