import express from "express";
import doctorProfileController from "./doctorProfile.controller.js";
import {
  uploadProfilePicture,
  uploadCertificate,
  uploadCasePhotos,
  handleMulterError,
} from "../../middlewares/upload.middleware.js";
import {
  checkDoctorVerification,
  protect,
  authorize,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Middleware imports (adjust paths according to your project structure)
// import { authenticate } from "../middlewares/auth.middleware.js";
// import { isDoctor, isAdmin } from "../middlewares/role.middleware.js";

// Public routes - accessible to everyone
router.get("/", doctorProfileController.getAllDoctorProfiles);

router.get("/:id", doctorProfileController.getDoctorProfileById);

router.get("/:id/statistics", doctorProfileController.getDoctorStatistics);

// Protected routes - require authentication
// Uncomment the middleware below when authentication is implemented
// router.use(authenticate); // Apply authentication to all routes below

// Doctor-specific routes - create and manage own profile
router.post(
  "/",
  protect,
  checkDoctorVerification,
  uploadProfilePicture.single("picture"), // Upload profile picture
  handleMulterError,
  doctorProfileController.createDoctorProfile
);

router.get(
  "/me/profile",
  protect,
  checkDoctorVerification,
  doctorProfileController.getMyProfile
);

router.put(
  "/me/profile",
  protect,
  checkDoctorVerification,
  uploadProfilePicture.single("picture"), // Upload profile picture
  handleMulterError,
  doctorProfileController.updateMyProfile
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  doctorProfileController.deleteDoctorProfile
);

// Certificate management
router.post(
  "/:id/certificates",
  protect,
  checkDoctorVerification,
  uploadCertificate.single("certificate"), // Upload certificate file
  handleMulterError,
  doctorProfileController.addCertificate
);

router.delete(
  "/:id/certificates/:certificateId",
  protect,
  checkDoctorVerification,
  doctorProfileController.removeCertificate
);

// Material management
router.post(
  "/:id/materials",
  protect,
  checkDoctorVerification,
  doctorProfileController.addMaterial
);

router.delete(
  "/:id/materials/:materialId",
  protect,
  checkDoctorVerification,
  doctorProfileController.removeMaterial
);

// Previous cases management
router.post(
  "/:id/cases",
  protect,
  checkDoctorVerification,
  uploadCasePhotos.fields([
    { name: "beforePhoto", maxCount: 1 },
    { name: "afterPhoto", maxCount: 1 },
  ]), // Upload before and after photos
  handleMulterError,
  doctorProfileController.addPreviousCase
);

router.delete(
  "/:id/cases/:caseId",
  protect,
  checkDoctorVerification,
  doctorProfileController.removePreviousCase
);

export default router;
