import express from "express";
import blogController from "./blog.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import {
  handleMulterError,
  uploadBlogMedia,
  multerErrorWrapper,
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
  multerErrorWrapper(
    uploadBlogMedia.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ])
  ),
  blogController.createBlog,
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  multerErrorWrapper(
    uploadBlogMedia.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ])
  ),
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
