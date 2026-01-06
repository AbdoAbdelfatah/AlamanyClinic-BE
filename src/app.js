import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import doctorProfileRoutes from "./modules/doctorProfile/doctorProfile.routes.js";
import serviceRoutes from "./modules/service/service.routes.js";
import blogRoutes from "./modules/blog/blog.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import { globalErrorHandler } from "./middlewares/globalError.middleware.js";
const app = express();

// CORS configuration
const corsOptions = {
  origin: "https://alamany-dental-clinic.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/doctors", doctorProfileRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/users", userRoutes);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
