import express from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import {
  login,
  verifyEmail,
  refreshAccessToken,
  logout,
  getCurrentUser,
  register,
} from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/verify-email", asyncHandler(verifyEmail));
//router.post("/google", asyncHandler(googleAuth));
router.post("/refresh", asyncHandler(refreshAccessToken));

// Protected routes
router.post("/logout", protect, asyncHandler(logout));
router.get("/me", protect, asyncHandler(getCurrentUser));

export default router;
