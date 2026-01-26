import express from "express";
import appointmentController from "./appointment.controller.js";
import {
  protect,
  authorize,
  verifyEmail,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes - anyone can book an appointment
// Get all doctors for selection
router.get("/doctors/list", appointmentController.getAllDoctors);

// Get specific doctor's office hours
router.get(
  "/doctors/:doctorId/office-hours",
  appointmentController.getDoctorOfficeHours,
);

// Create appointment
router.post("/", appointmentController.createAppointment);

// Admin only routes
// Get all appointments
router.get(
  "/",
  protect,
  verifyEmail,
  authorize("admin"),
  appointmentController.getAllAppointments,
);

// Get appointment by ID
router.get(
  "/:id",
  protect,
  verifyEmail,
  authorize("admin"),
  appointmentController.getAppointmentById,
);

// Update appointment status
router.put(
  "/:id/status",
  protect,
  verifyEmail,
  authorize("admin"),
  appointmentController.updateAppointmentStatus,
);

// Delete appointment
router.delete(
  "/:id",
  protect,
  verifyEmail,
  authorize("admin"),
  appointmentController.deleteAppointment,
);

export default router;
