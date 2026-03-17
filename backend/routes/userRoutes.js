import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../utils/fileUpload.js";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getMyProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  getCoinWallet,
  getLeaderboard,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/me", protect, getMyProfile);
router.get("/profile/:id", getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/profile/picture", protect, upload.single("image"), uploadProfilePicture);

// Following system
router.post("/:id/follow", protect, toggleFollow);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

// 🪙 Coin Wallet
router.get("/wallet/coins", protect, getCoinWallet);

// 🏆 Leaderboard (public)
router.get("/leaderboard", getLeaderboard);

export default router;
