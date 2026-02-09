import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "doctor_profiles/pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto" },
    ],
  },
});

// Storage configuration for certificates
const certificateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "doctor_profiles/certificates",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

// Storage configuration for case photos (before/after)
const casePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "doctor_profiles/cases",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto" },
    ],
  },
});

// Storage configuration for blog media (images + videos)
const blogMediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog/media",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "webm", "mov"],
    resource_type: "auto", // Detects image vs video automatically
  },
});

// Storage configuration for blog cover image
const blogCoverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog/covers",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, height: 630, crop: "fill" },
      { quality: "auto" },
    ],
  },
});

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// Delete multiple files from Cloudinary
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error("Error deleting multiple files from Cloudinary:", error);
    throw error;
  }
};

export {
  cloudinary,
  profilePictureStorage,
  certificateStorage,
  casePhotoStorage,
  blogMediaStorage,
  blogCoverStorage,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};
