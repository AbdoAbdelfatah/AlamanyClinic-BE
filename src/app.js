import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import doctorProfileRoutes from "./modules/doctorProfile/doctorProfile.routes.js";
import { globalErrorHandler } from "./middlewares/globalError.middleware.js";
const app = express();
// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/doctors", doctorProfileRoutes);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
