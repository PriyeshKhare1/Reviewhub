import multer from "multer";
import path from "path";

/* ================= MULTER MEMORY STORAGE ================= */
const storage = multer.memoryStorage();

/* ================= FILE FILTER (IMAGES ONLY) ================= */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false);
  }
};

/* ================= MULTER CONFIG ================= */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5, // Max 5 images
  },
});
