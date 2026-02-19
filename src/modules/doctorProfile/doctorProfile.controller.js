import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import doctorProfileService from "./doctorProfile.service.js";

/**
 * Doctor Profile Controller
 * Handles all request/response logic for doctor profile operations
 * Uses asyncHandler middleware for error handling
 */

class DoctorProfileController {
  /**
   * Parse JSON string safely
   * @private
   */
  #parseJSON(value, fallback = []) {
    if (!value) return fallback;
    try {
      return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
      console.error("JSON parse error:", value);
      return fallback;
    }
  }

  /**
   * Validate required fields
   * @private
   */
  #validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      throw new ErrorClass(
        "Missing Required Fields",
        400,
        `The following fields are required: ${missingFields.join(", ")}`,
        "DoctorProfileController#validateRequiredFields",
      );
    }
  }

  /**
   * Parse and prepare doctor profile data from request body
   * @private
   */
  #prepareDoctorProfileData(body) {
    return {
      email: body.email?.toLowerCase().trim(),
      firstName: body.firstName?.trim(),
      lastName: body.lastName?.trim(),
      phone: body.phone?.trim(),
      bio: body.bio?.trim(),
      licenseNumber: body.licenseNumber?.trim(),
      yearsOfExperience: parseInt(body.yearsOfExperience) || 0,
      specialization: this.#parseJSON(body.specialization, []),
      officeHours: this.#parseJSON(body.officeHours, []),
      certificates: this.#parseJSON(body.certificates, []),
      materials: this.#parseJSON(body.materials, []),
      previousCases: this.#parseJSON(body.previousCases, []),
    };
  }

  /**
   * Create a new doctor profile with optional certificate, materials, and case photos
   * POST /api/doctor-profiles
   * Files: picture, certificate, material, beforePhoto, afterPhoto (all optional)
   */
  createDoctorProfile = asyncHandler(async (req, res) => {
    // Validate required fields
    this.#validateRequiredFields(req.body, [
      "email",
      "firstName",
      "lastName",
      "licenseNumber",
    ]);

    // Prepare profile data
    const profileData = this.#prepareDoctorProfileData(req.body);

    // Add profile picture if uploaded
    if (req.files?.picture?.[0]) {
      profileData.picture = req.files.picture[0].path;
    }

    // Add certificate if uploaded
    if (req.files?.certificate?.[0]) {
      const certData = this.#parseJSON(req.body.certificateData, {});
      if (!certData.name) {
        throw new ErrorClass(
          "Certificate Name Required",
          400,
          "Certificate name is required when uploading a certificate file",
          "DoctorProfileController#createDoctorProfile",
        );
      }
      if (!profileData.certificates) profileData.certificates = [];
      profileData.certificates.push({
        name: certData.name,
        fileUrl: req.files.certificate[0].path,
        publicId: req.files.certificate[0].path,
        issuedDate: certData.issuedDate,
        expiryDate: certData.expiryDate,
      });
    }

    // Add material if uploaded
    if (req.files?.material?.[0]) {
      const materialData = this.#parseJSON(req.body.materialData, {});
      if (!materialData.category) {
        throw new ErrorClass(
          "Material Category Required",
          400,
          "Material category is required when uploading a material file",
          "DoctorProfileController#createDoctorProfile",
        );
      }
      if (!profileData.materials) profileData.materials = [];
      profileData.materials.push({
        category: materialData.category,
        brand: materialData.brand,
        description: materialData.description,
        fileUrl: req.files.material[0].path,
        publicId: req.files.material[0].path,
      });
    }

    // Add case (before/after photos) if both uploaded
    if (req.files?.beforePhoto?.[0] && req.files?.afterPhoto?.[0]) {
      const caseData = this.#parseJSON(req.body.caseData, {});
      if (!caseData.title || !caseData.treatmentType) {
        throw new ErrorClass(
          "Case Data Incomplete",
          400,
          "Case title and treatment type are required when uploading case photos",
          "DoctorProfileController#createDoctorProfile",
        );
      }
      if (!profileData.previousCases) profileData.previousCases = [];
      profileData.previousCases.push({
        title: caseData.title,
        treatmentType: caseData.treatmentType,
        description: caseData.description,
        beforePhoto: {
          url: req.files.beforePhoto[0].path,
          publicId: req.files.beforePhoto[0].path,
        },
        afterPhoto: {
          url: req.files.afterPhoto[0].path,
          publicId: req.files.afterPhoto[0].path,
        },
      });
    } else if (req.files?.beforePhoto?.[0] || req.files?.afterPhoto?.[0]) {
      throw new ErrorClass(
        "Both Case Photos Required",
        400,
        "Both before and after photos are required for case documentation",
        "DoctorProfileController#createDoctorProfile",
      );
    }

    // Create profile via service
    const profile = await doctorProfileService.createDoctorProfile(profileData);

    res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      data: profile,
    });
  });

  /**
   * Get all doctor profiles with filters and pagination
   * GET /api/doctor-profiles
   * Query: page, limit, specialization, minExperience, materials, search
   */
  getAllDoctorProfiles = asyncHandler(async (req, res) => {
    const filters = {
      specialization: req.query.specialization,
      minExperience: req.query.minExperience
        ? parseInt(req.query.minExperience)
        : undefined,
      materials: req.query.materials,
      search: req.query.search?.trim(),
    };

    const options = {
      page: req.query.page ? Math.max(1, parseInt(req.query.page)) : 1,
      limit: req.query.limit ? Math.min(100, parseInt(req.query.limit)) : 10,
    };

    const result = await doctorProfileService.getAllDoctorProfiles(
      filters,
      options,
    );

    res.status(200).json({
      success: true,
      data: result.doctors,
      pagination: result.pagination,
    });
  });

  /**
   * Get doctor profile by ID
   * GET /api/doctor-profiles/:id
   */
  getDoctorProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw new ErrorClass(
        "Invalid Profile ID",
        400,
        "Profile ID must be a valid MongoDB ID",
        "DoctorProfileController#getDoctorProfileById",
      );
    }

    const profile = await doctorProfileService.getDoctorProfileById(id);

    res.status(200).json({
      success: true,
      data: profile,
    });
  });

  /**
   * Update doctor profile by ID
   * PUT /api/doctor-profiles/:id
   */
  updateDoctorProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw new ErrorClass(
        "Invalid Profile ID",
        400,
        "Profile ID must be a valid MongoDB ID",
        "DoctorProfileController#updateDoctorProfile",
      );
    }

    const updateData = this.#prepareDoctorProfileData(req.body);
    const file = req.file; // Profile picture update

    const profile = await doctorProfileService.updateDoctorProfile(
      id,
      updateData,
      file,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  });

  /**
   * Update authenticated doctor's own profile
   * PUT /api/doctor-profiles/me
   */
  updateMyProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updateData = this.#prepareDoctorProfileData(req.body);
    const file = req.file;

    const profile = await doctorProfileService.updateDoctorProfile(
      userId,
      updateData,
      file,
    );

    res.status(200).json({
      success: true,
      message: "Your profile updated successfully",
      data: profile,
    });
  });

  /**
   * Delete doctor profile (admin only)
   * DELETE /api/doctor-profiles/:id
   */
  deleteDoctorProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw new ErrorClass(
        "Invalid Profile ID",
        400,
        "Profile ID must be a valid MongoDB ID",
        "DoctorProfileController#deleteDoctorProfile",
      );
    }

    await doctorProfileService.deleteDoctorProfile(id);

    res.status(200).json({
      success: true,
      message: "Doctor profile deleted successfully",
    });
  });

  /**
   * Add certificate to doctor profile
   * POST /api/doctor-profiles/:id/certificates
   */
  addCertificate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw new ErrorClass(
        "Invalid Profile ID",
        400,
        "Profile ID must be a valid MongoDB ID",
        "DoctorProfileController#addCertificate",
      );
    }

    this.#validateRequiredFields(req.body, ["name"]);

    const certificateData = {
      name: req.body.name?.trim(),
      issuer: req.body.issuer?.trim(),
      issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
      fileUrl: req.file?.path,
    };

    const profile = await doctorProfileService.addCertificate(
      id,
      certificateData,
    );

    res.status(201).json({
      success: true,
      message: "Certificate added successfully",
      data: profile,
    });
  });

  /**
   * Remove certificate from doctor profile
   * DELETE /api/doctor-profiles/:id/certificates/:certificateId
   */
  removeCertificate = asyncHandler(async (req, res) => {
    const { id, certificateId } = req.params;

    if (
      !id ||
      id.length !== 24 ||
      !certificateId ||
      certificateId.length !== 24
    ) {
      throw new ErrorClass(
        "Invalid IDs",
        400,
        "Both profile ID and certificate ID must be valid MongoDB IDs",
        "DoctorProfileController#removeCertificate",
      );
    }

    const profile = await doctorProfileService.removeCertificate(
      id,
      certificateId,
    );

    res.status(200).json({
      success: true,
      message: "Certificate removed successfully",
      data: profile,
    });
  });

  /**
   * Add material to doctor profile
   * POST /api/doctor-profiles/:id/materials
   */
  addMaterial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw new ErrorClass(
        "Invalid Profile ID",
        400,
        "Profile ID must be a valid MongoDB ID",
        "DoctorProfileController#addMaterial",
      );
    }

    this.#validateRequiredFields(req.body, ["category"]);

    const materialData = {
      category: req.body.category,
      brand: req.body.brand?.trim(),
      description: req.body.description?.trim(),
      fileUrl: req.file?.path,
    };

    const profile = await doctorProfileService.addMaterial(id, materialData);

    res.status(201).json({
      success: true,
      message: "Material added successfully",
      data: profile,
    });
  });

  /**
   * Remove material from doctor profile
   * DELETE /api/doctor-profiles/:id/materials/:materialId
   */
  removeMaterial = asyncHandler(async (req, res) => {
    const { id, materialId } = req.params;

    if (!id || id.length !== 24 || !materialId || materialId.length !== 24) {
      throw new ErrorClass(
        "Invalid IDs",
        400,
        "Both profile ID and material ID must be valid MongoDB IDs",
        "DoctorProfileController#removeMaterial",
      );
    }

    const profile = await doctorProfileService.removeMaterial(id, materialId);

    res.status(200).json({
      success: true,
      message: "Material removed successfully",
      data: profile,
    });
  });

  /**
   * Add previous case to doctor profile
   * POST /api/doctor-profiles/:id/cases
   * Files: beforePhoto, afterPhoto
   */
  addPreviousCase = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw new ErrorClass(
        "Invalid Profile ID",
        400,
        "Profile ID must be a valid MongoDB ID",
        "DoctorProfileController#addPreviousCase",
      );
    }

    this.#validateRequiredFields(req.body, ["title", "treatmentType"]);

    const caseData = {
      title: req.body.title?.trim(),
      description: req.body.description?.trim(),
      treatmentType: req.body.treatmentType?.trim(),
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };

    const files = req.files || {};

    const profile = await doctorProfileService.addPreviousCase(
      id,
      caseData,
      files,
    );

    res.status(201).json({
      success: true,
      message: "Previous case added successfully",
      data: profile,
    });
  });

  /**
   * Remove previous case from doctor profile
   * DELETE /api/doctor-profiles/:id/cases/:caseId
   */
  removePreviousCase = asyncHandler(async (req, res) => {
    const { id, caseId } = req.params;

    if (!id || id.length !== 24 || !caseId || caseId.length !== 24) {
      throw new ErrorClass(
        "Invalid IDs",
        400,
        "Both profile ID and case ID must be valid MongoDB IDs",
        "DoctorProfileController#removePreviousCase",
      );
    }

    const profile = await doctorProfileService.removePreviousCase(id, caseId);

    res.status(200).json({
      success: true,
      message: "Previous case removed successfully",
      data: profile,
    });
  });

  /**
   * Get doctor statistics
   * GET /api/doctor-profiles/:id/statistics
   */
  getDoctorStatistics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw new ErrorClass(
        "Invalid Profile ID",
        400,
        "Profile ID must be a valid MongoDB ID",
        "DoctorProfileController#getDoctorStatistics",
      );
    }

    const statistics = await doctorProfileService.getDoctorStatistics(id);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  });

  /**
   * Add office hours to doctor profile
   * POST /api/doctor-profiles/:id/office-hours
   */
  addOfficeHours = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      throw new ErrorClass(
        "Invalid Profile ID",
        400,
        "Profile ID must be a valid MongoDB ID",
        "DoctorProfileController#addOfficeHours",
      );
    }

    this.#validateRequiredFields(req.body, ["day", "open", "close"]);

    const officeHoursData = {
      day: req.body.day,
      open: req.body.open,
      close: req.body.close,
    };

    const profile = await doctorProfileService.addOfficeHours(
      id,
      officeHoursData,
    );

    res.status(201).json({
      success: true,
      message: "Office hours added successfully",
      data: profile,
    });
  });

  /**
   * Remove office hours from doctor profile
   * DELETE /api/doctor-profiles/:id/office-hours/:officeHoursId
   */
  removeOfficeHours = asyncHandler(async (req, res) => {
    const { id, officeHoursId } = req.params;

    if (
      !id ||
      id.length !== 24 ||
      !officeHoursId ||
      officeHoursId.length !== 24
    ) {
      throw new ErrorClass(
        "Invalid IDs",
        400,
        "Both profile ID and office hours ID must be valid MongoDB IDs",
        "DoctorProfileController#removeOfficeHours",
      );
    }

    const profile = await doctorProfileService.removeOfficeHours(
      id,
      officeHoursId,
    );

    res.status(200).json({
      success: true,
      message: "Office hours removed successfully",
      data: profile,
    });
  });
}

export default new DoctorProfileController();
