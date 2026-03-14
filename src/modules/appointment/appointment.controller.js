import appointmentService from "./appointment.service.js";

class AppointmentController {
  // Get all doctors for selection (public)
  getAllDoctors = async (req, res) => {
    const doctors = await appointmentService.getAllDoctors();
    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors,
    });
  };

  // Get specific doctor's office hours (public)
  getDoctorOfficeHours = async (req, res) => {
    const { doctorId } = req.params;
    const officeHours = await appointmentService.getDoctorOfficeHours(doctorId);
    res.status(200).json({
      success: true,
      message: "Office hours retrieved successfully",
      data: officeHours,
    });
  };

  // Create a new appointment (public)
  createAppointment = async (req, res) => {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  };

  // Get all appointments (admin only)
  getAllAppointments = async (req, res) => {
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
  };

  // Get appointment by ID (admin only)
  getAppointmentById = async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id,
    );
    res.status(200).json({
      success: true,
      data: appointment,
    });
  };

  // Update appointment status (admin only)
  updateAppointmentStatus = async (req, res) => {
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id,
      req.body.status,
    );
    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: appointment,
    });
  };

  // Delete appointment (admin only)
  deleteAppointment = async (req, res) => {
    await appointmentService.deleteAppointment(req.params.id);
    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  };
}

export default new AppointmentController();
