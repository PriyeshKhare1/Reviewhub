import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // 💬 Comment Content
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // 👤 Author
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📝 Related Review
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },

    // 💬 Parent Comment (for replies)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // 👍 Likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ✏️ Edited Flag
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: Date,

    // 🗑️ Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 📊 Indexes
commentSchema.index({ review: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parentComment: 1 });

export default mongoose.model("Comment", commentSchema);
