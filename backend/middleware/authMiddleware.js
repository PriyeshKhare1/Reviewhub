import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (!req.headers.authorization?.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔒 VERIFIED USER CHECK
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    // 🚫 BAN CHECK
    if (user.isBanned) {
      return res.status(403).json({
        message: `Account banned. Reason: ${user.banReason || "Terms violation"}`,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
