import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.config.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;

// Initialize database connection (works for both local and Vercel)
const startServer = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    
    // Only start HTTP server locally (not on Vercel)
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Export app for Vercel serverless function
export default app;
