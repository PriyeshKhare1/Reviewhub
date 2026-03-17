import mongoose from "mongoose";

const coinTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true, // positive = earned, negative = revoked
    },

    reason: {
      type: String,
      enum: [
        "review_published",     // +1: published a genuine review
        "helpful_votes",        // +1: review reached 5+ helpful votes
        "proof_verified",       // +2: admin verified your proof image
        "review_hidden",        // -1: admin hid your review (fake/spam)
      ],
      required: true,
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },

    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("CoinTransaction", coinTransactionSchema);
