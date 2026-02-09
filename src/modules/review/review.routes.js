import express from "express";
import reviewController from "./review.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes - accessible to everyone
// Get reviews for a specific doctor
router.get("/doctor/:id", reviewController.getReviewsByDoctor);

// Public routes - anyone can create a review
router.post("/", reviewController.createReview);

// Admin only routes
// Delete a review (admin only)
router.delete(
  "/:reviewId",
  protect,
  authorize("admin"),
  reviewController.deleteReview,
);

export default router;
