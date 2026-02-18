import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/**
 * Cloudinary Configuration
 * Manages image/file uploads to Cloudinary CDN with different storage presets
 * for various use cases (doctor profiles, certificates, case photos, blog media)
 */

// ==================== Configuration Constants ====================
const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const FOLDER_STRUCTURE = {
  DOCTOR_PICTURES: "doctor_profiles/pictures",
  DOCTOR_CERTIFICATES: "doctor_profiles/certificates",
  DOCTOR_CASES: "doctor_profiles/cases",
  MATERIALS: "doctor_profiles/materials",
  BLOG_MEDIA: "blog/media",
  BLOG_COVERS: "blog/covers",
};

const FILE_TRANSFORMATIONS = {
  PROFILE_PICTURE: [
    { width: 500, height: 500, crop: "fill", gravity: "face" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
  CASE_PHOTO: [
    { width: 1200, height: 1200, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
  BLOG_COVER: [
    { width: 1200, height: 630, crop: "fill" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
};

// ==================== Cloudinary Initialization ====================
const initializeCloudinary = () => {
  // Validate environment variables
  if (
    !CLOUDINARY_CONFIG.cloud_name ||
    !CLOUDINARY_CONFIG.api_key ||
    !CLOUDINARY_CONFIG.api_secret
  ) {
    console.error(
      "❌ Cloudinary configuration is incomplete. Please check your environment variables.",
    );
    process.exit(1);
  }

  try {
    cloudinary.config(CLOUDINARY_CONFIG);
    console.log("✅ Cloudinary configured successfully");
  } catch (error) {
    console.error("❌ Failed to configure Cloudinary:", error.message);
    process.exit(1);
  }
};

initializeCloudinary();

// ==================== Storage Configurations ====================

/**
 * Profile Picture Storage
 * Used for doctor profile pictures with face detection
 */
const profilePictureStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDER_STRUCTURE.DOCTOR_PICTURES,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: FILE_TRANSFORMATIONS.PROFILE_PICTURE,
    resource_type: "auto",
  },
});

/**
 * Certificate Storage
 * Supports images and PDFs for certificates/credentials
 */
const certificateStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDER_STRUCTURE.DOCTOR_CERTIFICATES,
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

/**
 * Material Storage
 * For storing dental material images/PDFs
 */
const materialStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDER_STRUCTURE.MATERIALS,
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    resource_type: "auto",
  },
});

/**
 * Case Photo Storage
 * For before/after treatment photos
 */
const casePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDER_STRUCTURE.DOCTOR_CASES,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: FILE_TRANSFORMATIONS.CASE_PHOTO,
    resource_type: "auto",
  },
});

/**
 * Blog Media Storage
 * Supports both images and videos
 */
const blogMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDER_STRUCTURE.BLOG_MEDIA,
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "webm", "mov"],
    resource_type: "auto",
  },
});

/**
 * Blog Cover Storage
 * For blog post cover images with optimal dimensions
 */
const blogCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: FOLDER_STRUCTURE.BLOG_COVERS,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: FILE_TRANSFORMATIONS.BLOG_COVER,
    resource_type: "auto",
  },
});

// ==================== File Deletion Functions ====================

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null if extraction fails
 */
const extractPublicId = (url) => {
  try {
    if (!url || typeof url !== "string") return null;
    // Example URL: https://res.cloudinary.com/cloud/image/upload/v123/folder/filename.jpg
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error("Error extracting public ID:", error.message);
    return null;
  }
};

/**
 * Delete a single file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise<Object>} Cloudinary response
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId || typeof publicId !== "string") {
      throw new Error("Invalid public ID provided");
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      console.log(`✅ File deleted successfully: ${publicId}`);
      return result;
    }

    throw new Error(`Failed to delete file: ${result.result}`);
  } catch (error) {
    console.error(
      `❌ Error deleting from Cloudinary (${publicId}):`,
      error.message,
    );
    throw error;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array<string>} publicIds - Array of public IDs to delete
 * @returns {Promise<Object>} Cloudinary response
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      throw new Error("Invalid public IDs array provided");
    }

    const validIds = publicIds.filter(
      (id) => typeof id === "string" && id.trim(),
    );

    if (validIds.length === 0) {
      console.warn("No valid public IDs to delete");
      return { deleted: {} };
    }

    const result = await cloudinary.api.delete_resources(validIds);
    console.log(`✅ ${validIds.length} files deleted from Cloudinary`);
    return result;
  } catch (error) {
    console.error(
      "❌ Error deleting multiple files from Cloudinary:",
      error.message,
    );
    throw error;
  }
};

// ==================== Exports ====================
export {
  cloudinary,
  profilePictureStorage,
  certificateStorage,
  materialStorage,
  casePhotoStorage,
  blogMediaStorage,
  blogCoverStorage,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  extractPublicId,
  FOLDER_STRUCTURE,
  FILE_TRANSFORMATIONS,
};
