import Review from "../../models/review.model.js";
import DoctorProfile from "../../models/doctorProfile.model.js";

class ReviewService {
  // Create a new review
  async createReview(patientId, reviewData) {
    try {
      const { doctor, rating, comment } = reviewData;

      // Check if doctor profile exists
      const doctorProfile = await DoctorProfile.findById(doctor);
      if (!doctorProfile) {
        throw new Error("Doctor profile not found");
      }

      // Check if review already exists from same patient for same doctor
      const existingReview = await Review.findOne({
        doctor,
        patient: patientId,
      });
      if (existingReview) {
        throw new Error(
          "You have already reviewed this doctor. You can only submit one review per doctor"
        );
      }

      // Create new review
      const review = new Review({
        doctor,
        patient: patientId,
        rating,
        comment,
      });

      await review.save();

      // Populate and return the review
      const populatedReview = await Review.findById(review._id)
        .populate("doctor", "specialization yearsOfExperience")
        .populate("patient", "name email");

      return populatedReview;
    } catch (error) {
      throw error;
    }
  }

  // Get all reviews for a doctor
  async getReviewsByDoctor(doctorId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Check if doctor exists
      const doctor = await DoctorProfile.findById(doctorId);
      if (!doctor) {
        throw new Error("Doctor profile not found");
      }

      const total = await Review.countDocuments({ doctor: doctorId });

      const reviews = await Review.find({ doctor: doctorId })
        .populate("patient", "name email")
        .populate("doctor", "specialization yearsOfExperience")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      return {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      throw error;
    }
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
