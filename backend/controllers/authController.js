import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Create token
const createVerificationToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

// Send email using Mailtrap
const sendVerificationEmail = async (to, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const API_URL = process.env.API_URL || 'http://localhost:5000';
  const verifyURL = `${API_URL}/api/auth/verify-email/${token}`;


  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your ReviewHub Email",
    html: `
      <h2>Verify Your Email</h2>
      <p>Click the link below:</p>

      <a href="${verifyURL}">Verify Email</a>

      <p>If link fails, use this token:</p>
      <b>${token}</b>
    `,
  });
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = createVerificationToken();
    const verificationTokenExpires = Date.now() + 1000 * 60 * 60;

    await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
    });

    // Try to send verification email — don't crash registration if email fails
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.error("⚠️  Email sending failed:", emailErr.message);
      console.log(`\n📧 DEV MODE — Verify manually:\n   Token: ${verificationToken}\n   URL:   http://localhost:5000/api/auth/verify-email/${verificationToken}\n`);
    }

    res.status(201).json({ message: "Check your email to verify account." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Email not verified yet" });

    if (user.isBanned)
      return res.status(403).json({ message: "Your account has been banned" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.json({
        requires2FA: true,
        userId: user._id,
        message: "Please enter your 2FA code",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
export const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
      role: req.user.role,
      isBanned: req.user.isBanned,
    },
  });
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(
        `${CLIENT_URL}/login?verified=invalid`
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return res.redirect(
      `${CLIENT_URL}/login?verified=true`
    );
  } catch (error) {
    return res.redirect(
      `${CLIENT_URL}/login?verified=error`
    );
  }
};

// RESEND VERIFICATION EMAIL
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified. Please login." });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenExpires = Date.now() + 1000 * 60 * 60;

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send email — non-blocking so SMTP failure doesn't break the flow
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.error("⚠️  Resend email failed:", emailErr.message);
      console.log(`\n📧 DEV MODE — Verify manually:\n   Token: ${verificationToken}\n   URL:   http://localhost:5000/api/auth/verify-email/${verificationToken}\n`);
    }

    res.json({ message: "Verification email sent. Check your inbox." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PASSWORD RESET ====================

// Send password reset email
const sendPasswordResetEmail = async (to, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset Your ReviewHub Password",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetURL}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      <p style="margin-top: 20px; color: #666;">This link expires in 1 hour.</p>
      <p style="color: #999;">If you didn't request this, please ignore this email.</p>
    `,
  });
};

// FORGOT PASSWORD - Request reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account with that email exists" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({ message: "This account uses Google login. Please sign in with Google." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour

    await user.save();
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent. Check your inbox." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD - With token
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Clear all sessions for security
    user.sessions = [];

    await user.save();

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD - When logged in
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);

    if (user.authProvider === "google") {
      return res.status(400).json({ message: "Cannot change password for Google accounts" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== GOOGLE OAUTH ====================

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential required" });
    }

    // Verify the Google token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if user exists with email but no googleId
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
      }
      // Update profile picture if not set
      if (!user.profilePicture?.url && picture) {
        user.profilePicture = { url: picture };
      }
      user.isVerified = true; // Google accounts are pre-verified
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        password: crypto.randomBytes(32).toString("hex"), // Random password for Google users
        authProvider: "google",
        isVerified: true,
        profilePicture: picture ? { url: picture } : undefined,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.json({
        requires2FA: true,
        userId: user._id,
        message: "2FA verification required"
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== SESSION MANAGEMENT ====================

export const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Return sessions without sensitive token data
    const sessions = user.sessions.map(session => ({
      id: session._id,
      device: session.device,
      ip: session.ip,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
      isCurrent: session.token === req.headers.authorization?.split(" ")[1],
    }));

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = await User.findById(req.user._id);

    user.sessions = user.sessions.filter(
      session => session._id.toString() !== sessionId
    );

    await user.save();
    res.json({ message: "Session revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const revokeAllSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const currentToken = req.headers.authorization?.split(" ")[1];

    // Keep only current session
    user.sessions = user.sessions.filter(
      session => session.token === currentToken
    );

    await user.save();
    res.json({ message: "All other sessions revoked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TWO-FACTOR AUTHENTICATION ====================

// Generate 2FA Secret and QR Code
export const generate2FASecret = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `ReviewHub (${user.email})`,
      issuer: "ReviewHub",
    });

    // Store secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify and Enable 2FA
export const enable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: "Generate 2FA secret first" });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2, // Allow 2 intervals tolerance
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: "Two-factor authentication enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }

    // Verify password for security
    if (user.authProvider === "local") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }
    }

    // Verify the 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ message: "Two-factor authentication disabled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify 2FA Token (during login)
export const verify2FALogin = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is not enabled for this account" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get 2FA Status
export const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ 
      enabled: user.twoFactorEnabled || false,
      authProvider: user.authProvider || "local",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
