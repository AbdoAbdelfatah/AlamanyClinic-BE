import express from "express";
import blogController from "./blog.controller.js";
import {
  protect,
  authorize,
  checkDoctorVerification,
  verifyEmail,
} from "../../middlewares/auth.middleware.js";
import {
  handleMulterError,
  uploadBlogCover,
} from "../../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

// Protected routes (Admin only for create and update)
router.post(
  "/",
  protect,
  verifyEmail,
  authorize("admin"),
  uploadBlogCover.single("coverImage"),
  handleMulterError,
  blogController.createBlog,
);

router.put(
  "/:id",
  protect,
  verifyEmail,
  authorize("admin"),
  uploadBlogCover.single("coverImage"),
  handleMulterError,
  blogController.updateBlog,
);

// Protected routes (Admin only for delete)
router.delete(
  "/:id",
  protect,
  verifyEmail,
  authorize("admin"),
  blogController.deleteBlog,
);

export default router;
