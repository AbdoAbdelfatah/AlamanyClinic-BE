import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password required only if not using Google OAuth
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
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
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: [true, "User role is required"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationStatus: {
      // For doctors' profile verification from admin
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    refreshToken: {
      type: String,
      select: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
