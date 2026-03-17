import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkBan } from "../middleware/roleMiddleware.js";
import { upload } from "../utils/fileUpload.js";

import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getMyReviews,
  getFollowingReviews,
  toggleLike,
  reportReview,
  toggleHelpful,
  toggleBookmark,
  getBookmarkedReviews,
  getReviewAnalytics,
  searchReviewsAdvanced,
  getPopularTags,
  getMyDrafts,
  publishDraft,
  getEditHistory,
  getCategoryStats,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/search/advanced", searchReviewsAdvanced);
router.get("/tags/popular", getPopularTags);
router.get("/categories/stats", getCategoryStats);
router.get("/my", protect, getMyReviews);
router.get("/following", protect, getFollowingReviews);
router.get("/drafts", protect, getMyDrafts);
router.get("/saved/bookmarks", protect, getBookmarkedReviews);
router.get("/:id", getReviewById);
router.get("/:id/analytics", protect, getReviewAnalytics);
router.get("/:id/history", protect, getEditHistory);

router.post("/", protect, checkBan, upload.array("images", 5), createReview);
router.put("/:id", protect, checkBan, updateReview);
router.put("/:id/publish", protect, publishDraft);
router.delete("/:id", protect, deleteReview);

// Interactions
router.post("/:id/like", protect, toggleLike);
router.post("/:id/report", protect, reportReview);
router.post("/:id/helpful", protect, toggleHelpful);
router.post("/:id/bookmark", protect, toggleBookmark);

export default router;
