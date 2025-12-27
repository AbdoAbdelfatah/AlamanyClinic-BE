import express from "express";
import blogController from "./blog.controller.js";
import {
  protect,
  authorize,
  checkDoctorVerification,
  verifyEmail,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", blogController.getAllBlogs);

// Protected routes (Doctor only for create and update)
router.post(
  "/",
  protect,
  verifyEmail,
  checkDoctorVerification,
  blogController.createBlog
);

// Protected routes (Admin only for delete)
router.delete(
  "/:id",
  protect,
  verifyEmail,
  authorize("Admin"),
  blogController.deleteBlog
);

export default router;
