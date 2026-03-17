import Comment from "../models/Comment.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";

// 📝 Create Comment
export const createComment = async (req, res) => {
  try {
    const { content, reviewId, parentCommentId } = req.body;

    // Validate review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const comment = await Comment.create({
      content,
      user: req.user.id,
      review: reviewId,
      parentComment: parentCommentId || null,
    });

    // Update review comment count
    await Review.findByIdAndUpdate(reviewId, {
      $inc: { commentCount: 1 },
    });

    // Create notification for review owner
    if (review.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: review.user,
        sender: req.user.id,
        type: parentCommentId ? "reply" : "comment",
        review: reviewId,
        comment: comment._id,
        message: parentCommentId
          ? `${req.user.name} replied to your comment`
          : `${req.user.name} commented on your review`,
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "name profilePicture isEmailVerified")
      .populate("parentComment");

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📖 Get Comments for a Review
export const getComments = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({
      review: reviewId,
      parentComment: null, // Get only top-level comments
      isDeleted: false,
    })
      .populate("user", "name profilePicture isEmailVerified")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get replies for each comment
    for (let comment of comments) {
      comment._doc.replies = await Comment.find({
        parentComment: comment._id,
        isDeleted: false,
      })
        .populate("user", "name profilePicture isEmailVerified")
        .sort({ createdAt: 1 });
    }

    const total = await Comment.countDocuments({
      review: reviewId,
      parentComment: null,
      isDeleted: false,
    });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✏️ Update Comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = Date.now();
    await comment.save();

    const updated = await Comment.findById(id).populate("user", "name profilePicture isEmailVerified");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🗑️ Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    // Update review comment count
    await Review.findByIdAndUpdate(comment.review, {
      $inc: { commentCount: -1 },
    });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 👍 Like Comment
export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.includes(req.user.id);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();

    res.json({ likes: comment.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
