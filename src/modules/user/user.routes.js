import express from "express";
import userController from "./user.controller.js";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", asyncHandler(userController.getAllUsers));
router.put("/:userId", protect, asyncHandler(userController.updateUser));
router.delete(
  "/:userId",
  protect,
  authorize("admin"),
  asyncHandler(userController.softDeleteUser)
);

export default router;
