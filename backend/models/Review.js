import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    category: {
      type: String,
      required: true,
    },

    // 🔐 Owner (always stored, even if anonymous)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🕵️ Anonymous Review Flag
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // 📎 Proof / Attachments (Images) - Multiple Images Support
    attachments: [
      {
        url: String,
        publicId: String, // Cloudinary ID for deletion
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // 🏷️ Tags/Keywords
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // 👁️ View Count for Analytics
    viewCount: {
      type: Number,
      default: 0,
    },

    // 📊 Helpful Voting System
    helpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    notHelpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 💬 Comment Count (denormalized for performance)
    commentCount: {
      type: Number,
      default: 0,
    },

    // ✅ Verified Proof Badge
    isVerifiedProof: {
      type: Boolean,
      default: false,
    },

    // 👍 Likes / Upvotes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🚩 Reports
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
        reportedAt: { type: Date, default: Date.now },
      },
    ],

    // 🔒 Moderation
    isHidden: {
      type: Boolean,
      default: false,
    },

    hiddenReason: String,

    hiddenAt: Date,

    // 📝 Draft System
    isDraft: {
      type: Boolean,
      default: false,
    },

    // 🪙 Coin Award Tracking
    coinAwarded: { type: Boolean, default: false },       // base +1 coin on publish
    bonusCoinAwarded: { type: Boolean, default: false },  // +1 coin on 5 helpful votes

    // 📜 Version History
    editHistory: [
      {
        title: String,
        description: String,
        rating: Number,
        editedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// 📊 Indexes for Performance
reviewSchema.index({ rating: -1 });
reviewSchema.index({ category: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ tags: 1 });
reviewSchema.index({ viewCount: -1 });

// 🔍 Full-text search index (title + description)
reviewSchema.index({ title: "text", description: "text" }, { weights: { title: 10, description: 1 } });

// 🔥 Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  const total = this.helpful.length + this.notHelpful.length;
  if (total === 0) return 0;
  return Math.round((this.helpful.length / total) * 100);
});

export default mongoose.model("Review", reviewSchema);
