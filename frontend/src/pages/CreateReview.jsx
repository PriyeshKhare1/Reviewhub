import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ImageUpload from "../components/ImageUpload";
import TagsInput from "../components/TagsInput";
import RichTextEditor from "../components/RichTextEditor";
import { useNavigate } from "react-router-dom";
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Star, Camera, Loader2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePageTitle } from "../hooks/usePageTitle";

export default function CreateReview() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  usePageTitle("Write a Review", "Share your experience by writing a review on ReviewHub.");

  const [data, setData] = useState({
    title: "",
    description: "",
    rating: 5,
    category: "",
    isAnonymous: false,
  });

  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const categories = [
    { id: 'tech', name: 'Technology', emoji: '💻' },
    { id: 'lifestyle', name: 'Lifestyle', emoji: '🎯' },
    { id: 'retail', name: 'Retail & Shopping', emoji: '🛍️' },
    { id: 'food', name: 'Food & Dining', emoji: '🍕' },
    { id: 'service', name: 'Services', emoji: '🔧' },
    { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
    { id: 'travel', name: 'Travel & Tourism', emoji: '✈️' },
    { id: 'health', name: 'Health & Fitness', emoji: '💪' },
    { id: 'other', name: 'Other', emoji: '⭐' },
  ];

  // ✅ 1️⃣ WAIT FOR AUTH CHECK
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  // ✅ 2️⃣ NOT LOGGED IN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
        <Card className="p-8 max-w-md mx-4 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-2">Authentication Required</h2>
            <p className="text-amber-700 dark:text-amber-300 mb-4">Please login to create a review</p>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ 3️⃣ LOGGED IN BUT NOT VERIFIED
  if (!user.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
        <Card className="p-8 max-w-md mx-4 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">🚫 Email Not Verified</h2>
            <p className="text-red-700 dark:text-red-300">Please verify your email to create a review.</p>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ 4️⃣ SUBMIT
  const submit = async (e, isDraft = false) => {
    e.preventDefault();
    setMsg("");
    if (isDraft) {
      setSavingDraft(true);
    } else {
      setSubmitting(true);
    }

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("rating", data.rating);
      formData.append("category", data.category);
      formData.append("isAnonymous", data.isAnonymous);
      formData.append("isDraft", isDraft);
      
      // Append tags
      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }

      // Append images
      images.forEach((image) => {
        formData.append("images", image);
      });

      await api.post("/reviews", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (isDraft) {
        setMsg("✅ Draft saved successfully");
        setTimeout(() => navigate("/drafts"), 1500);
      } else {
        setMsg("✅ Review added successfully");
        setTimeout(() => navigate("/"), 1500);
      }

      // Reset form
      setData({
        title: "",
        description: "",
        rating: 5,
        category: "",
        isAnonymous: false,
      });
      setTags([]);
      setImages([]);
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to add review");
    } finally {
      setSubmitting(false);
      setSavingDraft(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setData({ ...data, rating: i + 1 })}
        className={`text-2xl transition-colors ${
          i < data.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-300'
        }`}
      >
        <Star className={`w-6 h-6 ${i < data.rating ? 'fill-current' : ''}`} />
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 sm:py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                Create New Review
              </h1>
              <p className="text-blue-100 mt-2">Share your experience and help others make informed decisions</p>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8">
              {msg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mb-6 rounded-xl p-4 flex items-center gap-3 ${
                    msg.startsWith("✅") 
                      ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800" 
                      : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {msg.startsWith("✅") ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="font-medium">{msg}</span>
                </motion.div>
              )}

              <form onSubmit={submit} className="space-y-6">
                {/* Title & Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Review Title *
                    </label>
                    <Input
                      placeholder="Amazing product experience..."
                      value={data.title}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Category *
                    </label>
                    <Select value={data.category} onValueChange={(value) => setData({ ...data, category: value })}>
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400">
                        <SelectValue 
                          placeholder="Select a category"
                          value={
                            data.category 
                              ? categories.find(cat => cat.id === data.category)?.emoji + " " + categories.find(cat => cat.id === data.category)?.name 
                              : ""
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span>{cat.emoji}</span>
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {renderStars()}
                    </div>
                    <span className="ml-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold rounded-full">
                      {data.rating} Star{data.rating !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <TagsInput tags={tags} onChange={setTags} maxTags={5} />

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Review Description *
                  </label>
                  <RichTextEditor
                    value={data.description}
                    onChange={(value) => setData({ ...data, description: value })}
                    placeholder="Share your detailed thoughts and experience..."
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Use formatting to make your review more readable
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Photos (Optional)
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-700/30 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6">
                    <ImageUpload images={images} setImages={setImages} maxImages={5} />
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.isAnonymous}
                      onChange={(e) => setData({ ...data, isAnonymous: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-2 bg-white dark:bg-slate-800"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Post as Anonymous</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Your name will not be displayed publicly</p>
                    </div>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    onClick={(e) => submit(e, true)}
                    disabled={savingDraft || submitting}
                    variant="outline"
                    className="flex-1 h-14 font-semibold text-lg"
                  >
                    {savingDraft ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Save className="w-5 h-5" />
                        <span>Save Draft</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || savingDraft}
                    className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02]"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Publishing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5" />
                        <span>Publish Review</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
