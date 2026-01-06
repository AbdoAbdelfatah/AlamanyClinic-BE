import {
  registerUser,
  loginUser,
  verifyUserEmail,
  refreshUserToken,
  logoutUser,
  getUser,
  getUserByEmail,
  registerWithGmail,
  loginWithGmail,
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

  successResponse(
    res,
    201,
    "Registration successful. Please verify your email.",
    {
      user: result.user,
    }
  );
};

// Login with email/password
export const login = async (req, res) => {
  const { email, password } = req.body;
  const userExist = await getUserByEmail(email);
  if (userExist && !userExist.isEmailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  const { user, accessToken, refreshToken } = await loginUser(email, password);

  // Set refresh token in httpOnly cookie
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

// Verify email
export const verifyUserEmailController = async (req, res) => {
  const { token } = req.body;

  await verifyUserEmail(token);

  successResponse(res, 200, "Email verified successfully");
};

// Google OAuth
// export const googleAuth = async (req, res, next) => {
//   const { token } = req.body;

//   const { user, accessToken, refreshToken } = await authenticateWithGoogle(
//     token
//   );

//   // Set refresh token in httpOnly cookie
//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   });

//   successResponse(res, 200, "Google authentication successful", {
//     user,
//     accessToken,
//   });
// };

// Refresh access token
export const refreshAccessToken = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  console.log("Old Refresh Token:", oldRefreshToken);
  const { accessToken, refreshToken } = await refreshUserToken(oldRefreshToken);

  // Set new refresh token in httpOnly cookie
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

  // Clear refresh token cookie
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

// Register with Gmail
export const registerWithGmailController = async (req, res) => {
  const { idToken } = req.body;

  const { user, accessToken, refreshToken } = await registerWithGmail(idToken);

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  successResponse(res, 201, "Registration with Gmail successful", {
    user,
    accessToken,
  });
};

// Login with Gmail
export const loginWithGmailController = async (req, res) => {
  const { idToken } = req.body;

  const { user, accessToken, refreshToken } = await loginWithGmail(idToken);

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  successResponse(res, 200, "Login with Gmail successful", {
    user,
    accessToken,
  });
};
