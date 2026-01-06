import { verifyAccessToken } from "../utils/jwt.util.js";
import { ErrorClass } from "../utils/errorClass.util.js";
import User from "../models/user.model.js";

// Protect routes - verify access token
export const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ErrorClass(
        "Not authorized to access this route",
        401,
        null,
        "protect"
      );
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from token
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ErrorClass("User not found", 404, null, "protect");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ErrorClass("Account is deactivated", 403, null, "protect");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorClass(
          `User role '${req.user.role}' is not authorized to access this route`,
          403,
          null,
          "authorize"
        )
      );
    }
    next();
  };
};

// Verify email middleware
export const verifyEmail = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(
      new ErrorClass(
        "Please verify your email to access this resource",
        403,
        null,
        "verifyEmail"
      )
    );
  }
  next();
};

// Check doctor verification status
export const checkDoctorVerification = (req, res, next) => {
  console.log("User role and status:", req.user);
  if (
    (req.user.role === "doctor" &&
      req.user.verificationStatus !== "approved") ||
    req.user.role !== "doctor"
  ) {
    return next(
      new ErrorClass(
        "Your doctor profile is not verified yet",
        403,
        { verificationStatus: req.user.verificationStatus },
        "checkDoctorVerification"
      )
    );
  }
  next();
};
