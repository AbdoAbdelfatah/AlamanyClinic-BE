import express from "express";
import messageController from "./message.controller.js";
import {
  protect,
  authorize,
  verifyEmail,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes - anyone can send a message
router.post("/", messageController.createMessage);

// Admin only routes - retrieve and delete messages
router.get(
  "/",
  protect,
  verifyEmail,
  authorize("admin"),
  messageController.getAllMessages,
);

router.delete(
  "/:id",
  protect,
  verifyEmail,
  authorize("admin"),
  messageController.deleteMessage,
);

export default router;
