import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },
    coverImage: {
      type: String, // Cloudinary URL or icon name
      default: null,
    },
    category: {
      type: String,
      enum: [
        "General Dentistry",
        "Orthodontics",
        "Periodontics",
        "Endodontics",
        "Prosthodontics",
        "Oral Surgery",
        "Pediatric Dentistry",
        "Cosmetic Dentistry",
        "Implantology",
        "Preventive Care",
      ],
      required: true,
    },
    price: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    duration: {
      type: String, // e.g., "30 minutes", "1-2 hours", "Multiple sessions"
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceSchema.index({ category: 1 });

export default mongoose.models.Service ||
  mongoose.model("Service", serviceSchema);
