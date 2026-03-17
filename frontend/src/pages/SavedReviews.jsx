import { useState, useEffect } from "react";
import { Bookmark, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReviewCard from "../components/ReviewCard";
import { Button } from "../components/ui/button";
import api from "../api/axios";
import { motion } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

export default function SavedReviews() {
  const navigate = useNavigate();
  usePageTitle("Saved Reviews", "Your bookmarked reviews on ReviewHub.");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedReviews();
  }, []);

  const fetchSavedReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews/saved/bookmarks");
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error("Error fetching saved reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Bookmark className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Saved Reviews
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"} saved
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-16 text-center shadow-xl"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-12 h-12 text-slate-400 dark:text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              No saved reviews yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Start bookmarking reviews to save them for later. You can bookmark any review by clicking the bookmark icon.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Explore Reviews
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ReviewCard review={review} onBookmarkChange={fetchSavedReviews} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
