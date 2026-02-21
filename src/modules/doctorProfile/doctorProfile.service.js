import DoctorProfile from "../../models/doctorProfile.model.js";
import Review from "../../models/review.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import {
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  extractPublicId,
} from "../../config/cloudinary.config.js";

/**
 * Doctor Profile Service
 * Handles all business logic for doctor profile operations
 * Manages database operations and Cloudinary file management
 */

class DoctorProfileService {
  /**
   * Create a new doctor profile with optional files
   * @param {Object} profileData - Profile data object (may include certificates, materials, previousCases)
   * @returns {Promise<Object>} Created profile document
   */
  async createDoctorProfile(profileData) {
    try {
      // Validate required fields
      const requiredFields = [
        "email",
        "firstName",
        "lastName",
        "licenseNumber",
      ];
      const missingFields = requiredFields.filter(
        (field) => !profileData[field],
      );

      if (missingFields.length > 0) {
        throw new ErrorClass(
          "Missing Required Fields",
          400,
          `Required fields: ${missingFields.join(", ")}`,
          "DoctorProfileService#createDoctorProfile",
        );
      }

      // Check for duplicate email
      const existingEmail = await DoctorProfile.findOne({
        email: profileData.email.toLowerCase(),
      });
      if (existingEmail) {
        throw new ErrorClass(
          "Email Already Exists",
          400,
          "A doctor profile with this email already exists",
          "DoctorProfileService#createDoctorProfile",
        );
      }

      // Check for duplicate license number
      const existingLicense = await DoctorProfile.findOne({
        licenseNumber: profileData.licenseNumber,
      });
      if (existingLicense) {
        throw new ErrorClass(
          "License Number Already Exists",
          400,
          "A doctor profile with this license number already exists",
          "DoctorProfileService#createDoctorProfile",
        );
      }

      // Process certificates - extract proper publicId from URLs if they're Cloudinary URLs
      if (profileData.certificates && Array.isArray(profileData.certificates)) {
        profileData.certificates = profileData.certificates.map((cert) => {
          if (cert.url) {
            cert.publicId = extractPublicId(cert.url);
          }
          return cert;
        });
      }

      // Process materials - extract proper publicId from URLs if they're Cloudinary URLs
      if (profileData.materials && Array.isArray(profileData.materials)) {
        profileData.materials = profileData.materials.map((material) => {
          if (material.url) {
            material.publicId = extractPublicId(material.url);
          }
          return material;
        });
      }

      // Process previous cases - extract proper publicId from URLs if they're Cloudinary URLs
      if (
        profileData.previousCases &&
        Array.isArray(profileData.previousCases)
      ) {
        profileData.previousCases = profileData.previousCases.map(
          (caseItem) => {
            if (caseItem.beforePhoto?.url) {
              caseItem.beforePhoto.publicId = extractPublicId(
                caseItem.beforePhoto.url,
              );
            }
            if (caseItem.afterPhoto?.url) {
              caseItem.afterPhoto.publicId = extractPublicId(
                caseItem.afterPhoto.url,
              );
            }
            return caseItem;
          },
        );
      }

      const doctorProfile = new DoctorProfile(profileData);
      await doctorProfile.save();

      console.log(`✅ Doctor profile created with files: ${doctorProfile._id}`);
      return doctorProfile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Profile Creation Error",
        500,
        error.message,
        "DoctorProfileService#createDoctorProfile",
      );
    }
  }

  /**
   * Get all doctor profiles with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Doctors array and pagination info
   */
  async getAllDoctorProfiles(filters = {}, options = {}) {
    try {
      const { specialization, minExperience, materials, search } = filters;
      const { page = 1, limit = 10 } = options;

      const query = {};

      // Apply filters
      if (specialization) {
        query.specialization = {
          $in: Array.isArray(specialization)
            ? specialization
            : [specialization],
        };
      }

      if (minExperience !== undefined && minExperience > 0) {
        query.yearsOfExperience = { $gte: minExperience };
      }

      if (materials) {
        query["materials.category"] = {
          $in: Array.isArray(materials) ? materials : [materials],
        };
      }

      if (search && search.trim()) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { bio: { $regex: search, $options: "i" } },
          { "materials.brand": { $regex: search, $options: "i" } },
        ];
      }

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      const [doctors, total] = await Promise.all([
        DoctorProfile.find(query)
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 })
          .lean(),
        DoctorProfile.countDocuments(query),
      ]);

      return {
        doctors,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      };
    } catch (error) {
      throw new ErrorClass(
        "Fetch Profiles Error",
        500,
        error.message,
        "DoctorProfileService#getAllDoctorProfiles",
      );
    }
  }

  /**
   * Get doctor profile by ID
   * @param {string} profileId - Profile MongoDB ID
   * @returns {Promise<Object>} Profile document
   */
  async getDoctorProfileById(profileId) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#getDoctorProfileById",
        );
      }

      return profile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Fetch Profile Error",
        500,
        error.message,
        "DoctorProfileService#getDoctorProfileById",
      );
    }
  }

  /**
   * Update doctor profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {Object} updateData - Data to update
   * @param {Object} file - New profile picture file
   * @returns {Promise<Object>} Updated profile document
   */
  async updateDoctorProfile(profileId, updateData, file) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#updateDoctorProfile",
        );
      }

      // Check for duplicate email if being updated
      if (updateData.email && updateData.email !== profile.email) {
        const existingEmail = await DoctorProfile.findOne({
          email: updateData.email.toLowerCase(),
          _id: { $ne: profileId },
        });
        if (existingEmail) {
          throw new ErrorClass(
            "Email Already Exists",
            400,
            "This email is already in use",
            "DoctorProfileService#updateDoctorProfile",
          );
        }
      }

      // Handle profile picture update
      if (file) {
        if (profile.picture) {
          const publicId = extractPublicId(profile.picture);
          if (publicId) {
            await deleteFromCloudinary(publicId).catch((e) =>
              console.error("Failed to delete old picture:", e),
            );
          }
        }
        updateData.picture = file.path;
      }

      const updatedProfile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      console.log(`✅ Doctor profile updated: ${profileId}`);
      return updatedProfile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Profile Update Error",
        500,
        error.message,
        "DoctorProfileService#updateDoctorProfile",
      );
    }
  }

  /**
   * Delete doctor profile and all associated files from Cloudinary
   * @param {string} profileId - Profile MongoDB ID
   * @returns {Promise<Object>} Deleted profile document
   */
  async deleteDoctorProfile(profileId) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#deleteDoctorProfile",
        );
      }

      // Collect all public IDs for deletion
      const publicIdsToDelete = [];

      // Profile picture
      if (profile.picture) {
        const publicId = extractPublicId(profile.picture);
        if (publicId) publicIdsToDelete.push(publicId);
      }

      // Certificate files
      profile.certificates.forEach((cert) => {
        if (cert.fileUrl) {
          const publicId = extractPublicId(cert.fileUrl);
          if (publicId) publicIdsToDelete.push(publicId);
        }
      });

      // Material files
      profile.materials.forEach((material) => {
        if (material.fileUrl) {
          const publicId = extractPublicId(material.fileUrl);
          if (publicId) publicIdsToDelete.push(publicId);
        }
      });

      // Case photos
      profile.previousCases.forEach((caseItem) => {
        if (caseItem.beforePhoto?.url) {
          const publicId = extractPublicId(caseItem.beforePhoto.url);
          if (publicId) publicIdsToDelete.push(publicId);
        }
        if (caseItem.afterPhoto?.url) {
          const publicId = extractPublicId(caseItem.afterPhoto.url);
          if (publicId) publicIdsToDelete.push(publicId);
        }
      });

      // Delete all files from Cloudinary
      if (publicIdsToDelete.length > 0) {
        await deleteMultipleFromCloudinary(publicIdsToDelete).catch((e) =>
          console.error("Failed to delete some Cloudinary files:", e),
        );
      }

      // Delete profile from database
      await DoctorProfile.findByIdAndDelete(profileId);

      console.log(`✅ Doctor profile deleted: ${profileId}`);
      return profile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Profile Deletion Error",
        500,
        error.message,
        "DoctorProfileService#deleteDoctorProfile",
      );
    }
  }

  /**
   * Add certificate to profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {Object} certificateData - Certificate data
   * @returns {Promise<Object>} Updated profile document
   */
  async addCertificate(profileId, certificateData) {
    try {
      if (!certificateData.name) {
        throw new ErrorClass(
          "Missing Required Field",
          400,
          "Certificate name is required",
          "DoctorProfileService#addCertificate",
        );
      }

      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $push: { certificates: certificateData } },
        { new: true, runValidators: true },
      );

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#addCertificate",
        );
      }

      console.log(`✅ Certificate added to profile: ${profileId}`);
      return profile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Add Certificate Error",
        500,
        error.message,
        "DoctorProfileService#addCertificate",
      );
    }
  }

  /**
   * Remove certificate from profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {string} certificateId - Certificate MongoDB ID
   * @returns {Promise<Object>} Updated profile document
   */
  async removeCertificate(profileId, certificateId) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#removeCertificate",
        );
      }

      // Find and delete the certificate file
      const certificate = profile.certificates.id(certificateId);
      if (certificate?.fileUrl) {
        const publicId = extractPublicId(certificate.fileUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId).catch((e) =>
            console.error("Failed to delete certificate file:", e),
          );
        }
      }

      const updatedProfile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $pull: { certificates: { _id: certificateId } } },
        { new: true },
      );

      console.log(`✅ Certificate removed from profile: ${profileId}`);
      return updatedProfile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Remove Certificate Error",
        500,
        error.message,
        "DoctorProfileService#removeCertificate",
      );
    }
  }

  /**
   * Add material to profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {Object} materialData - Material data
   * @returns {Promise<Object>} Updated profile document
   */
  async addMaterial(profileId, materialData) {
    try {
      if (!materialData.category) {
        throw new ErrorClass(
          "Missing Required Field",
          400,
          "Material category is required",
          "DoctorProfileService#addMaterial",
        );
      }

      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $push: { materials: materialData } },
        { new: true, runValidators: true },
      );

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#addMaterial",
        );
      }

      console.log(`✅ Material added to profile: ${profileId}`);
      return profile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Add Material Error",
        500,
        error.message,
        "DoctorProfileService#addMaterial",
      );
    }
  }

  /**
   * Remove material from profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {string} materialId - Material MongoDB ID
   * @returns {Promise<Object>} Updated profile document
   */
  async removeMaterial(profileId, materialId) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#removeMaterial",
        );
      }

      // Find and delete the material file
      const material = profile.materials.id(materialId);
      if (material?.fileUrl) {
        const publicId = extractPublicId(material.fileUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId).catch((e) =>
            console.error("Failed to delete material file:", e),
          );
        }
      }

      const updatedProfile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $pull: { materials: { _id: materialId } } },
        { new: true },
      );

      console.log(`✅ Material removed from profile: ${profileId}`);
      return updatedProfile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Remove Material Error",
        500,
        error.message,
        "DoctorProfileService#removeMaterial",
      );
    }
  }

  /**
   * Add previous case to profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {Object} caseData - Case data
   * @param {Object} files - Before/after photos
   * @returns {Promise<Object>} Updated profile document
   */
  async addPreviousCase(profileId, caseData, files) {
    try {
      if (!caseData.title || !caseData.treatmentType) {
        throw new ErrorClass(
          "Missing Required Fields",
          400,
          "Title and treatment type are required",
          "DoctorProfileService#addPreviousCase",
        );
      }

      // Add photo URLs if provided
      if (files?.beforePhoto?.[0]) {
        caseData.beforePhoto = {
          url: files.beforePhoto[0].path,
          publicId: extractPublicId(files.beforePhoto[0].path),
        };
      }

      if (files?.afterPhoto?.[0]) {
        caseData.afterPhoto = {
          url: files.afterPhoto[0].path,
          publicId: extractPublicId(files.afterPhoto[0].path),
        };
      }

      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $push: { previousCases: caseData } },
        { new: true, runValidators: true },
      );

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#addPreviousCase",
        );
      }

      console.log(`✅ Previous case added to profile: ${profileId}`);
      return profile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Add Case Error",
        500,
        error.message,
        "DoctorProfileService#addPreviousCase",
      );
    }
  }

  /**
   * Remove previous case from profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {string} caseId - Case MongoDB ID
   * @returns {Promise<Object>} Updated profile document
   */
  async removePreviousCase(profileId, caseId) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#removePreviousCase",
        );
      }

      // Find and delete case photos
      const caseItem = profile.previousCases.id(caseId);
      if (caseItem) {
        const publicIdsToDelete = [];

        if (caseItem.beforePhoto?.url) {
          const publicId = extractPublicId(caseItem.beforePhoto.url);
          if (publicId) publicIdsToDelete.push(publicId);
        }

        if (caseItem.afterPhoto?.url) {
          const publicId = extractPublicId(caseItem.afterPhoto.url);
          if (publicId) publicIdsToDelete.push(publicId);
        }

        if (publicIdsToDelete.length > 0) {
          await deleteMultipleFromCloudinary(publicIdsToDelete).catch((e) =>
            console.error("Failed to delete case photos:", e),
          );
        }
      }

      const updatedProfile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $pull: { previousCases: { _id: caseId } } },
        { new: true },
      );

      console.log(`✅ Previous case removed from profile: ${profileId}`);
      return updatedProfile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Remove Case Error",
        500,
        error.message,
        "DoctorProfileService#removePreviousCase",
      );
    }
  }

  /**
   * Get doctor profile statistics
   * @param {string} profileId - Profile MongoDB ID
   * @returns {Promise<Object>} Statistics object
   */
  async getDoctorStatistics(profileId) {
    try {
      const profile =
        await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#getDoctorStatistics",
        );
      }

      return {
        totalCases: profile.previousCases?.length || 0,
        totalCertificates: profile.certificates?.length || 0,
        totalMaterials: profile.materials?.length || 0,
        yearsOfExperience: profile.yearsOfExperience,
        specializations: profile.specialization,
      };
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Statistics Fetch Error",
        500,
        error.message,
        "DoctorProfileService#getDoctorStatistics",
      );
    }
  }

  /**
   * Add office hours to profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {Object} officeHoursData - Office hours data
   * @returns {Promise<Object>} Updated profile document
   */
  async addOfficeHours(profileId, officeHoursData) {
    try {
      if (
        !officeHoursData.day ||
        !officeHoursData.open ||
        !officeHoursData.close
      ) {
        throw new ErrorClass(
          "Missing Required Fields",
          400,
          "Day, open, and close times are required",
          "DoctorProfileService#addOfficeHours",
        );
      }

      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $push: { officeHours: officeHoursData } },
        { new: true, runValidators: true },
      );

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#addOfficeHours",
        );
      }

      console.log(`✅ Office hours added to profile: ${profileId}`);
      return profile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Add Office Hours Error",
        500,
        error.message,
        "DoctorProfileService#addOfficeHours",
      );
    }
  }

  /**
   * Remove office hours from profile
   * @param {string} profileId - Profile MongoDB ID
   * @param {string} officeHoursId - Office hours MongoDB ID
   * @returns {Promise<Object>} Updated profile document
   */
  async removeOfficeHours(profileId, officeHoursId) {
    try {
      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $pull: { officeHours: { _id: officeHoursId } } },
        { new: true },
      );

      if (!profile) {
        throw new ErrorClass(
          "Profile Not Found",
          404,
          "Doctor profile not found",
          "DoctorProfileService#removeOfficeHours",
        );
      }

      console.log(`✅ Office hours removed from profile: ${profileId}`);
      return profile;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Remove Office Hours Error",
        500,
        error.message,
        "DoctorProfileService#removeOfficeHours",
      );
    }
  }
}

export default new DoctorProfileService();
