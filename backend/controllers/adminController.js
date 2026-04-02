import Review from "../models/Review.js";
import User from "../models/User.js";
import CoinTransaction from "../models/CoinTransaction.js";
import cloudinary from "../config/cloudinary.js";

/* ================= GET ALL REVIEWS (ADMIN VIEW) ================= */
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      reported,
      hidden,
    } = req.query;

    const query = {};

    // Filter by reported reviews
    if (reported === "true") {
      query["reports.0"] = { $exists: true }; // Has at least 1 report
    }

    // Filter by hidden reviews
    if (hidden === "true") {
      query.isHidden = true;
    }

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate("user", "name email role isBanned")
      .populate("reports.user", "name email")
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

/* ================= VERIFY PROOF ================= */
export const verifyProof = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.attachments.length === 0) {
      return res.status(400).json({ message: "No proof attached" });
    }

    // Prevent double-awarding coins if admin verifies the same proof twice.
    if (review.isVerifiedProof) {
      return res.json({ message: "Proof already verified", review });
    }

    review.isVerifiedProof = true;
    await review.save();

    // 🪙 Award +2 coins to review author for verified proof
    await User.findByIdAndUpdate(review.user, { $inc: { coins: 2 } });
    await CoinTransaction.create({
      user: review.user,
      amount: 2,
      reason: "proof_verified",
      review: review._id,
      description: `+2 coins — admin verified your proof for: "${review.title}"`,
    });

    res.json({ message: "Proof verified", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= HIDE/UNHIDE REVIEW ================= */
export const toggleHideReview = async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isHidden = !review.isHidden;

    if (review.isHidden) {
      review.hiddenReason = reason || "Violates community guidelines";
      review.hiddenAt = Date.now();

      // 🪙 Revoke coin if it was awarded for this review
      if (review.coinAwarded) {
        await User.findByIdAndUpdate(review.user, { $inc: { coins: -1 } });
        await CoinTransaction.create({
          user: review.user,
          amount: -1,
          reason: "review_hidden",
          review: review._id,
          description: `-1 coin — your review was hidden: "${review.hiddenReason}"`,
        });
        await Review.findByIdAndUpdate(review._id, { coinAwarded: false });
      }
    } else {
      review.hiddenReason = null;
      review.hiddenAt = null;
    }

    await review.save();

    res.json({
      message: review.isHidden ? "Review hidden" : "Review unhidden",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE REVIEW (ADMIN) ================= */
export const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
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

    res.json({ message: "Review permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= BAN USER ================= */
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot ban admin users" });
    }

    user.isBanned = true;
    user.bannedAt = Date.now();
    user.banReason = reason || "Terms violation";

    await user.save();

    res.json({ message: "User banned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UNBAN USER ================= */
export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBanned = false;
    user.bannedAt = null;
    user.banReason = null;

    await user.save();

    res.json({ message: "User unbanned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL USERS ================= */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, banned } = req.query;

    const query = {};

    if (banned === "true") {
      query.isBanned = true;
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CHANGE USER ROLE ================= */
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
    }

    // Prevent self-demotion
    if (userId === req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot change your own role" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `User role updated to '${role}'`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DASHBOARD STATS ================= */
export const getDashboardStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const totalUsers = await User.countDocuments();
    const reportedReviews = await Review.countDocuments({
      "reports.0": { $exists: true },
    });
    const hiddenReviews = await Review.countDocuments({ isHidden: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const verifiedProofs = await Review.countDocuments({ isVerifiedProof: true });

    res.json({
      totalReviews,
      totalUsers,
      reportedReviews,
      hiddenReviews,
      bannedUsers,
      verifiedProofs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
