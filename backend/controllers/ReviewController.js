import Review from "../models/Review.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import CoinTransaction from "../models/CoinTransaction.js";
import cloudinary from "../config/cloudinary.js";

/* ================= CREATE (WITH IMAGE UPLOAD) ================= */
export const createReview = async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before posting a review",
      });
    }

    if (req.user.isBanned) {
      return res.status(403).json({
        message: "Your account has been banned",
      });
    }

    const reviewData = {
      ...req.body,
      user: req.user._id,
      attachments: [],
      isDraft: req.body.isDraft || false,
    };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload to Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "reviewhub_proofs",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        const result = await uploadPromise;

        reviewData.attachments.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const review = await Review.create(reviewData);

    // 🪙 Award +1 coin for publishing a genuine review (min 100 chars, not a draft)
    const plainDescription = reviewData.description?.replace(/<[^>]*>/g, "") || "";
    if (!reviewData.isDraft && plainDescription.length >= 100) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { coins: 1 } });
      await CoinTransaction.create({
        user: req.user._id,
        amount: 1,
        reason: "review_published",
        review: review._id,
        description: `+1 coin for publishing review: "${review.title}"`,
      });
      await Review.findByIdAndUpdate(review._id, { coinAwarded: true });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= READ ALL (SEARCH + FILTER + PAGINATION) ================= */
export const getReviews = async (req, res) => {
  try {
    const {
      keyword,
      category,
      rating,
      tags,
      page = 1,
      limit = 10,
      sort = "createdAt",
    } = req.query;

    const query = { isHidden: false, isDraft: { $ne: true } }; // Don't show hidden or draft reviews

    // 🔍 SEARCH BY TITLE + DESCRIPTION (full-text index)
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // 🗂 FILTER BY CATEGORY
    if (category) {
      // Support multiple categories
      if (category.includes(',')) {
        query.category = { $in: category.split(',') };
      } else {
        query.category = category;
      }
    }

    // ⭐ FILTER BY RATING
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // 🏷️ FILTER BY TAGS
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const total = await Review.countDocuments(query);

    // Sorting options
    let sortOption = {};
    if (sort === "popular") {
      sortOption = { likes: -1 }; // Sort by likes count
    } else if (sort === "rating") {
      sortOption = { rating: -1 };
    } else {
      sortOption = { createdAt: -1 }; // Default: newest first
    }

    const reviews = await Review.find(query)
      .populate("user", "name email profilePicture isEmailVerified")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= READ ONE ================= */
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "name email profilePicture isEmailVerified");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Increment view count
    review.viewCount = (review.viewCount || 0) + 1;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= READ MY REVIEWS ================= */export const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= FOLLOWING FEED ================= */
export const getFollowingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;

    const currentUser = await User.findById(req.user._id).select("following");
    if (!currentUser.following.length) {
      return res.json({ reviews: [], totalPages: 0, currentPage: 1, total: 0 });
    }

    const query = {
      user: { $in: currentUser.following },
      isHidden: false,
      isDraft: { $ne: true },
    };

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate("user", "name email profilePicture isEmailVerified")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



   /* ================= UPDATE ================= */
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // 🔐 OWNER CHECK (CRITICAL)
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to edit this review",
      });
    }

    // ⏱️ 24-HOUR EDIT WINDOW CHECK (NEW)
    const EDIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in ms
    const createdTime = new Date(review.createdAt).getTime();
    const currentTime = Date.now();

    if (currentTime - createdTime > EDIT_WINDOW) {
      return res.status(403).json({
        message: "Editing time expired. You can only edit within 24 hours.",
      });
    }

    // 📜 Save to edit history before updating
    review.editHistory.push({
      title: review.title,
      description: review.description,
      rating: review.rating,
      editedAt: new Date(),
    });

    // ✅ ALLOWED UPDATES
    review.title = req.body.title || review.title;
    review.description = req.body.description || review.description;
    review.rating = req.body.rating || review.rating;
    review.category = req.body.category || review.category;
    if (req.body.tags) review.tags = req.body.tags;
    if (typeof req.body.isDraft === 'boolean') review.isDraft = req.body.isDraft;

    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // 🔐 OWNER CHECK (CRITICAL)
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to delete this review",
      });
    }

    // Delete images from Cloudinary
    if (review.attachments.length > 0) {
      for (const attachment of review.attachments) {
        if (attachment.publicId) {
          await cloudinary.uploader.destroy(attachment.publicId);
        }
      }
    }

    await review.deleteOne();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= LIKE / UNLIKE ================= */
export const toggleLike = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const userId = req.user._id.toString();
    const likeIndex = review.likes.findIndex(
      (id) => id.toString() === userId
    );

    if (likeIndex === -1) {
      // Not liked yet - add like
      review.likes.push(req.user._id);
    } else {
      // Already liked - remove like
      review.likes.splice(likeIndex, 1);
    }

    await review.save();

    // 🔔 Notify review owner on like (not on unlike, not if liking own review)
    if (likeIndex === -1 && review.user.toString() !== userId) {
      await Notification.create({
        recipient: review.user,
        sender: req.user._id,
        type: "like",
        review: review._id,
        message: `${req.user.name} liked your review "${review.title}"`,
      });
    }

    res.json({
      message: likeIndex === -1 ? "Liked" : "Unliked",
      likesCount: review.likes.length,
      isLiked: likeIndex === -1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= REPORT REVIEW ================= */
export const reportReview = async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user already reported
    const alreadyReported = review.reports.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ message: "You already reported this review" });
    }

    review.reports.push({
      user: req.user._id,
      reason: reason || "Inappropriate content",
    });

    // Auto-hide if threshold crossed (e.g., 5 reports)
    if (review.reports.length >= 5) {
      review.isHidden = true;
      review.hiddenReason = "Auto-hidden due to multiple reports";
      review.hiddenAt = Date.now();
    }

    await review.save();

    res.json({ message: "Review reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= HELPFUL / NOT HELPFUL VOTING ================= */
export const toggleHelpful = async (req, res) => {
  try {
    const { voteType } = req.body; // 'helpful' or 'notHelpful'
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const userId = req.user._id;

    // Remove from both arrays first
    review.helpful = review.helpful.filter((id) => id.toString() !== userId.toString());
    review.notHelpful = review.notHelpful.filter((id) => id.toString() !== userId.toString());

    // Add to selected array
    if (voteType === "helpful") {
      review.helpful.push(userId);
    } else if (voteType === "notHelpful") {
      review.notHelpful.push(userId);
    }

    await review.save();

    // 🪙 Award +1 bonus coin when review reaches 5+ helpful votes (one time only)
    if (review.helpful.length >= 5 && !review.bonusCoinAwarded) {
      await User.findByIdAndUpdate(review.user, { $inc: { coins: 1 } });
      await CoinTransaction.create({
        user: review.user,
        amount: 1,
        reason: "helpful_votes",
        review: review._id,
        description: `+1 bonus coin — your review reached 5+ helpful votes`,
      });
      await Review.findByIdAndUpdate(review._id, { bonusCoinAwarded: true });
    }

    res.json({
      helpful: review.helpful.length,
      notHelpful: review.notHelpful.length,
      userVote: voteType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= BOOKMARK / SAVE REVIEW ================= */

export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const reviewId = req.params.id;

    const isBookmarked = user.savedReviews.includes(reviewId);

    if (isBookmarked) {
      user.savedReviews = user.savedReviews.filter((id) => id.toString() !== reviewId);
    } else {
      user.savedReviews.push(reviewId);
    }

    await user.save();

    res.json({
      message: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      isBookmarked: !isBookmarked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET BOOKMARKED REVIEWS ================= */
export const getBookmarkedReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findById(req.user._id).select("savedReviews");

    const total = user.savedReviews.length;
    const reviews = await Review.find({ _id: { $in: user.savedReviews } })
      .populate("user", "name profilePicture isEmailVerified")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET REVIEW ANALYTICS ================= */
export const getReviewAnalytics = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const analytics = {
      views: review.viewCount || 0,
      likes: review.likes.length,
      comments: review.commentCount || 0,
      helpful: review.helpful?.length || 0,
      notHelpful: review.notHelpful?.length || 0,
      helpfulPercentage:
        review.helpful?.length + review.notHelpful?.length > 0
          ? Math.round((review.helpful.length / (review.helpful.length + review.notHelpful.length)) * 100)
          : 0,
      reports: review.reports.length,
      createdAt: review.createdAt,
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= SEARCH WITH TAGS ================= */
export const searchReviewsAdvanced = async (req, res) => {
  try {
    const {
      keyword,
      category,
      rating,
      minRating,
      maxRating,
      tags,
      dateFrom,
      dateTo,
      sort = "createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isHidden: false };

    // Search in title and description (full-text index)
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Support multiple categories
    if (category) {
      if (category.includes(',')) {
        query.category = { $in: category.split(',') };
      } else {
        query.category = category;
      }
    }

    // Rating filter - exact or range
    if (rating) {
      query.rating = Number(rating);
    } else if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = Number(minRating);
      if (maxRating) query.rating.$lte = Number(maxRating);
    }

    if (tags) {
      query.tags = { $in: tags.split(",") };
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    let sortOption = {};
    if (sort === "popular") {
      sortOption = { likes: -1 };
    } else if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "trending") {
      sortOption = { viewCount: -1, likes: -1 };
    } else if (sort === "helpful") {
      sortOption = { helpful: -1 };
    } else if (keyword) {
      // When searching, sort by text relevance score by default
      sortOption = { score: { $meta: "textScore" } };
    } else {
      sortOption = { createdAt: -1 };
    }

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate("user", "name profilePicture isEmailVerified")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET POPULAR TAGS ================= */
export const getPopularTags = async (req, res) => {
  try {
    const tags = await Review.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET MY DRAFTS ================= */
export const getMyDrafts = async (req, res) => {
  try {
    const drafts = await Review.find({
      user: req.user._id,
      isDraft: true,
    }).sort({ updatedAt: -1 });

    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= PUBLISH DRAFT ================= */
export const publishDraft = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Draft not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!review.isDraft) {
      return res.status(400).json({ message: "Review is already published" });
    }

    review.isDraft = false;
    await review.save();

    // 🪙 Award +1 coin for publishing (same rules as createReview)
    const plainDescription = review.description?.replace(/<[^>]*>/g, "") || "";
    if (!review.coinAwarded && plainDescription.length >= 100) {
      await User.findByIdAndUpdate(review.user, { $inc: { coins: 1 } });
      await CoinTransaction.create({
        user: review.user,
        amount: 1,
        reason: "review_published",
        review: review._id,
        description: `+1 coin for publishing review: "${review.title}"`,
      });
      await Review.findByIdAndUpdate(review._id, { coinAwarded: true });
    }

    res.json({ message: "Review published successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET EDIT HISTORY ================= */
export const getEditHistory = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(review.editHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET CATEGORY STATS ================= */
export const getCategoryStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { isHidden: false, isDraft: { $ne: true } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          latestAt: { $max: "$createdAt" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

