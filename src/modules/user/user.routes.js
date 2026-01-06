import userController from "./user.controller.js";
import express from "express";
import {
  protect,
  verifyEmail,
  authorize,
} from "../../middlewares/auth.middleware.js";
const router = express.Router();

// Public route to get user profile by ID
router.get("/", userController.getAllUsers);
// Protected route to update user profile
router.put("/:userId", protect, verifyEmail, userController.updateUser);
router.delete(
  "/:userId",
  protect,
  verifyEmail,
  authorize("admin"),
  userController.softDeleteUser
);
export default router;
