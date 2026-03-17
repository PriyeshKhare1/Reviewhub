import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import {
  getAllReviewsAdmin,
  verifyProof,
  toggleHideReview,
  deleteReviewAdmin,
  banUser,
  unbanUser,
  getAllUsers,
  getDashboardStats,
  changeUserRole,
} from "../controllers/adminController.js";

const router = express.Router();

/* ================= ADMIN ONLY ROUTES ================= */
router.use(protect, adminOnly);

// Dashboard stats
router.get("/stats", getDashboardStats);

// Review management
router.get("/reviews", getAllReviewsAdmin);
router.patch("/reviews/:id/verify-proof", verifyProof);
router.patch("/reviews/:id/toggle-hide", toggleHideReview);
router.delete("/reviews/:id", deleteReviewAdmin);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId/ban", banUser);
router.patch("/users/:userId/unban", unbanUser);
router.patch("/users/:userId/role", changeUserRole);

export default router;
