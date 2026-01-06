import express from "express";
import reviewController from "./review.controller.js";
import {
  protect,
  authorize,
  verifyEmail,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes - accessible to everyone
// Get reviews for a specific doctor
router.get("/doctor/:id", reviewController.getReviewsByDoctor);

// Protected routes - require authentication
// Create a new review (authenticated users)
router.post("/", protect, verifyEmail, reviewController.createReview);

// Admin only routes
// Delete a review (admin only)
router.delete(
  "/:reviewId",
  protect,
  verifyEmail,
  authorize("admin"),
  reviewController.deleteReview
);

export default router;
