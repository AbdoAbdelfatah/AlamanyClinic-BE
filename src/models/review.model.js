import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for better query performance
reviewSchema.index({ doctor: 1 });
reviewSchema.index({ patient: 1 });
reviewSchema.index({ rating: 1 });

// Prevent duplicate reviews - one review per patient per doctor
reviewSchema.index({ doctor: 1, patient: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
