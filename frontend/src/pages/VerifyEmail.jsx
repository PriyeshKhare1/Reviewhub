import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import { usePageTitle } from "../hooks/usePageTitle";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  // Initialize based on whether the token exists to avoid setState in the effect.
  const [msg, setMsg] = useState(token ? "Verifying your email..." : "Invalid verification link");
  const [status, setStatus] = useState(token ? "loading" : "error"); // loading, success, error
  usePageTitle("Verify Email", "Verify your ReviewHub email address.");

  useEffect(() => {
    if (!token) return;
    const verifyEmail = async () => {
      try {
        const res = await api.post(`/auth/verify-email?token=${token}`);
        setMsg(res.data.message || "✅ Email verified successfully!");
        setStatus("success");
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Verification failed. Please try again.";
        setMsg(errorMsg);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {status === "loading" && (
          <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-spin" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-2 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✉️</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Verifying Email
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Please wait while we verify your email address...
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Email Verified!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {msg}
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>🚀</span>
              <span>Go to Login</span>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Verification Failed
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {msg}
            </p>
            <div className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The verification link may have expired or is invalid. Please try requesting a new one.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>📝</span>
                  <span>Register Again</span>
                </Link>
                <Link
                  to="/"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-8 py-3 rounded-xl font-semibold hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200"
                >
                  <span>🏠</span>
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
