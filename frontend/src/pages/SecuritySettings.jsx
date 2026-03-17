import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Monitor, 
  Trash2, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Globe,
  KeyRound,
  QrCode
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import api from "../api/axios";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";

export default function SecuritySettings() {
  const { user } = useAuth();
  usePageTitle("Security Settings", "Manage 2FA, sessions and password on ReviewHub.");
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingId, setRevokingId] = useState(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFASetup, setTwoFASetup] = useState(null); // { qrCode, secret }
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAMsg, setTwoFAMsg] = useState({ type: "", text: "" });
  const [disablePassword, setDisablePassword] = useState("");

  useEffect(() => {
    fetchSessions();
    fetch2FAStatus();
  }, []);

  const fetch2FAStatus = async () => {
    try {
      const res = await api.get("/auth/2fa/status");
      setTwoFAEnabled(res.data.enabled);
    } catch (err) {
      console.error("Failed to fetch 2FA status:", err);
    }
  };

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    setTwoFAMsg({ type: "", text: "" });
    try {
      const res = await api.post("/auth/2fa/generate");
      setTwoFASetup({
        qrCode: res.data.qrCode,
        secret: res.data.secret
      });
    } catch (err) {
      setTwoFAMsg({ type: "error", text: err.response?.data?.message || "Failed to generate 2FA" });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (twoFACode.length !== 6) {
      setTwoFAMsg({ type: "error", text: "Please enter a 6-digit code" });
      return;
    }

    setTwoFALoading(true);
    setTwoFAMsg({ type: "", text: "" });
    try {
      await api.post("/auth/2fa/enable", { token: twoFACode });
      setTwoFAEnabled(true);
      setTwoFASetup(null);
      setTwoFACode("");
      setTwoFAMsg({ type: "success", text: "Two-factor authentication enabled successfully!" });
    } catch (err) {
      setTwoFAMsg({ type: "error", text: err.response?.data?.message || "Invalid code" });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (twoFACode.length !== 6) {
      setTwoFAMsg({ type: "error", text: "Please enter a 6-digit code" });
      return;
    }

    setTwoFALoading(true);
    setTwoFAMsg({ type: "", text: "" });
    try {
      await api.post("/auth/2fa/disable", { 
        token: twoFACode,
        password: disablePassword 
      });
      setTwoFAEnabled(false);
      setTwoFACode("");
      setDisablePassword("");
      setTwoFAMsg({ type: "success", text: "Two-factor authentication disabled" });
    } catch (err) {
      setTwoFAMsg({ type: "error", text: err.response?.data?.message || "Failed to disable 2FA" });
    } finally {
      setTwoFALoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get("/auth/sessions");
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      setRevokingId(sessionId);
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error("Failed to revoke session:", err);
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!window.confirm("This will log you out from all other devices. Continue?")) return;
    try {
      await api.delete("/auth/sessions");
      fetchSessions();
    } catch (err) {
      console.error("Failed to revoke sessions:", err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setPasswordLoading(true);

    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes("mobile")) return <Smartphone className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const isGoogleUser = user?.authProvider === "google";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Security Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account security and sessions
              </p>
            </div>
          </div>

          {/* Change Password */}
          {!isGoogleUser && (
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Change Password
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Update your password regularly to keep your account secure
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordMsg.text && (
                  <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    passwordMsg.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                      : "bg-red-50 dark:bg-red-900/20 text-red-600"
                  }`}>
                    {passwordMsg.type === "success" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {passwordMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      New Password
                    </label>
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {passwordLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {isGoogleUser && (
            <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Google Account</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You signed in with Google. Manage your password through your Google account.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Two-Factor Authentication */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Two-Factor Authentication
                  </h2>
                  {twoFAEnabled && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      Enabled
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>

            {twoFAMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                twoFAMsg.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600"
              }`}>
                {twoFAMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {twoFAMsg.text}
              </div>
            )}

            {!twoFAEnabled && !twoFASetup && (
              <div className="text-center py-4">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Use an authenticator app like Google Authenticator or Authy to generate one-time codes.
                </p>
                <Button
                  onClick={handleSetup2FA}
                  disabled={twoFALoading}
                  className="bg-gradient-to-r from-green-600 to-teal-600"
                >
                  {twoFALoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Set up 2FA
                    </div>
                  )}
                </Button>
              </div>
            )}

            {twoFASetup && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="inline-block p-4 bg-white rounded-lg shadow-inner">
                    <img 
                      src={twoFASetup.qrCode} 
                      alt="2FA QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2">Or enter this code manually:</p>
                    <code className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded font-mono text-sm select-all">
                      {twoFASetup.secret}
                    </code>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Enter the 6-digit code from your app
                  </label>
                  <Input
                    type="text"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-xl font-mono tracking-widest"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setTwoFASetup(null);
                      setTwoFACode("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEnable2FA}
                    disabled={twoFALoading || twoFACode.length !== 6}
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
                  >
                    {twoFALoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Enable 2FA"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {twoFAEnabled && !twoFASetup && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Two-factor authentication is enabled</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Your account is protected with an authenticator app.
                  </p>
                </div>

                <div className="border-t pt-4 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-3">Disable 2FA</h3>
                  <div className="space-y-3">
                    {!isGoogleUser && (
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Your Password
                        </label>
                        <Input
                          type="password"
                          value={disablePassword}
                          onChange={(e) => setDisablePassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                        2FA Code
                      </label>
                      <Input
                        type="text"
                        value={twoFACode}
                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center font-mono tracking-widest"
                      />
                    </div>
                    <Button
                      onClick={handleDisable2FA}
                      disabled={twoFALoading}
                      variant="outline"
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      {twoFALoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Disabling...
                        </div>
                      ) : (
                        "Disable Two-Factor Authentication"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Active Sessions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Active Sessions
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Devices where you're currently logged in
                  </p>
                </div>
              </div>
              {sessions.length > 1 && (
                <Button
                  variant="outline"
                  onClick={handleRevokeAllSessions}
                  className="text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out All Others
                </Button>
              )}
            </div>

            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No active sessions found
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border ${
                      session.isCurrent
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.isCurrent
                            ? "bg-green-100 dark:bg-green-800 text-green-600"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}>
                          {getDeviceIcon(session.device)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {session.device || "Unknown Device"}
                            </span>
                            {session.isCurrent && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            IP: {session.ip || "Unknown"} • Active{" "}
                            {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokingId === session.id}
                          className="text-red-600 hover:bg-red-50"
                        >
                          {revokingId === session.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password? Reset it here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
