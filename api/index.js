import dotenv from "dotenv";
dotenv.config();
import app from "../src/app.js";
import { connectDB } from "../src/config/db.config.js";
import mongoose from "mongoose";

const handler = async (req, res) => {
  try {
    // Connect to DB if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default handler;
