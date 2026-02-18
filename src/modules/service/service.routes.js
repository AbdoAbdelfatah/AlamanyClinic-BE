import express from "express";
import { serviceController } from "./service.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import {
  handleMulterError,
  uploadBlogCover,
} from "../../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", serviceController.getAllServices);

// Protected routes (Admin only)
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadBlogCover.single("coverImage"),
  handleMulterError,
  serviceController.createService
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadBlogCover.single("coverImage"),
  handleMulterError,
  serviceController.updateService
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  serviceController.deleteService
);

export default router;
