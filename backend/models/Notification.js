import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // 👤 Recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👤 Sender/Actor
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔔 Notification Type
    type: {
      type: String,
      enum: ["like", "comment", "reply", "report", "admin_action"],
      required: true,
    },

    // 📝 Related Review
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },

    // 💬 Related Comment
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },

    // 📄 Notification Message
    message: {
      type: String,
      required: true,
    },

    // ✅ Read Status
    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: Date,
  },
  { timestamps: true }
);

// 📊 Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

export default mongoose.model("Notification", notificationSchema);
