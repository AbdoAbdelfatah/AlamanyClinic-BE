import Appointment from "../../models/appointment.model.js";
import DoctorProfile from "../../models/doctorProfile.model.js";
import Review from "../../models/review.model.js";
import mongoose from "mongoose";
import { ErrorClass } from "../../utils/errorClass.util.js";

class AppointmentService {
  // Get all doctors for selection
  async getAllDoctors() {
    const doctors = await DoctorProfile.find(
      {},
      "firstName lastName email specialization picture",
    ).sort({ firstName: 1 });

    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: "$doctorProfile",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = ratingStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = {
        averageRating: Number(stat.averageRating.toFixed(1)),
        totalReviews: stat.totalReviews,
      };
      return acc;
    }, {});

    return doctors.map((doctor) => ({
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      fullName: `${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      specialization: doctor.specialization,
      picture: doctor.picture,
      overallRating: ratingMap[doctor._id.toString()] || {
        averageRating: 0,
        totalReviews: 0,
      },
    }));
  }

  // Get specific doctor's office hours
  async getDoctorOfficeHours(doctorId) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new ErrorClass(
        "Invalid doctor ID",
        400,
        null,
        "AppointmentService#getDoctorOfficeHours",
      );
    }

    const doctor = await DoctorProfile.findById(
      doctorId,
      "officeHours firstName lastName",
    );

    if (!doctor) {
      throw new ErrorClass(
        "Doctor not found",
        404,
        null,
        "AppointmentService#getDoctorOfficeHours",
      );
    }

    return {
      doctorId: doctor._id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      officeHours: doctor.officeHours || [],
    };
  }

  // Create a new appointment
  async createAppointment(appointmentData) {
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
      throw new ErrorClass(
        "All required fields must be provided",
        400,
        null,
        "AppointmentService#createAppointment",
      );
    }

    const doctor = await DoctorProfile.findById(doctorProfileId);
    if (!doctor) {
      throw new ErrorClass(
        "Doctor profile not found",
        404,
        null,
        "AppointmentService#createAppointment",
      );
    }

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

    await appointment.populate(
      "doctorProfileId",
      "firstName lastName specialization",
    );

    return appointment;
  }

  // Get all appointments (admin only)
  async getAllAppointments(options = {}) {
    const { page = 1, limit = 10, status, doctorId } = options;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new ErrorClass(
          "Invalid doctor ID",
          400,
          null,
          "AppointmentService#getAllAppointments",
        );
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
  }

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new ErrorClass(
        "Invalid appointment ID",
        400,
        null,
        "AppointmentService#getAppointmentById",
      );
    }

    const appointment = await Appointment.findById(appointmentId).populate(
      "doctorProfileId",
      "firstName lastName specialization email",
    );

    if (!appointment) {
      throw new ErrorClass(
        "Appointment not found",
        404,
        null,
        "AppointmentService#getAppointmentById",
      );
    }

    return appointment;
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new ErrorClass(
        "Invalid appointment ID",
        400,
        null,
        "AppointmentService#updateAppointmentStatus",
      );
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new ErrorClass(
        `Status must be one of: ${validStatuses.join(", ")}`,
        400,
        null,
        "AppointmentService#updateAppointmentStatus",
      );
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true, runValidators: true },
    ).populate("doctorProfileId", "firstName lastName specialization");

    if (!appointment) {
      throw new ErrorClass(
        "Appointment not found",
        404,
        null,
        "AppointmentService#updateAppointmentStatus",
      );
    }

    return appointment;
  }

  // Delete appointment
  async deleteAppointment(appointmentId) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new ErrorClass(
        "Invalid appointment ID",
        400,
        null,
        "AppointmentService#deleteAppointment",
      );
    }

    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      throw new ErrorClass(
        "Appointment not found",
        404,
        null,
        "AppointmentService#deleteAppointment",
      );
    }

    return appointment;
  }
}

export default new AppointmentService();
