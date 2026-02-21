import express from "express";
import doctorProfileController from "./doctorProfile.controller.js";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import {
  uploadProfilePicture,
  uploadCertificate,
  uploadMaterial,
  uploadCasePhotos,
  handleMulterError,
} from "../../middlewares/upload.middleware.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ==================== Public Routes ====================
// Get all doctor profiles with filters and pagination
router.get("/", doctorProfileController.getAllDoctorProfiles);

// Get doctor profile by ID
router.get("/:id", doctorProfileController.getDoctorProfileById);

// Get doctor statistics
router.get("/:id/statistics", doctorProfileController.getDoctorStatistics);

// ==================== Protected Routes - Admin Only ====================

// Create new doctor profile with all files (picture, certificate, materials, case photos)
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadCasePhotos.fields([
    { name: "picture", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
    { name: "material", maxCount: 1 },
    { name: "beforePhoto", maxCount: 1 },
    { name: "afterPhoto", maxCount: 1 },
  ]),
  handleMulterError,
  doctorProfileController.createDoctorProfile,
);

// Update doctor profile by ID
router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadProfilePicture.single("picture"),
  handleMulterError,
  doctorProfileController.updateDoctorProfile,
);

// Delete doctor profile
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  doctorProfileController.deleteDoctorProfile,
);

// ==================== Certificate Management Routes ====================

// Add certificate
router.post(
  "/:id/certificates",
  protect,
  authorize("admin"),
  uploadCertificate.single("file"),
  handleMulterError,
  doctorProfileController.addCertificate,
);

// Remove certificate
router.delete(
  "/:id/certificates/:certificateId",
  protect,
  authorize("admin"),
  doctorProfileController.removeCertificate,
);

// ==================== Material Management Routes ====================

// Add material
router.post(
  "/:id/materials",
  protect,
  authorize("admin"),
  uploadMaterial.single("file"),
  handleMulterError,
  doctorProfileController.addMaterial,
);

// Remove material
router.delete(
  "/:id/materials/:materialId",
  protect,
  authorize("admin"),
  doctorProfileController.removeMaterial,
);

// ==================== Previous Cases Management Routes ====================

// Add previous case (with before/after photos)
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

// Remove previous case
router.delete(
  "/:id/cases/:caseId",
  protect,
  authorize("admin"),
  doctorProfileController.removePreviousCase,
);

// ==================== Office Hours Management Routes ====================

// Add office hours
router.post(
  "/:id/office-hours",
  protect,
  authorize("admin"),
  doctorProfileController.addOfficeHours,
);

// Remove office hours
router.delete(
  "/:id/office-hours/:officeHoursId",
  protect,
  authorize("admin"),
  doctorProfileController.removeOfficeHours,
);

export default router;
