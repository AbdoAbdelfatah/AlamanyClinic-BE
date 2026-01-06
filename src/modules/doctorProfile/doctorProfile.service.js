import DoctorProfile from "../../models/doctorProfile.model.js";
import Review from "../../models/review.model.js";
import {
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "../../config/cloudinary.config.js";

class DoctorProfileService {
  // Create a new doctor profile
  async createDoctorProfile(userId, profileData, file) {
    try {
      const existingProfile = await DoctorProfile.findOne({ user: userId });
      if (existingProfile) {
        throw new Error("Doctor profile already exists for this user");
      }

      const data = { user: userId, ...profileData };

      // Add profile picture if uploaded
      if (file) {
        data.picture = file.path;
      }

      const doctorProfile = new DoctorProfile(data);
      await doctorProfile.save();
      return await doctorProfile.populate("user", "-password");
    } catch (error) {
      throw error;
    }
  }

  // Get all doctor profiles with filtering and pagination
  async getAllDoctorProfiles(filters = {}, options = {}) {
    try {
      const {
        specialization,
        minExperience,
        materials,
        search,
        page = 1,
        limit = 10,
      } = { ...filters, ...options };

      const query = {};

      if (specialization) {
        query.specialization = {
          $in: Array.isArray(specialization)
            ? specialization
            : [specialization],
        };
      }

      if (minExperience) {
        query.yearsOfExperience = { $gte: parseInt(minExperience) };
      }

      if (materials) {
        query["materials.category"] = {
          $in: Array.isArray(materials) ? materials : [materials],
        };
      }

      if (search) {
        query.$or = [
          { bio: { $regex: search, $options: "i" } },
          { "materials.brand": { $regex: search, $options: "i" } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await DoctorProfile.countDocuments(query);

      const doctors = await DoctorProfile.find(query)
        .populate("user", "-password")
        .populate("reviews")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      return {
        doctors,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get doctor profile by ID
  async getDoctorProfileById(profileId) {
    try {
      const profile = await DoctorProfile.findById(profileId)
        .populate("user", "-password")
        .populate({
          path: "reviews",
          populate: { path: "patient", select: "name email" },
        });

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Get doctor profile by user ID
  async getDoctorProfileByUserId(userId) {
    try {
      const profile = await DoctorProfile.findOne({ user: userId })
        .populate("user", "-password")
        .populate({
          path: "reviews",
          populate: { path: "patient", select: "name email" },
        });

      if (!profile) {
        throw new Error("Doctor profile not found for this user");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Update doctor profile
  async updateDoctorProfile(profileId, updateData, file) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      // If new profile picture is uploaded, delete old one
      if (file) {
        if (profile.picture) {
          const publicId = this.extractPublicId(profile.picture);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        }
        updateData.picture = file.path;
      }

      const updatedProfile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("user", "-password");

      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }

  // Delete doctor profile
  async deleteDoctorProfile(profileId) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      // Collect all public IDs to delete
      const publicIdsToDelete = [];

      // Profile picture
      if (profile.picture) {
        const publicId = this.extractPublicId(profile.picture);
        if (publicId) publicIdsToDelete.push(publicId);
      }

      // Certificate files
      profile.certificates.forEach((cert) => {
        if (cert.fileUrl) {
          const publicId = this.extractPublicId(cert.fileUrl);
          if (publicId) publicIdsToDelete.push(publicId);
        }
      });

      // Case photos
      profile.previousCases.forEach((caseItem) => {
        if (caseItem.beforePhoto?.publicId) {
          publicIdsToDelete.push(caseItem.beforePhoto.publicId);
        }
        if (caseItem.afterPhoto?.publicId) {
          publicIdsToDelete.push(caseItem.afterPhoto.publicId);
        }
      });

      // Delete all files from Cloudinary
      if (publicIdsToDelete.length > 0) {
        await deleteMultipleFromCloudinary(publicIdsToDelete);
      }

      // Delete profile from database
      await DoctorProfile.findByIdAndDelete(profileId);

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Add certificate
  async addCertificate(profileId, certificateData, file) {
    try {
      if (file) {
        certificateData.fileUrl = file.path;
      }

      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $push: { certificates: certificateData } },
        { new: true, runValidators: true }
      ).populate("user", "-password");

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Remove certificate
  async removeCertificate(profileId, certificateId) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      // Find the certificate to get its file URL
      const certificate = profile.certificates.id(certificateId);

      if (certificate && certificate.fileUrl) {
        const publicId = this.extractPublicId(certificate.fileUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }

      const updatedProfile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $pull: { certificates: { _id: certificateId } } },
        { new: true }
      ).populate("user", "-password");

      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }

  // Add material
  async addMaterial(profileId, materialData) {
    try {
      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $push: { materials: materialData } },
        { new: true, runValidators: true }
      ).populate("user", "-password");

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Remove material
  async removeMaterial(profileId, materialId) {
    try {
      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $pull: { materials: { _id: materialId } } },
        { new: true }
      ).populate("user", "-password");

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Add previous case
  async addPreviousCase(profileId, caseData, files) {
    try {
      if (files) {
        if (files.beforePhoto) {
          caseData.beforePhoto = {
            url: files.beforePhoto[0].path,
            publicId: files.beforePhoto[0].filename,
          };
        }
        if (files.afterPhoto) {
          caseData.afterPhoto = {
            url: files.afterPhoto[0].path,
            publicId: files.afterPhoto[0].filename,
          };
        }
      }

      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $push: { previousCases: caseData } },
        { new: true, runValidators: true }
      ).populate("user", "-password");

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Remove previous case
  async removePreviousCase(profileId, caseId) {
    try {
      const profile = await DoctorProfile.findById(profileId);

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      // Find the case to get its photos
      const caseItem = profile.previousCases.id(caseId);

      if (caseItem) {
        const publicIdsToDelete = [];

        if (caseItem.beforePhoto?.publicId) {
          publicIdsToDelete.push(caseItem.beforePhoto.publicId);
        }
        if (caseItem.afterPhoto?.publicId) {
          publicIdsToDelete.push(caseItem.afterPhoto.publicId);
        }

        if (publicIdsToDelete.length > 0) {
          await deleteMultipleFromCloudinary(publicIdsToDelete);
        }
      }

      const updatedProfile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $pull: { previousCases: { _id: caseId } } },
        { new: true }
      ).populate("user", "-password");

      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }

   
  async updateDoctorProfileByUserId(userId, updateData, file) {
    try {
      const profile = await DoctorProfile.findOne({ user: userId });
      if (!profile) {
        throw new Error("Doctor profile not found");
      }
      return await this.updateDoctorProfile(profile._id, updateData, file);
    } catch (error) {
      throw error;
    }
  }

  // Get doctor statistics
  async getDoctorStatistics(profileId) {
    try {
      const profile = await DoctorProfile.findById(profileId).populate(
        "reviews"
      );

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      const totalReviews = profile.reviews.length;
      const averageRating =
        totalReviews > 0
          ? profile.reviews.reduce(
              (sum, review) => sum + (review.rating || 0),
              0
            ) / totalReviews
          : 0;

      return {
        totalCases: profile.previousCases.length,
        totalCertificates: profile.certificates.length,
        totalMaterials: profile.materials.length,
        totalReviews,
        averageRating: averageRating.toFixed(1),
        yearsOfExperience: profile.yearsOfExperience,
        specializations: profile.specialization,
      };
    } catch (error) {
      throw error;
    }
  }

  // Add office hours
  async addOfficeHours(profileId, officeHoursData) {
    try {
      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $push: { officeHours: officeHoursData } },
        { new: true, runValidators: true }
      ).populate("user", "-password");

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Remove office hours
  async removeOfficeHours(profileId, officeHoursId) {
    try {
      const profile = await DoctorProfile.findByIdAndUpdate(
        profileId,
        { $pull: { officeHours: { _id: officeHoursId } } },
        { new: true }
      ).populate("user", "-password");

      if (!profile) {
        throw new Error("Doctor profile not found");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to extract public ID from Cloudinary URL
  extractPublicId(url) {
    try {
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      return null;
    }
  }
}

export default new DoctorProfileService();
