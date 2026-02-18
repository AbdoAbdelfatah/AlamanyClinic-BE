import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: false,
    },
    picture: {
      type: String,
      default: null,
    },
    specialization: [
      {
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
        ],
      },
    ],
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    certificates: [
      {
        name: {
          type: String,
          required: true,
        },
        issuer: String,
        issueDate: Date,
        fileUrl: String, // Cloudinary URL
      },
    ],
    materials: [
      {
        category: {
          type: String,
          enum: [
            "Implants",
            "Fillings",
            "Crowns",
            "Braces",
            "Whitening",
            "Other",
          ],
        },
        fileUrl: String, // Cloudinary URL
        brand: String,
        description: String,
      },
    ],
    previousCases: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        treatmentType: String,
        beforePhoto: {
          url: String, // Cloudinary URL
          publicId: String, // Cloudinary public ID for deletion
        },
        afterPhoto: {
          url: String, // Cloudinary URL
          publicId: String, // Cloudinary public ID for deletion
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bio: {
      type: String,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },
    officeHours: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        open: String, // e.g., "09:00 AM"
        close: String, // e.g., "05:00 PM"
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// Indexes for better query performance
doctorProfileSchema.index({ user: 1 });
doctorProfileSchema.index({ licenseNumber: 1 });
doctorProfileSchema.index({ specialization: 1 });
doctorProfileSchema.index({ yearsOfExperience: 1 });

// Virtual for getting total number of cases
doctorProfileSchema.virtual("totalCases").get(function () {
  return this.previousCases.length;
});

// Virtual for getting total certificates
doctorProfileSchema.virtual("totalCertificates").get(function () {
  return this.certificates.length;
});

// Ensure virtuals are included in JSON output
doctorProfileSchema.set("toJSON", { virtuals: true });
doctorProfileSchema.set("toObject", { virtuals: true });

export default mongoose.models.DoctorProfile ||
  mongoose.model("DoctorProfile", doctorProfileSchema);
