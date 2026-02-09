import User from "../../models/user.model.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.util.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

// Register user with email/password (admin only)
export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, phone, role } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorClass("Email already registered", 400, null, "registerUser");
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: role || "admin",
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse };
};

// Login user with email/password
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new ErrorClass(
      "Email and password are required",
      400,
      null,
      "loginUser"
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ErrorClass("Invalid credentials", 401, null, "loginUser");
  }

  if (!user.isActive) {
    throw new ErrorClass("Account is deactivated", 403, null, "loginUser");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ErrorClass("Invalid credentials", 401, null, "loginUser");
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const { accessToken, refreshToken } = generateTokenPair(payload);

  user.refreshToken = refreshToken;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return { user: userResponse, accessToken, refreshToken };
};

export const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
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

  const decoded = verifyRefreshToken(oldRefreshToken);

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== oldRefreshToken) {
    throw new ErrorClass(
      "Invalid refresh token",
      401,
      null,
      "refreshUserToken"
    );
  }

  if (!user.isActive) {
    throw new ErrorClass(
      "Account is deactivated",
      403,
      null,
      "refreshUserToken"
    );
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

// Logout user
export const logoutUser = async (userId, refreshToken) => {
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
