import reviewService from "./review.service.js";

class ReviewController {
  // Create a new review (public - anyone can review)
  async createReview(req, res) {
    try {
      const reviewData = req.body;

      const review = await reviewService.createReview(reviewData);

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

  async getReviewsByDoctor(req, res) {
    try {
      const { id: doctorId } = req.params;

      // Validate query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: "Page number must be greater than 0",
        });
      }

      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100",
        });
      }

      const result = await reviewService.getReviewsByDoctor(doctorId, {
        page,
        limit,
      });

      return res.status(200).json({
        success: true,
        data: {
          reviews: result.reviews,
          ratingData: result.ratingData,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      // Handle specific error types with appropriate status codes
      const statusCode = error.statusCode || 500;
      const message = error.message || "Failed to fetch reviews";

      return res.status(statusCode).json({
        success: false,
        message,
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
