import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../context/AuthContext";
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { User, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Loader2, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePageTitle } from "../hooks/usePageTitle";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  usePageTitle("Create Account", "Join ReviewHub and start sharing your experiences.");
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Google OAuth success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential
      });

      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth error
  const handleGoogleError = () => {
    setError("Google sign up failed. Please try again.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      setMessage(res.data.message);
      setIsRegistered(true);
      setRegisteredEmail(form.email);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/resend-verification", { email: registeredEmail });
      setMessage(res.data.message || "Verification email sent again!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show verification pending state
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-8 transition-colors duration-300">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <MailCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Check Your Email!</h1>
                <p className="text-green-100 text-sm sm:text-base">Verification link sent successfully</p>
              </div>

              <div className="p-6 sm:p-8 text-center">

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Verify Your Email
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mb-2">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-slate-900 dark:text-white mb-6 break-all">
              {registeredEmail}
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📋 What's next?</h3>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Check your email (including spam folder)</li>
                <li>Click the verification link</li>
                <li>Return here and login with your credentials</li>
              </ol>
            </div>

            {message && (
              <div className="mb-4 rounded-lg p-3 text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg p-3 text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "📤 Resend Verification Email"}
              </button>

              <button
                onClick={() => setIsRegistered(false)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:border-slate-300 dark:hover:border-slate-500 transition-all"
              >
                ← Back to Register
              </button>
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              Already verified? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Login here</Link>
            </p>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Link expires in 1 hour. Didn't receive the email? Check your spam folder or resend above.
              </p>
            </div>
          </div>
        </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ✅ Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join ReviewHub</h1>
              <p className="text-blue-100 text-sm sm:text-base">Create your account and start reviewing</p>
            </div>

            <div className="p-6 sm:p-8">

          {message && <div className="mb-4 rounded-lg p-3 text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">{message}</div>}
          {error && <div className="mb-4 rounded-lg p-3 text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">or sign up with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signup_with"
            />
          </div>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Login</Link>
          </p>
        </div>
      </Card>
          </motion.div>
        </div>
      </div>
    );
  }
