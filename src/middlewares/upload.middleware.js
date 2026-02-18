import multer from "multer";
import {
  profilePictureStorage,
  certificateStorage,
  materialStorage,
  casePhotoStorage,
  blogCoverStorage,
  blogMediaStorage,
} from "../config/cloudinary.config.js";

/**
 * Upload Middleware Configuration
 * Handles file validation, storage configuration, and error handling
 * for various upload scenarios throughout the application
 */

// ==================== Constants ====================
const FILE_LIMITS = {
  PROFILE_PICTURE: 5 * 1024 * 1024, // 5MB
  CERTIFICATE: 10 * 1024 * 1024, // 10MB
  MATERIAL: 10 * 1024 * 1024, // 10MB
  CASE_PHOTO: 5 * 1024 * 1024, // 5MB per file
  BLOG_COVER: 5 * 1024 * 1024, // 5MB
  BLOG_MEDIA: 50 * 1024 * 1024, // 50MB
};

const ALLOWED_MIME_TYPES = {
  IMAGE_ONLY: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  IMAGE_AND_PDF: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
  IMAGE_AND_VIDEO: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
};

// ==================== File Filters ====================

/**
 * Filter for profile pictures and case photos (images only)
 */
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.IMAGE_ONLY.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed.",
      ),
      false,
    );
  }
};

/**
 * Filter for certificates and materials (images and PDFs)
 */
const imageAndPdfFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.IMAGE_AND_PDF.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only JPG, JPEG, PNG, and PDF are allowed.",
      ),
      false,
    );
  }
};

/**
 * Filter for blog media (images and videos)
 */
const imageAndVideoFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.IMAGE_AND_VIDEO.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid media format. Only JPG, PNG, WEBP, MP4, WEBM, and MOV are allowed.",
      ),
      false,
    );
  }
};

// ==================== Multer Upload Instances ====================

/**
 * Upload single profile picture (500x500 max)
 */
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_LIMITS.PROFILE_PICTURE,
  },
});

/**
 * Upload single certificate or material document
 */
const uploadCertificate = multer({
  storage: certificateStorage,
  fileFilter: imageAndPdfFileFilter,
  limits: {
    fileSize: FILE_LIMITS.CERTIFICATE,
  },
});

/**
 * Upload single material document
 */
const uploadMaterial = multer({
  storage: materialStorage,
  fileFilter: imageAndPdfFileFilter,
  limits: {
    fileSize: FILE_LIMITS.MATERIAL,
  },
});

/**
 * Upload case photos (before/after)
 * Supports multiple files
 */
const uploadCasePhotos = multer({
  storage: casePhotoStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_LIMITS.CASE_PHOTO,
  },
});

/**
 * Upload blog cover image
 */
const uploadBlogCover = multer({
  storage: blogCoverStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_LIMITS.BLOG_COVER,
  },
});

/**
 * Upload blog media (images and videos)
 */
const uploadBlogMedia = multer({
  storage: blogMediaStorage,
  fileFilter: imageAndVideoFileFilter,
  limits: {
    fileSize: FILE_LIMITS.BLOG_MEDIA,
  },
});

// ==================== Error Handling ====================

/**
 * Centralized multer error handler
 * Provides consistent error responses for all upload failures
 */
const handleMulterError = (err, req, res, next) => {
  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    const errors = {
      LIMIT_FILE_SIZE: {
        status: 413,
        message: "File size exceeds the maximum limit",
      },
      LIMIT_FILE_COUNT: {
        status: 400,
        message: "Too many files uploaded",
      },
      LIMIT_UNEXPECTED_FILE: {
        status: 400,
        message: "Unexpected file field in request",
      },
      LIMIT_FIELD_KEY: {
        status: 400,
        message: "Field name is too long",
      },
      LIMIT_FIELD_VALUE: {
        status: 400,
        message: "Field value is too long",
      },
    };

    const error = errors[err.code] || {
      status: 400,
      message: err.message || "File upload failed",
    };

    return res.status(error.status).json({
      success: false,
      message: error.message,
      code: err.code,
    });
  }

  // Custom file filter errors
  if (err?.message?.includes("Invalid")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Other errors
  if (err) {
    console.error("❌ Upload middleware error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "File upload failed",
      ...(process.env.NODE_ENV === "development" && { error: err.toString() }),
    });
  }

  next();
};

/**
 * Wrapper to handle multer middleware errors properly
 * Ensures errors are caught and handled consistently
 */
const multerErrorWrapper = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        handleMulterError(err, req, res, next);
      } else {
        next();
      }
    });
  };
};

// ==================== File Validation Helpers ====================

/**
 * Validate file existence in request
 * @param {Object} req - Express request object
 * @param {string} fieldName - Name of the file field
 * @returns {boolean} True if file exists
 */
const validateFileExists = (req, fieldName) => {
  return req.file ? req.file[fieldName] !== undefined : false;
};

/**
 * Validate multiple files existence
 * @param {Object} req - Express request object
 * @param {string} fieldName - Name of the files field
 * @returns {boolean} True if files exist
 */
const validateFilesExist = (req, fieldName) => {
  return req.files ? req.files[fieldName]?.length > 0 : false;
};

// ==================== Exports ====================
export {
  uploadProfilePicture,
  uploadCertificate,
  uploadMaterial,
  uploadCasePhotos,
  uploadBlogCover,
  uploadBlogMedia,
  handleMulterError,
  multerErrorWrapper,
  validateFileExists,
  validateFilesExist,
  FILE_LIMITS,
  ALLOWED_MIME_TYPES,
};
