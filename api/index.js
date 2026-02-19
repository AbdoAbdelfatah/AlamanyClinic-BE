import dotenv from "dotenv";
dotenv.config();
import app from "../src/app.js";
import { connectDB } from "../src/config/db.config.js";
import mongoose from "mongoose";

const allowedOrigins = [
  "https://alamany-dental-clinic.vercel.app",
  "https://alamanyclinic.vercel.app",
  "http://localhost:4200",
  "http://localhost:3000",
];

export default async (req, res) => {
  try {
    const origin = req.headers.origin;

    // Set CORS headers immediately
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept",
    );

    // Always set origin header
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]);
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    // Connect to DB if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Let Express handle the request
    app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    const origin = req.headers.origin;

    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]);
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
