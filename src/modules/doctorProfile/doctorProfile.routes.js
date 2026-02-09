import express from "express";
import doctorProfileController from "./doctorProfile.controller.js";
import {
  uploadProfilePicture,
  uploadCertificate,
  uploadCasePhotos,
  handleMulterError,
} from "../../middlewares/upload.middleware.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Middleware imports (adjust paths according to your project structure)
// import { authenticate } from "../middlewares/auth.middleware.js";
// import { isDoctor, isAdmin } from "../middlewares/role.middleware.js";

// Public routes - accessible to everyone
router.get("/", doctorProfileController.getAllDoctorProfiles);

router.get("/:id", doctorProfileController.getDoctorProfileById);

router.get("/:id/statistics", doctorProfileController.getDoctorStatistics);

// Protected routes - require admin authentication
// Doctor profile creation (admin only)
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadProfilePicture.single("picture"),
  handleMulterError,
  doctorProfileController.createDoctorProfile,
);

// Update doctor profile by ID (admin only)
router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadProfilePicture.single("picture"),
  handleMulterError,
  doctorProfileController.updateDoctorProfile,
);

// Delete doctor profile (admin only)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  doctorProfileController.deleteDoctorProfile,
);

// Certificate management (admin only)
router.post(
  "/:id/certificates",
  protect,
  authorize("admin"),
  uploadCertificate.single("certificate"),
  handleMulterError,
  doctorProfileController.addCertificate,
);

router.delete(
  "/:id/certificates/:certificateId",
  protect,
  authorize("admin"),
  doctorProfileController.removeCertificate,
);

// Material management (admin only)
router.post(
  "/:id/materials",
  protect,
  authorize("admin"),
  uploadCertificate.single("material"),
  handleMulterError,
  doctorProfileController.addMaterial,
);

router.delete(
  "/:id/materials/:materialId",
  protect,
  authorize("admin"),
  doctorProfileController.removeMaterial,
);

// Previous cases management (admin only)
router.post(
  "/:id/cases",
  protect,
  authorize("admin"),
  uploadCasePhotos.fields([
    { name: "beforePhoto", maxCount: 1 },
    { name: "afterPhoto", maxCount: 1 },
  ]),
  handleMulterError,
  doctorProfileController.addPreviousCase,
);

router.delete(
  "/:id/cases/:caseId",
  protect,
  authorize("admin"),
  doctorProfileController.removePreviousCase,
);

// Office hours management (admin only)
router.post(
  "/:id/office-hours",
  protect,
  authorize("admin"),
  doctorProfileController.addOfficeHours,
);

router.delete(
  "/:id/office-hours/:officeHoursId",
  protect,
  authorize("admin"),
  doctorProfileController.removeOfficeHours,
);

export default router;
