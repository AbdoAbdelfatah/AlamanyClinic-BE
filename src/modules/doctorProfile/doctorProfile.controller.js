import doctorProfileService from "./doctorProfile.service.js";

class DoctorProfileController {
  // Create doctor profile (admin only)
  async createDoctorProfile(req, res) {
    try {
      const profileData = req.body;
      const file = req.file; // Single file upload for profile picture

      const profile = await doctorProfileService.createDoctorProfile(
        profileData,
        file,
      );

      res.status(201).json({
        success: true,
        message: "Doctor profile created successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create doctor profile",
      });
    }
  }

  // Get all doctor profiles
  async getAllDoctorProfiles(req, res) {
    try {
      const filters = {
        specialization: req.query.specialization,
        minExperience: req.query.minExperience,
        materials: req.query.materials,
        search: req.query.search,
      };

      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch doctor profiles",
      });
    }
  }

  // Get doctor profile by ID
  async getDoctorProfileById(req, res) {
    try {
      const { id } = req.params;
      const profile = await doctorProfileService.getDoctorProfileById(id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Doctor profile not found",
      });
    }
  }

  // Update doctor profile by ID (admin only)
  async updateDoctorProfile(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update profile",
      });
    }
  }

  // Update current doctor profile (authenticated user)
  async updateMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update profile",
      });
    }
  }

  // Delete doctor profile (admin only)
  async deleteDoctorProfile(req, res) {
    try {
      const { id } = req.params;
      await doctorProfileService.deleteDoctorProfile(id);

      res.status(200).json({
        success: true,
        message: "Doctor profile deleted successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to delete doctor profile",
      });
    }
  }

  // Add certificate (admin only)
  async addCertificate(req, res) {
    try {
      const { id } = req.params;
      const certificateData = req.body;
      const file = req.file; // Certificate file

      const profile = await doctorProfileService.addCertificate(
        id,
        certificateData,
        file,
      );

      res.status(200).json({
        success: true,
        message: "Certificate added successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add certificate",
      });
    }
  }

  // Remove certificate (admin only)
  async removeCertificate(req, res) {
    try {
      const { id, certificateId } = req.params;

      const profile = await doctorProfileService.removeCertificate(
        id,
        certificateId,
      );

      res.status(200).json({
        success: true,
        message: "Certificate removed successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to remove certificate",
      });
    }
  }

  // Add material (admin only)
  async addMaterial(req, res) {
    try {
      const { id } = req.params;
      const materialData = req.body;
      const file = req.file; // Certificate file

      const profile = await doctorProfileService.addMaterial(
        id,
        materialData,
        file,
      );

      res.status(200).json({
        success: true,
        message: "Material added successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add material",
      });
    }
  }

  // Remove material (admin only)
  async removeMaterial(req, res) {
    try {
      const { id, materialId } = req.params;

      const profile = await doctorProfileService.removeMaterial(id, materialId);

      res.status(200).json({
        success: true,
        message: "Material removed successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to remove material",
      });
    }
  }

  // Add previous case (admin only)
  async addPreviousCase(req, res) {
    try {
      const { id } = req.params;
      const caseData = req.body;
      const files = req.files; // Multiple files: beforePhoto and afterPhoto

      const profile = await doctorProfileService.addPreviousCase(
        id,
        caseData,
        files,
      );

      res.status(200).json({
        success: true,
        message: "Previous case added successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add previous case",
      });
    }
  }

  // Remove previous case (admin only)
  async removePreviousCase(req, res) {
    try {
      const { id, caseId } = req.params;

      const profile = await doctorProfileService.removePreviousCase(id, caseId);

      res.status(200).json({
        success: true,
        message: "Previous case removed successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to remove previous case",
      });
    }
  }

  // Get doctor statistics
  async getDoctorStatistics(req, res) {
    try {
      const { id } = req.params;
      const statistics = await doctorProfileService.getDoctorStatistics(id);

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to fetch statistics",
      });
    }
  }

  // Add office hours (admin only)
  async addOfficeHours(req, res) {
    try {
      const { id } = req.params;
      const officeHoursData = req.body;

      const profile = await doctorProfileService.addOfficeHours(
        id,
        officeHoursData,
      );

      res.status(200).json({
        success: true,
        message: "Office hours added successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add office hours",
      });
    }
  }

  // Remove office hours (admin only)
  async removeOfficeHours(req, res) {
    try {
      const { id, officeHoursId } = req.params;

      const profile = await doctorProfileService.removeOfficeHours(
        id,
        officeHoursId,
      );

      res.status(200).json({
        success: true,
        message: "Office hours removed successfully",
        data: profile,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to remove office hours",
      });
    }
  }
}

export default new DoctorProfileController();
