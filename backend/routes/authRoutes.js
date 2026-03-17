import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  googleAuth,
  getSessions,
  revokeSession,
  revokeAllSessions,
  generate2FASecret,
  enable2FA,
  disable2FA,
  verify2FALogin,
  get2FAStatus,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/resend-verification", resendVerification);

// Email verification
router.get("/verify-email/:token", verifyEmail);

// 🔐 Get logged-in user
router.get("/me", protect, getMe);

// 🔑 Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);

// 🔐 Google OAuth
router.post("/google", googleAuth);

// 📱 Session Management
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:sessionId", protect, revokeSession);
router.delete("/sessions", protect, revokeAllSessions);

// 🔐 Two-Factor Authentication
router.get("/2fa/status", protect, get2FAStatus);
router.post("/2fa/generate", protect, generate2FASecret);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/disable", protect, disable2FA);
router.post("/2fa/verify", verify2FALogin);

export default router;
