import express from "express";
import blogController from "./blog.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import {
  handleMulterError,
  uploadBlogCover,
  uploadBlogMedia,
} from "../../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

// Protected routes (Admin only for create and update)
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadBlogCover.single("coverImage"),
  uploadBlogMedia.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  handleMulterError,
  blogController.createBlog,
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadBlogCover.single("coverImage"),
  uploadBlogMedia.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  handleMulterError,
  blogController.updateBlog,
);

// Protected routes (Admin only for delete)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  blogController.deleteBlog,
);

export default router;
