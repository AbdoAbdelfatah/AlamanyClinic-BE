import User from "../../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import {
  generateTokenPair,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.util.js";
import { sendVerificationEmail } from "../../utils/mail.util.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import crypto from "crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register user with email/password
export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, phone, role } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorClass("Email already registered", 400, null, "registerUser");
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: role || "patient",
    isEmailVerified: false,
  });

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Store hashed token in user (you may want to add this field to schema)
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Send verification email
  await sendVerificationEmail(email, verificationToken, firstName);

  // Return user without password
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.emailVerificationToken;
  delete userResponse.emailVerificationExpires;

  return { user: userResponse };
};

// Login user with email/password
export const loginUser = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw new ErrorClass(
      "Email and password are required",
      400,
      null,
      "loginUser"
    );
  }

  // Find user with password field
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ErrorClass("Invalid credentials", 401, null, "loginUser");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ErrorClass("Account is deactivated", 403, null, "loginUser");
  }
  if (!user.isEmailVerified) {
    throw new ErrorClass(
      "Please verify your email to login",
      403,
      null,
      "loginUser"
    );
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ErrorClass("Invalid credentials", 401, null, "loginUser");
  }

  // Generate tokens
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const { accessToken, refreshToken } = generateTokenPair(payload);

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save();

  // Return user without sensitive data
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return { user: userResponse, accessToken, refreshToken };
};

// Verify email
export const verifyUserEmail = async (token) => {
  // Hash the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ErrorClass(
      "Invalid or expired verification token",
      400,
      null,
      "verifyUserEmail"
    );
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { message: "Email verified successfully" };
};

// Authenticate with Google
export const authenticateWithGoogle = async (idToken) => {
  if (!idToken) {
    throw new ErrorClass(
      "Google token is required",
      400,
      null,
      "authenticateWithGoogle"
    );
  }

  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const {
      email,
      given_name,
      family_name,
      sub: googleId,
      email_verified,
    } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        firstName: given_name,
        lastName: family_name,
        googleId,
        isEmailVerified: email_verified,
        role: "patient", // Default role for Google users
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.isEmailVerified = email_verified || user.isEmailVerified;
      await user.save();
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ErrorClass(
        "Account is deactivated",
        403,
        null,
        "authenticateWithGoogle"
      );
    }

    // Generate tokens
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Return user without sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return { user: userResponse, accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ErrorClass) throw error;
    throw new ErrorClass(
      "Google authentication failed",
      401,
      error.message,
      "authenticateWithGoogle"
    );
  }
};

// Refresh token rotation
export const refreshUserToken = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw new ErrorClass(
      "Refresh token is required",
      401,
      null,
      "refreshUserToken"
    );
  }

  // Verify old refresh token
  const decoded = verifyRefreshToken(oldRefreshToken);

  // Find user and check if refresh token matches
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== oldRefreshToken) {
    throw new ErrorClass(
      "Invalid refresh token",
      401,
      null,
      "refreshUserToken"
    );
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ErrorClass(
      "Account is deactivated",
      403,
      null,
      "refreshUserToken"
    );
  }

  // Generate new tokens (refresh token rotation)
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Save new refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

// Logout user
export const logoutUser = async (userId, refreshToken) => {
  // Remove refresh token from database
  const user = await User.findById(userId);
  if (user && user.refreshToken === refreshToken) {
    user.refreshToken = undefined;
    await user.save();
  }

  return { message: "Logout successful" };
};

// Get user by ID
export const getUser = async (userId) => {
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ErrorClass("User not found", 404, null, "getUser");
  }

  return user;
};
