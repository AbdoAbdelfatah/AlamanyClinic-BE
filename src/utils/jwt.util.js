import jwt from "jsonwebtoken";
import { ErrorClass } from "./errorClass.util.js";

// Generate Access Token (short-lived)
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
};

// Generate Refresh Token (long-lived)
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ErrorClass(
        "Access token expired",
        401,
        null,
        "verifyAccessToken",
      );
    }
    throw new ErrorClass(
      "Invalid access token",
      401,
      null,
      "verifyAccessToken",
    );
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ErrorClass(
        "Refresh token expired",
        401,
        null,
        "verifyRefreshToken",
      );
    }
    throw new ErrorClass(
      "Invalid refresh token",
      401,
      null,
      "verifyRefreshToken",
    );
  }
};

// Generate Token Pair
export const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};
