import express from "express";
import appointmentController from "./appointment.controller.js";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/doctors/list", asyncHandler(appointmentController.getAllDoctors));
router.get(
  "/doctors/:doctorId/office-hours",
  asyncHandler(appointmentController.getDoctorOfficeHours),
);
router.post("/", asyncHandler(appointmentController.createAppointment));

router.get(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(appointmentController.getAllAppointments),
);
router.get(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(appointmentController.getAppointmentById),
);
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  asyncHandler(appointmentController.updateAppointmentStatus),
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(appointmentController.deleteAppointment),
);

export default router;
