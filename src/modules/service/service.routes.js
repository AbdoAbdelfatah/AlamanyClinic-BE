import express from "express";
import { serviceController } from "./service.controller.js";
import {
  protect,
  authorize,
  verifyEmail,
} from "../../middlewares/auth.middleware.js";
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
  verifyEmail,
  authorize("admin"),
  uploadBlogCover.single("coverImage"),
  handleMulterError,
  serviceController.createService
);
router.delete(
  "/:id",
  protect,
  verifyEmail,
  authorize("admin"),
  serviceController.deleteService
);

export default router;
