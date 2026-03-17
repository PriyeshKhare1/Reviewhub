/* ================= ADMIN ONLY MIDDLEWARE ================= */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  next();
};

/* ================= BAN CHECK MIDDLEWARE ================= */
export const checkBan = (req, res, next) => {
  if (req.user && req.user.isBanned) {
    return res.status(403).json({
      message: `Your account has been banned. Reason: ${
        req.user.banReason || "Terms violation"
      }`,
    });
  }

  next();
};
