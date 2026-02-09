import multer from "multer";
import {
  profilePictureStorage,
  certificateStorage,
  casePhotoStorage,
  blogCoverStorage,
  blogMediaStorage,
} from "../config/cloudinary.config.js";

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, JPEG, PNG and WEBP are allowed."),
      false
    );
  }
};

// File filter for blog media (images and videos)
const imageVideoFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime", // .mov
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images (JPG, PNG, WEBP) and videos (MP4, WEBM, MOV) are allowed."
      ),
      false
    );
  }
};

// File filter for certificates (images and PDFs)
const certificateFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, JPEG, PNG and PDF are allowed."),
      false
    );
  }
};

// Multer upload instances
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadCertificate = multer({
  storage: certificateStorage,
  fileFilter: certificateFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const uploadCasePhotos = multer({
  storage: casePhotoStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

const uploadBlogCover = multer({
  storage: blogCoverStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for cover
  },
});

const uploadBlogMedia = multer({
  storage: blogMediaStorage,
  fileFilter: imageVideoFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "File size is too large. Max: 5MB for images/cover, 10MB for certificates, 50MB for blog videos.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field in file upload.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed.",
    });
  }

  next();
};

export {
  uploadProfilePicture,
  uploadCertificate,
  uploadCasePhotos,
  uploadBlogCover,
  uploadBlogMedia,
  handleMulterError,
};
