import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must not exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name must not exceed 50 characters"],
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age must be positive"],
      max: [150, "Age must be realistic"],
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters"],
      maxlength: [200, "Address must not exceed 200 characters"],
    },

    occupation: {
      type: String,
      required: [true, "Occupation is required"],
      trim: true,
      maxlength: [100, "Occupation must not exceed 100 characters"],
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
    },

    // Medical History
    medicalHistory: {
      aidsHivPositive: { type: Boolean, default: false },
      artificialHeartValve: { type: Boolean, default: false },
      cancer: { type: Boolean, default: false },
      diabetes: { type: Boolean, default: false },
      thyroidDiseases: { type: Boolean, default: false },
      anemia: { type: Boolean, default: false },
      asthma: { type: Boolean, default: false },
      chemoRadioTherapy: { type: Boolean, default: false },
      bloodPressure: { type: Boolean, default: false },
      psychiatricIllness: { type: Boolean, default: false },
      heartFailure: { type: Boolean, default: false },
      liverDiseases: { type: Boolean, default: false },
      bleedingDisorder: { type: Boolean, default: false },
      kidneyDiseases: { type: Boolean, default: false },
      virusABC: { type: Boolean, default: false },
    },

    // Allergies
    allergies: {
      aspirin: { type: Boolean, default: false },
      penicillin: { type: Boolean, default: false },
      acrylic: { type: Boolean, default: false },
      localAnesthesia: { type: Boolean, default: false },
      eugenol: { type: Boolean, default: false },
      metal: { type: Boolean, default: false },
      latex: { type: Boolean, default: false },
      sulfaDrugs: { type: Boolean, default: false },
      others: { type: String, trim: true, maxlength: 500 },
    },

    // For Women
    forWomen: {
      pregnant: { type: Boolean, default: null },
      nursing: { type: Boolean, default: null },
    },

    // Habits
    habits: {
      smoking: { type: Boolean, default: false },
      bruxism: { type: Boolean, default: false },
      alcoholic: { type: Boolean, default: false },
      others: { type: String, trim: true, maxlength: 500 },
    },

    // Agreement
    agreeToTerms: {
      type: Boolean,
      required: [true, "Agreement to terms is required"],
      validate: {
        validator: function (value) {
          return value === true;
        },
        message: "You must agree to the terms and conditions",
      },
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
appointmentSchema.index({ phoneNumber: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ userId: 1 });

// Virtual for full name
appointmentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if patient has any critical conditions
appointmentSchema.methods.hasCriticalConditions = function () {
  const critical = [
    "aidsHivPositive",
    "cancer",
    "heartFailure",
    "chemoRadioTherapy",
  ];

  return critical.some((condition) => this.medicalHistory[condition]);
};

// Method to get all active allergies
appointmentSchema.methods.getActiveAllergies = function () {
  const allergies = [];

  for (const [key, value] of Object.entries(this.allergies.toObject())) {
    if (key !== "others" && value === true) {
      allergies.push(key);
    }
  }

  if (this.allergies.others) {
    allergies.push(this.allergies.others);
  }

  return allergies;
};

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
