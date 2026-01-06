import Review from "../../models/review.model.js";
import DoctorProfile from "../../models/doctorProfile.model.js";
import mongoose from "mongoose";

class ReviewService {
  // Create a new review
  async createReview(patientId, reviewData) {
    try {
      const { doctorId, rating, comment } = reviewData;

      // Validate required fields first
      if (!doctorId || !rating || !comment) {
        throw new Error("Doctor ID, rating, and comment are required");
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Validate comment length
      if (comment.trim().length === 0) {
        throw new Error("Comment cannot be empty");
      }

      if (comment.length > 500) {
        throw new Error("Comment cannot exceed 500 characters");
      }

      // Check if doctor profile exists
      const doctorProfile = await DoctorProfile.findById(doctorId);
      if (!doctorProfile) {
        throw new Error("Doctor profile not found");
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        doctorProfile: doctorId,
        patient: patientId,
      });
      if (existingReview) {
        throw new Error(
          "You have already reviewed this doctor. You can only submit one review per doctor"
        );
      }

      // Create new review
      const review = new Review({
        doctorProfile: doctorId,
        patient: patientId,
        rating,
        comment: comment.trim(),
      });

      await review.save();

      // Populate and return the review
      // const populatedReview = await Review.findById(review._id)
      //   .populate(
      //     "doctorProfile",
      //     "yearsOfExperience picture licenseNumber user"
      //   )
      //   .populate("patient", "firstName lastName email phone");

      return review;
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByDoctor(doctorId, options = {}) {
    // Validate doctorId format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      const error = new Error("Invalid doctor ID format");
      error.statusCode = 400;
      throw error;
    }

    // Parse and validate pagination parameters
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10)); // Max 100 per page
    const skip = (page - 1) * limit;

    // Check if doctor exists
    const doctorExists = await DoctorProfile.exists({ _id: doctorId });
    if (!doctorExists) {
      const error = new Error("Doctor profile not found");
      error.statusCode = 404;
      throw error;
    }

    // Run count and find queries in parallel for better performance
    const [total, reviews] = await Promise.all([
      Review.countDocuments({ doctorProfile: doctorId }),
      Review.find({ doctorProfile: doctorId })
        .populate("patient", "firstName lastName email phone")
        .populate(
          "doctorProfile",
          "yearsOfExperience picture licenseNumber user"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Returns plain JS objects for better performance
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // Delete a review (admin only)
  async deleteReview(reviewId) {
    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        throw new Error("Review not found");
      }

      await Review.findByIdAndDelete(reviewId);

      return {
        success: true,
        message: "Review deleted successfully",
        review,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ReviewService();
