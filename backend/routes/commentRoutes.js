import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
} from "../controllers/commentController.js";

const router = express.Router();

// 💬 Comment Routes
router.post("/", protect, createComment);
router.get("/review/:reviewId", getComments);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, likeComment);

export default router;
