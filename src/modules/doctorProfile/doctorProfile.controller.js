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
  // createDoctorProfile = asyncHandler(async (req, res) => {
  //   // Validate required fields
  //   this.#validateRequiredFields(req.body, [
  //     "email",
  //     "firstName",
  //     "lastName",
  //     "licenseNumber",
  //   ]);

  //   // Prepare profile data
  //   const profileData = this.#prepareDoctorProfileData(req.body);

  //   // Add profile picture if uploaded
  //   if (req.files?.picture?.[0]) {
  //     profileData.picture = req.files.picture[0].path;
  //   }

  //   // Add multiple certificates if uploaded
  //   if (req.files?.certificates && Array.isArray(req.files.certificates)) {
  //     if (!profileData.certificates) profileData.certificates = [];
  //     req.files.certificates.forEach((file, index) => {
  //       const certData = this.#parseJSON(
  //         req.body[`certificateData[${index}]`],
  //         {},
  //       );
  //       if (!certData.name) {
  //         throw new ErrorClass(
  //           "Certificate Name Required",
  //           400,
  //           `Certificate ${index + 1} name is required`,
  //           "DoctorProfileController#createDoctorProfile",
  //         );
  //       }
  //       profileData.certificates.push({
  //         name: certData.name,
  //         fileUrl: file.path,
  //         publicId: file.path,
  //         issueDate: certData.issueDate,
  //         expiryDate: certData.expiryDate,
  //       });
  //     });
  //   }

  //   // Add multiple materials if uploaded
  //   if (req.files?.materials && Array.isArray(req.files.materials)) {
  //     if (!profileData.materials) profileData.materials = [];
  //     req.files.materials.forEach((file, index) => {
  //       const materialData = this.#parseJSON(
  //         req.body[`materialData[${index}]`],
  //         {},
  //       );
  //       if (!materialData.category) {
  //         throw new ErrorClass(
  //           "Material Category Required",
  //           400,
  //           `Material ${index + 1} category is required`,
  //           "DoctorProfileController#createDoctorProfile",
  //         );
  //       }
  //       profileData.materials.push({
  //         category: materialData.category,
  //         brand: materialData.brand,
  //         description: materialData.description,
  //         fileUrl: file.path,
  //         publicId: file.path,
  //       });
  //     });
  //   }

  //   // Add multiple cases (before/after photo pairs) if uploaded
  //   if (req.files?.beforePhoto || req.files?.afterPhoto) {
  //     const beforePhotos = req.files?.beforePhoto || [];
  //     const afterPhotos = req.files?.afterPhoto || [];

  //     // Ensure we have matching pairs
  //     const pairsCount = Math.min(beforePhotos.length, afterPhotos.length);

  //     if (pairsCount > 0) {
  //       if (!profileData.previousCases) profileData.previousCases = [];

  //       for (let i = 0; i < pairsCount; i++) {
  //         const caseData = this.#parseJSON(req.body[`caseData[${i}]`], {});
  //         if (!caseData.title || !caseData.treatmentType) {
  //           throw new ErrorClass(
  //             "Case Data Incomplete",
  //             400,
  //             `Case ${i + 1} requires title and treatment type`,
  //             "DoctorProfileController#createDoctorProfile",
  //           );
  //         }
  //         profileData.previousCases.push({
  //           title: caseData.title,
  //           treatmentType: caseData.treatmentType,
  //           description: caseData.description,
  //           beforePhoto: {
  //             url: beforePhotos[i].path,
  //             publicId: beforePhotos[i].path,
  //           },
  //           afterPhoto: {
  //             url: afterPhotos[i].path,
  //             publicId: afterPhotos[i].path,
  //           },
  //         });
  //       }
  //     } else if (beforePhotos.length !== afterPhotos.length) {
  //       throw new ErrorClass(
  //         "Mismatched Case Photos",
  //         400,
  //         "Each case requires both before and after photos (must be equal count)",
  //         "DoctorProfileController#createDoctorProfile",
  //       );
  //     }
  //   }

  //   // Create profile via service
  //   const profile = await doctorProfileService.createDoctorProfile(profileData);

  //   res.status(201).json({
  //     success: true,
  //     message: "Doctor profile created successfully",
  //     data: profile,
  //   });
  // });

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

    // Add multiple certificates if uploaded
    if (req.files?.certificates?.length) {
      profileData.certificates = [];

      // Normalize: multipart sends repeated fields as string (1 item) or array (2+ items)
      const rawCertData = req.body.certificateData;
      const certDataList = Array.isArray(rawCertData)
        ? rawCertData
        : rawCertData
          ? [rawCertData]
          : [];

      req.files.certificates.forEach((file, index) => {
        const certData = this.#parseJSON(certDataList[index], {});

        if (!certData.name) {
          throw new ErrorClass(
            "Certificate Name Required",
            400,
            `Certificate ${index + 1} name is required`,
            "DoctorProfileController#createDoctorProfile",
          );
        }

        profileData.certificates.push({
          name: certData.name,
          fileUrl: file.path,
          publicId: file.path,
          issueDate: certData.issuedDate ?? certData.issueDate ?? null, // handle both key variants
          expiryDate: certData.expiryDate ?? null,
        });
      });
    }

    // Add multiple materials if uploaded
    if (req.files?.materials?.length) {
      profileData.materials = [];

      // Normalize same as certificateData
      const rawMaterialData = req.body.materialData;
      const materialDataList = Array.isArray(rawMaterialData)
        ? rawMaterialData
        : rawMaterialData
          ? [rawMaterialData]
          : [];

      req.files.materials.forEach((file, index) => {
        const materialData = this.#parseJSON(materialDataList[index], {});

        if (!materialData.category) {
          throw new ErrorClass(
            "Material Category Required",
            400,
            `Material ${index + 1} category is required`,
            "DoctorProfileController#createDoctorProfile",
          );
        }

        profileData.materials.push({
          category: materialData.category,
          brand: materialData.brand ?? null,
          description: materialData.description ?? null,
          fileUrl: file.path,
          publicId: file.path,
        });
      });
    }

    // Add previous cases (before/after photo pairs) if uploaded
    if (req.files?.beforePhoto?.length || req.files?.afterPhoto?.length) {
      const beforePhotos = req.files?.beforePhoto ?? [];
      const afterPhotos = req.files?.afterPhoto ?? [];

      if (beforePhotos.length !== afterPhotos.length) {
        throw new ErrorClass(
          "Mismatched Case Photos",
          400,
          "Each case requires both before and after photos (must be equal count)",
          "DoctorProfileController#createDoctorProfile",
        );
      }

      profileData.previousCases = [];

      const rawCaseData = req.body.caseData;
      const caseDataList = Array.isArray(rawCaseData)
        ? rawCaseData
        : rawCaseData
          ? [rawCaseData]
          : [];

      for (let i = 0; i < beforePhotos.length; i++) {
        const caseData = this.#parseJSON(caseDataList[i], {});

        if (!caseData.title || !caseData.treatmentType) {
          throw new ErrorClass(
            "Case Data Incomplete",
            400,
            `Case ${i + 1} requires title and treatment type`,
            "DoctorProfileController#createDoctorProfile",
          );
        }

        profileData.previousCases.push({
          title: caseData.title,
          treatmentType: caseData.treatmentType,
          description: caseData.description ?? null,
          beforePhoto: {
            url: beforePhotos[i].path,
            publicId: beforePhotos[i].path,
          },
          afterPhoto: {
            url: afterPhotos[i].path,
            publicId: afterPhotos[i].path,
          },
        });
      }
    }

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
   * Add certificate to doctor profile (can add multiple)
   * POST /api/doctor-profiles/:id/certificates
   * Files: certificates (array)
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

    if (!req.files || req.files.length === 0) {
      throw new ErrorClass(
        "No Files Uploaded",
        400,
        "At least one certificate file is required",
        "DoctorProfileController#addCertificate",
      );
    }

    let profile = null;

    // Process each uploaded certificate file
    for (let i = 0; i < req.files.length; i++) {
      const certName = req.body[`names[${i}]`] || req.body.name;
      if (!certName) {
        throw new ErrorClass(
          "Certificate Name Required",
          400,
          `Certificate ${i + 1} name is required`,
          "DoctorProfileController#addCertificate",
        );
      }

      const certificateData = {
        name: certName.trim(),
        issuer: req.body[`issuers[${i}]`] || req.body.issuer?.trim(),
        issueDate: req.body[`issueDates[${i}]`]
          ? new Date(req.body[`issueDates[${i}]`])
          : undefined,
        fileUrl: req.files[i].path,
      };

      profile = await doctorProfileService.addCertificate(id, certificateData);
    }

    res.status(201).json({
      success: true,
      message: `${req.files.length} certificate(s) added successfully`,
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
   * Add material to doctor profile (can add multiple)
   * POST /api/doctor-profiles/:id/materials
   * Files: materials (array)
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

    if (!req.files || req.files.length === 0) {
      throw new ErrorClass(
        "No Files Uploaded",
        400,
        "At least one material file is required",
        "DoctorProfileController#addMaterial",
      );
    }

    let profile = null;

    // Process each uploaded material file
    for (let i = 0; i < req.files.length; i++) {
      const category = req.body[`categories[${i}]`] || req.body.category;
      if (!category) {
        throw new ErrorClass(
          "Material Category Required",
          400,
          `Material ${i + 1} category is required`,
          "DoctorProfileController#addMaterial",
        );
      }

      const materialData = {
        category,
        brand: (req.body[`brands[${i}]`] || req.body.brand)?.trim(),
        description: (
          req.body[`descriptions[${i}]`] || req.body.description
        )?.trim(),
        fileUrl: req.files[i].path,
      };

      profile = await doctorProfileService.addMaterial(id, materialData);
    }

    res.status(201).json({
      success: true,
      message: `${req.files.length} material(s) added successfully`,
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
   * Add previous case to doctor profile (can add multiple)
   * POST /api/doctor-profiles/:id/cases
   * Files: beforePhoto, afterPhoto (multiple pairs)
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

    const beforePhotos = req.files?.beforePhoto || [];
    const afterPhotos = req.files?.afterPhoto || [];

    // Ensure we have matching pairs
    if (beforePhotos.length === 0 && afterPhotos.length === 0) {
      throw new ErrorClass(
        "No Photos Uploaded",
        400,
        "At least one before and after photo pair is required",
        "DoctorProfileController#addPreviousCase",
      );
    }

    if (beforePhotos.length !== afterPhotos.length) {
      throw new ErrorClass(
        "Mismatched Photo Pairs",
        400,
        "Each case requires both before and after photos (must be equal count)",
        "DoctorProfileController#addPreviousCase",
      );
    }

    let profile = null;
    const pairsCount = Math.min(beforePhotos.length, afterPhotos.length);

    // Process each case (before/after photo pair)
    for (let i = 0; i < pairsCount; i++) {
      const title = req.body[`titles[${i}]`] || req.body.title;
      const treatmentType =
        req.body[`treatmentTypes[${i}]`] || req.body.treatmentType;

      if (!title || !treatmentType) {
        throw new ErrorClass(
          "Case Data Incomplete",
          400,
          `Case ${i + 1} requires title and treatment type`,
          "DoctorProfileController#addPreviousCase",
        );
      }

      const caseData = {
        title: title.trim(),
        description: (
          req.body[`descriptions[${i}]`] || req.body.description
        )?.trim(),
        treatmentType: treatmentType.trim(),
        date: req.body[`dates[${i}]`]
          ? new Date(req.body[`dates[${i}]`])
          : new Date(),
      };

      const files = {
        beforePhoto: [beforePhotos[i]],
        afterPhoto: [afterPhotos[i]],
      };

      profile = await doctorProfileService.addPreviousCase(id, caseData, files);
    }

    res.status(201).json({
      success: true,
      message: `${pairsCount} case(s) added successfully`,
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
