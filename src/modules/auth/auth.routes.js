import express from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import {
  login,
  verifyUserEmailController,
  refreshAccessToken,
  logout,
  getCurrentUser,
  register,
  registerWithGmailController,
  loginWithGmailController,
} from "./auth.controller.js";
import { protect, verifyEmail } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/verify-email", asyncHandler(verifyUserEmailController));
router.post("/register-gmail", asyncHandler(registerWithGmailController));
router.post("/login-gmail", asyncHandler(loginWithGmailController));
router.post("/refresh", asyncHandler(refreshAccessToken));

// Protected routes
router.post("/logout", protect, asyncHandler(logout));
router.get("/me", protect, verifyEmail, asyncHandler(getCurrentUser));

export default router;
