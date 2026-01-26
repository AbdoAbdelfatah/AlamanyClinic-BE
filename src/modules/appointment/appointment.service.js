import Appointment from "../../models/appointment.model.js";
import DoctorProfile from "../../models/doctorProfile.model.js";
import mongoose from "mongoose";

class AppointmentService {
  // Get all doctors for selection
  async getAllDoctors() {
    try {
      const doctors = await DoctorProfile.find(
        {},
        "firstName lastName email specialization picture",
      ).sort({ firstName: 1 });

      // Map to include full name
      const doctorsWithFullName = doctors.map((doctor) => ({
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        fullName: `${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        specialization: doctor.specialization,
        picture: doctor.picture,
      }));

      return doctorsWithFullName;
    } catch (error) {
      throw error;
    }
  }

  // Get specific doctor's office hours
  async getDoctorOfficeHours(doctorId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new Error("Invalid doctor ID");
      }

      const doctor = await DoctorProfile.findById(
        doctorId,
        "officeHours firstName lastName",
      );

      if (!doctor) {
        throw new Error("Doctor not found");
      }

      return {
        doctorId: doctor._id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        officeHours: doctor.officeHours || [],
      };
    } catch (error) {
      throw error;
    }
  }

  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      const {
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        gender,
        appointmentDate,
        notes,
        email,
        doctorProfileId,
      } = appointmentData;

      // Validate required fields
      if (
        !firstName ||
        !lastName ||
        !dateOfBirth ||
        !phoneNumber ||
        !gender ||
        !appointmentDate ||
        !email ||
        !doctorProfileId
      ) {
        throw new Error("All required fields must be provided");
      }

      // Validate doctor exists
      const doctor = await DoctorProfile.findById(doctorProfileId);
      if (!doctor) {
        throw new Error("Doctor profile not found");
      }

      // Create appointment
      const appointment = new Appointment({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        phoneNumber: phoneNumber.trim(),
        gender,
        appointmentDate,
        notes: notes ? notes.trim() : "",
        email: email.trim(),
        doctorProfileId,
        status: "pending",
      });

      await appointment.save();

      // Populate doctor info
      await appointment.populate(
        "doctorProfileId",
        "firstName lastName specialization",
      );

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  // Get all appointments (admin only)
  async getAllAppointments(options = {}) {
    try {
      const { page = 1, limit = 10, status, doctorId } = options;

      const query = {};

      if (status) {
        query.status = status;
      }

      if (doctorId) {
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
          throw new Error("Invalid doctor ID");
        }
        query.doctorProfileId = doctorId;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Appointment.countDocuments(query);

      const appointments = await Appointment.find(query)
        .populate("doctorProfileId", "firstName lastName specialization")
        .sort({ appointmentDate: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      return {
        appointments,
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

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new Error("Invalid appointment ID");
      }

      const appointment = await Appointment.findById(appointmentId).populate(
        "doctorProfileId",
        "firstName lastName specialization email",
      );

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    try {
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new Error("Invalid appointment ID");
      }

      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
      }

      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status },
        { new: true, runValidators: true },
      ).populate("doctorProfileId", "firstName lastName specialization");

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  // Delete appointment
  async deleteAppointment(appointmentId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new Error("Invalid appointment ID");
      }

      const appointment = await Appointment.findByIdAndDelete(appointmentId);

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      return appointment;
    } catch (error) {
      throw error;
    }
  }
}

export default new AppointmentService();
