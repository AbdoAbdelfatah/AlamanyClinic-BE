import reviewService from "./review.service.js";

class ReviewController {
  // Create a new review
  async createReview(req, res) {
    try {
      const patientId = req.user.id; // From auth middleware
      const reviewData = req.body;

      const review = await reviewService.createReview(patientId, reviewData);

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create review",
      });
    }
  }

  // Get all reviews for a doctor
  async getReviewsByDoctor(req, res) {
    try {
      const { id: doctorId } = req.params;
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      };

      const result = await reviewService.getReviewsByDoctor(doctorId, options);

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to fetch reviews",
      });
    }
  }

  // Delete a review (admin only)
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;

      const result = await reviewService.deleteReview(reviewId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.review,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to delete review",
      });
    }
  }
}

export default new ReviewController();
