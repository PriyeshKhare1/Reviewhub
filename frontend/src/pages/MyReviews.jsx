import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { isWithin24Hours, timeRemaining, formatDateTime } from "../utils/time";
import { Star, Eye, Edit, Trash2, Image as ImageIcon, Heart, Flag, Lock, Shield, Clock, FileText, Plus } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

export default function MyReviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  usePageTitle("My Reviews", "All your published and draft reviews on ReviewHub.");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH MY REVIEWS ================= */
  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const res = await api.get("/reviews/my");
        setReviews(res.data.reviews || []);
      } catch (err) {
        alert("Failed to load your reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="p-8 text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading your reviews...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 sm:py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Reviews
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Manage and track all your submitted reviews. You can edit reviews within 24 hours of posting.
          </p>
          <div className="mt-4">
            <Button
              onClick={() => navigate("/create-review")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Review
            </Button>
          </div>
        </motion.div>

        {/* Empty State */}
        {reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 sm:p-12 text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                No reviews yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm sm:text-base max-w-md mx-auto">
                Start sharing your experiences by creating your first review!
              </p>
              <Button
                onClick={() => navigate("/create-review")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Review
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Reviews Grid */}
        <div className="grid gap-4 sm:gap-6">
          {reviews.map((r, index) => {
            const canEdit = isWithin24Hours(r.createdAt);

            return (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  {/* Color stripe */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                  
                  <div className="p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                          {r.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm">
                            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {r.category}
                          </span>
                          <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            ))}
                            <span className="ml-1">{r.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        {canEdit ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg font-medium text-xs border border-green-200 dark:border-green-800">
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Editable</span>
                            <span className="text-[10px] opacity-75">({timeRemaining(r.createdAt)})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg font-medium text-xs border border-slate-200 dark:border-slate-600">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Locked</span>
                          </span>
                        )}

                        {r.isAnonymous && (
                          <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg font-medium text-xs border border-purple-200 dark:border-purple-800">
                            <Shield className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Anonymous</span>
                          </span>
                        )}

                        {r.isVerifiedProof && (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium text-xs border border-blue-200 dark:border-blue-800">
                            <Shield className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Verified</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4 mb-4">
                      <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                        {r.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                      {r.attachments && r.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium">
                          <ImageIcon className="w-3 h-3" />
                          {r.attachments.length}
                        </span>
                      )}
                      {r.likes && r.likes.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 px-2.5 py-1 rounded-full text-xs font-medium">
                          <Heart className="w-3 h-3" />
                          {r.likes.length}
                        </span>
                      )}
                      {r.reports && r.reports.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-2.5 py-1 rounded-full text-xs font-medium">
                          <Flag className="w-3 h-3" />
                          {r.reports.length}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Created {formatDateTime(r.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      <Button
                        onClick={() => navigate(`/reviews/${r._id}`)}
                        variant="outline"
                        className="w-full gap-2 text-xs sm:text-sm dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">View</span>
                      </Button>

                      {canEdit && (
                        <Button
                          onClick={() => navigate(`/edit-review/${r._id}`)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2 text-xs sm:text-sm"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Edit</span>
                        </Button>
                      )}

                      <Button
                        onClick={() => handleDelete(r._id)}
                        variant="destructive"
                        className={`w-full gap-2 text-xs sm:text-sm ${!canEdit ? "col-span-1" : ""}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
