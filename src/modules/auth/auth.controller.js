import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  getUser,
} from "./auth.service.js";
import { successResponse } from "../../utils/response.util.js";

// Register with email/password
export const register = async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  const result = await registerUser({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
  });

  successResponse(res, 201, "Registration successful", {
    user: result.user,
  });
};

// Login with email/password
export const login = async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser(email, password);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  successResponse(res, 200, "Login successful", {
    user,
    accessToken,
  });
};

// Refresh access token
export const refreshAccessToken = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await refreshUserToken(oldRefreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  successResponse(res, 200, "Token refreshed successfully", {
    accessToken,
  });
};

// Logout
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  await logoutUser(req.user.id, refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  successResponse(res, 200, "Logout successful");
};

// Get current user
export const getCurrentUser = async (req, res) => {
  const user = await getUser(req.user.id);

  successResponse(res, 200, "User retrieved successfully", { user });
};
