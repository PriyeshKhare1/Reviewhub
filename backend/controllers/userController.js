import User from "../models/User.js";
import Review from "../models/Review.js";
import CoinTransaction from "../models/CoinTransaction.js";
import cloudinary from "../config/cloudinary.js";

/* ================= LEADERBOARD ================= */
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ isBanned: false })
      .select("name profilePicture coins bio")
      .sort({ coins: -1 })
      .limit(50);

    // Attach review count for each user
    const leaderboard = await Promise.all(
      users.map(async (u, index) => {
        const reviewCount = await Review.countDocuments({ user: u._id, isDraft: { $ne: true }, isHidden: false });
        return {
          rank: index + 1,
          _id: u._id,
          name: u.name,
          profilePicture: u.profilePicture,
          coins: u.coins,
          bio: u.bio,
          reviewCount,
        };
      })
    );

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET COIN BALANCE + HISTORY ================= */
export const getCoinWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("coins name");
    const transactions = await CoinTransaction.find({ user: req.user._id })
      .populate("review", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ coins: user.coins, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET USER PROFILE ================= */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "_id")
      .populate("following", "_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's review count
    const reviewCount = await Review.countDocuments({ user: user._id, isDraft: { $ne: true } });

    // Get user's reviews (exclude drafts)
    const reviews = await Review.find({ user: user._id, isHidden: false, isDraft: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user: {
        ...user.toObject(),
        followers: user.followers.map(f => f._id.toString()),
        following: user.following.map(f => f._id.toString()),
      },
      reviewCount,
      reviews,
      joinedAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE USER PROFILE ================= */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio) user.bio = req.body.bio;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPLOAD PROFILE PICTURE ================= */
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    // Delete old profile picture from Cloudinary
    if (user.profilePicture?.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }

    // Upload new image to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "reviewhub_profiles",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    user.profilePicture = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    await user.save();

    res.json({
      profilePicture: user.profilePicture,
      message: "Profile picture updated",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET MY PROFILE ================= */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const reviewCount = await Review.countDocuments({ user: req.user._id });

    res.json({
      user,
      reviewCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= FOLLOW/UNFOLLOW USER ================= */
export const toggleFollow = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET FOLLOWERS ================= */
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name email profilePicture bio isVerified"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET FOLLOWING ================= */
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name email profilePicture bio isVerified"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
