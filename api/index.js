import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import doctorProfileRouter from "./routes/doctorProfile.routes.js";
// ... other imports

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/doctor-profiles", doctorProfileRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ✅ Connect to DB once (not inside listen)
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return; // reuse existing connection
  await mongoose.connect(process.env.MONGODB_URI);
};

connectDB().catch(console.error);

// ✅ Export app instead of calling app.listen()
export default app; // for ES Modules
// module.exports = app;      // for CommonJS
