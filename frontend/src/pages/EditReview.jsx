import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TagsInput from "../components/TagsInput";
import RichTextEditor from "../components/RichTextEditor";
import { Star, Save, AlertCircle, ArrowLeft, Edit } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { motion } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

export default function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  usePageTitle("Edit Review", "Update your review on ReviewHub.");

  const [form, setForm] = useState({
    title: "",
    description: "",
    rating: 5,
    category: "",
  });

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { id: "tech", name: "Tech", emoji: "💻" },
    { id: "lifestyle", name: "Lifestyle", emoji: "🎯" },
    { id: "retail", name: "Retail", emoji: "🛍️" },
    { id: "food", name: "Food", emoji: "🍕" },
    { id: "service", name: "Service", emoji: "🔧" },
    { id: "other", name: "Other", emoji: "⭐" },
  ];

  /* ================= FETCH REVIEW ================= */
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(`/reviews/${id}`);
        const review = res.data;

        // 🔐 OWNER CHECK (FRONTEND SAFETY)
        const loggedUserId = user?._id || user?.id;
        if (review.user._id !== loggedUserId) {
          return navigate("/");
        }

        setForm({
          title: review.title,
          description: review.description,
          rating: review.rating,
          category: review.category,
        });
        setTags(review.tags || []);
      } catch (err) {
        setError("Failed to load review");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchReview();
  }, [id, user, navigate]);

  /* ================= UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.put(`/reviews/${id}`, { ...form, tags });
      navigate(`/reviews/${id}`);
    } catch (err) {
      setError("Failed to update review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setForm({ ...form, rating: i + 1 })}
        className={`text-2xl transition-all ${
          i < form.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-300'
        }`}
      >
        <Star className={`w-7 h-7 sm:w-8 sm:h-8 ${i < form.rating ? 'fill-current' : ''}`} />
      </button>
    ));
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="p-8 text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Edit className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading review...</p>
        </Card>
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="p-8 text-center bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 shadow-xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-400 font-medium mb-4">{error}</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  /* ================= MAIN RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 sm:py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-3xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm dark:border-slate-600 dark:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                Edit Review
              </h1>
              <p className="text-blue-100 mt-2">Update your review details below</p>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 rounded-xl p-4 flex items-center gap-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title & Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Review Title *
                    </label>
                    <Input
                      placeholder="Amazing product experience..."
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700 dark:text-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Category *
                    </label>
                    <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 dark:text-white">
                        <SelectValue 
                          placeholder="Select a category"
                          value={
                            form.category 
                              ? categories.find(cat => cat.id === form.category)?.emoji + " " + categories.find(cat => cat.id === form.category)?.name 
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
                      {form.rating} {form.rating === 1 ? 'star' : 'stars'}
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
                    value={form.description}
                    onChange={(value) => setForm({ ...form, description: value })}
                    placeholder="Share your detailed experience..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {submitting ? "Updating..." : "Update Review"}
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
