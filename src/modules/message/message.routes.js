import express from "express";
import messageController from "./message.controller.js";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", asyncHandler(messageController.createMessage));
router.get(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(messageController.getAllMessages),
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(messageController.deleteMessage),
);

export default router;
