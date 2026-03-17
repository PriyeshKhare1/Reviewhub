import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Camera, Save, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import api from "../api/axios";
import { motion } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  usePageTitle("Edit Profile", "Update your ReviewHub profile.");
  const [form, setForm] = useState({
    name: "",
    bio: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
      });
      setPreviewUrl(user.profilePicture?.url || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Update profile info
      const res = await api.put("/users/profile", form);
      
      // Upload profile picture if changed
      if (profilePicture) {
        const formData = new FormData();
        formData.append("image", profilePicture);
        const picRes = await api.post("/users/profile/picture", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        res.data.profilePicture = picRes.data.profilePicture;
      }

      // Update user in context
      setUser((prev) => ({ ...prev, ...res.data }));
      
      navigate(`/profile/${user._id || user.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="text-blue-100 mt-2">Update your personal information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Profile Picture
              </label>
              <div className="relative group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-slate-200 dark:border-slate-700">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Click to upload a new photo
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Name *
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
                className="h-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
                className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                {form.bio.length}/500
              </p>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <Input
                value={user?.email || ""}
                disabled
                className="h-12 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email cannot be changed
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
