import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    password: { type: String, required: true, minlength: 6 },

    isVerified: { type: Boolean, default: false },

    verificationToken: String,

    verificationTokenExpires: Date,

    // 🛡 Role-based Access Control
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // � User Profile Fields
    profilePicture: {
      url: String,
      publicId: String,
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    // 🔖 Saved/Bookmarked Reviews
    savedReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    // 🚫 Ban System
    isBanned: {
      type: Boolean,
      default: false,
    },

    bannedAt: Date,

    banReason: String,

    // 👥 Following System
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔑 Password Reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // 🔐 Google OAuth
    googleId: String,
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // 📱 Active Sessions
    sessions: [
      {
        token: String,
        device: String,
        ip: String,
        createdAt: { type: Date, default: Date.now },
        lastActive: { type: Date, default: Date.now },
      },
    ],

    // 🔒 Two-Factor Authentication
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,

    // 🪙 Coin Wallet
    coins: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 📊 Virtual for review count
userSchema.virtual('reviewCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
  count: true
});

export default mongoose.model("User", userSchema);
