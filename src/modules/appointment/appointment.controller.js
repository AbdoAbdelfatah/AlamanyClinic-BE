import appointmentService from "./appointment.service.js";

class AppointmentController {
  // Get all doctors for selection (public)
  async getAllDoctors(req, res) {
    try {
      const doctors = await appointmentService.getAllDoctors();

      res.status(200).json({
        success: true,
        message: "Doctors retrieved successfully",
        data: doctors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch doctors",
      });
    }
  }

  // Get specific doctor's office hours (public)
  async getDoctorOfficeHours(req, res) {
    try {
      const { doctorId } = req.params;

      const officeHours =
        await appointmentService.getDoctorOfficeHours(doctorId);

      res.status(200).json({
        success: true,
        message: "Office hours retrieved successfully",
        data: officeHours,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to fetch office hours",
      });
    }
  }

  // Create a new appointment (public)
  async createAppointment(req, res) {
    try {
      const appointmentData = req.body;

      const appointment =
        await appointmentService.createAppointment(appointmentData);

      res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        data: appointment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create appointment",
      });
    }
  }

  // Get all appointments (admin only)
  async getAllAppointments(req, res) {
    try {
      const { page = 1, limit = 10, status, doctorId } = req.query;

      const result = await appointmentService.getAllAppointments({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        doctorId,
      });

      res.status(200).json({
        success: true,
        data: result.appointments,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch appointments",
      });
    }
  }

  // Get appointment by ID (admin only)
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;

      const appointment = await appointmentService.getAppointmentById(id);

      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Appointment not found",
      });
    }
  }

  // Update appointment status (admin only)
  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const appointment = await appointmentService.updateAppointmentStatus(
        id,
        status,
      );

      res.status(200).json({
        success: true,
        message: "Appointment status updated successfully",
        data: appointment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update appointment",
      });
    }
  }

  // Delete appointment (admin only)
  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;

      await appointmentService.deleteAppointment(id);

      res.status(200).json({
        success: true,
        message: "Appointment deleted successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to delete appointment",
      });
    }
  }
}

export default new AppointmentController();
