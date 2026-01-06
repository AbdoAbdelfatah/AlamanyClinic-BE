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
  verifyEmail,
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
  verifyEmail,
  checkDoctorVerification,
  uploadProfilePicture.single("picture"), // Upload profile picture
  handleMulterError,
  doctorProfileController.createDoctorProfile
);

router.get(
  "/me/profile",
  protect,
  verifyEmail,
  checkDoctorVerification,
  doctorProfileController.getMyProfile
);

router.put(
  "/me/profile",
  protect,
  verifyEmail,
  checkDoctorVerification,
  uploadProfilePicture.single("picture"), // Upload profile picture
  handleMulterError,
  doctorProfileController.updateMyProfile
);

router.delete(
  "/:id",
  protect,
  verifyEmail,
  authorize("admin"),
  doctorProfileController.deleteDoctorProfile
);

// Certificate management
router.post(
  "/:id/certificates",
  protect,
  verifyEmail,
  checkDoctorVerification,
  uploadCertificate.single("certificate"), // Upload certificate file
  handleMulterError,
  doctorProfileController.addCertificate
);

router.delete(
  "/:id/certificates/:certificateId",
  protect,
  verifyEmail,
  checkDoctorVerification,
  doctorProfileController.removeCertificate
);

// Material management
router.post(
  "/:id/materials",
  protect,
  verifyEmail,
  checkDoctorVerification,
  uploadCertificate.single("material"), // Upload material file
  handleMulterError,
  doctorProfileController.addMaterial
);

router.delete(
  "/:id/materials/:materialId",
  protect,
  verifyEmail,
  checkDoctorVerification,
  doctorProfileController.removeMaterial
);

// Previous cases management
router.post(
  "/:id/cases",
  protect,
  verifyEmail,
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
  verifyEmail,
  checkDoctorVerification,
  doctorProfileController.removePreviousCase
);

export default router;
