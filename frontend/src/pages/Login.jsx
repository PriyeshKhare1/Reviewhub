import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2, UserCheck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePageTitle } from "../hooks/usePageTitle";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const verified = params.get("verified");
  const { login } = useAuth();
  usePageTitle("Login", "Sign in to your ReviewHub account.");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);

  useEffect(() => {
    if (verified === "true") {
      setMsg("✅ Email verified! You can now login.");
    } else if (verified === "invalid") {
      setMsg("❌ Invalid verification link. Please register again or resend.");
    }
  }, [verified]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    setShowResend(false);

    try {
      const res = await api.post("/auth/login", { email, password });

      // Check if 2FA is required
      if (res.data.requires2FA) {
        setRequires2FA(true);
        setPendingUserId(res.data.userId);
        setMsg("🔐 Enter your 2FA code to continue");
        setLoading(false);
        return;
      }

      // 🔥 Save BOTH token & user
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Login failed";
      setMsg(errorMsg);

      // If email not verified, show resend option
      if (errorMsg.includes("not verified") || errorMsg.includes("Email not verified")) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/2fa/verify", {
        userId: pendingUserId,
        token: twoFACode
      });

      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMsg("");

    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential
      });

      // Check if 2FA is required
      if (res.data.requires2FA) {
        setRequires2FA(true);
        setPendingUserId(res.data.userId);
        setMsg("🔐 Enter your 2FA code to continue");
        setLoading(false);
        return;
      }

      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Google login failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth error
  const handleGoogleError = () => {
    setMsg("❌ Google login failed. Please try again.");
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMsg("❌ Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/resend-verification", { email });
      setMsg("✅ " + res.data.message);
      setShowResend(false);
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to resend verification");
    } finally {
      setLoading(false);
    }
  };

  // If 2FA is required, show 2FA form
  if (requires2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-8 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex w-14 h-14 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg">
                <Shield className="w-7 h-7" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Enter the 6-digit code from your authenticator app</p>
            </div>

            {msg && (
              <div className={`mb-4 rounded-lg p-3 text-sm ${
                msg.startsWith("✅") || msg.startsWith("🔐")
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              }`}>
                {msg}
              </div>
            )}

            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Authentication Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFACode.length !== 6}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </form>

            <button
              onClick={() => {
                setRequires2FA(false);
                setPendingUserId(null);
                setTwoFACode("");
                setMsg("");
              }}
              className="w-full mt-4 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-sm"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Login to your ReviewHub account</p>
            </div>

            {msg && (
              <div className={`mb-6 rounded-xl p-4 text-sm flex items-center gap-2 ${
                msg.startsWith("✅")
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}>
                {msg.startsWith("✅") ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{msg.replace(/^[✅❌] ?/, '')}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width={350}
                text="continue_with"
              />
            </div>

            {showResend && (
              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full mt-4"
              >
                <Mail className="w-4 h-4" />
                Resend Verification Email
              </Button>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Create one here
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
