import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Card } from "../components/ui/card";
import { Monitor, Gift, ShoppingBag, Utensils, Wrench, Star, FolderOpen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

const CATEGORY_META = {
  tech:      { icon: Monitor,    color: "from-blue-500 to-cyan-500",    label: "Tech" },
  lifestyle: { icon: Gift,       color: "from-pink-500 to-rose-500",    label: "Lifestyle" },
  retail:    { icon: ShoppingBag,color: "from-purple-500 to-indigo-500",label: "Retail" },
  food:      { icon: Utensils,   color: "from-orange-500 to-red-500",   label: "Food" },
  service:   { icon: Wrench,     color: "from-teal-500 to-emerald-500", label: "Service" },
  other:     { icon: Star,       color: "from-amber-500 to-yellow-500", label: "Other" },
};

const DEFAULT_META = { icon: FolderOpen, color: "from-slate-400 to-slate-500", label: "Other" };

export default function Categories() {
  const navigate = useNavigate();
  usePageTitle("Browse Categories", "Explore reviews by category on ReviewHub.");
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/reviews/categories/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load categories."))
      .finally(() => setLoading(false));
  }, []);

  const totalReviews = stats.reduce((s, c) => s + c.count, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <FolderOpen className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Browse by Category</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""} across {stats.length} categories
          </p>
        </div>

        {/* Stats summary */}
        {!loading && !error && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.length}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Categories</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalReviews}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Total Reviews</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.length > 0 ? (stats.reduce((s, c) => s + c.avgRating, 0) / stats.length).toFixed(1) : "—"}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Avg Rating</div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <Card className="p-8 text-center text-slate-500 dark:text-slate-400">{error}</Card>
        )}

        {/* Category Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((cat, index) => {
              const meta = CATEGORY_META[cat._id?.toLowerCase()] || DEFAULT_META;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => navigate(`/?category=${cat._id}`)}
                    className="w-full text-left"
                  >
                    <Card hover className="p-5 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white capitalize">{cat._id}</h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {cat.avgRating?.toFixed(1)} avg
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{cat.count}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{cat.count === 1 ? "review" : "reviews"}</span>
                      </div>
                      {/* Bar showing proportion */}
                      <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${meta.color}`}
                          style={{ width: `${Math.max(5, Math.round((cat.count / Math.max(totalReviews, 1)) * 100))}%` }}
                        />
                      </div>
                      <div className="text-right text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {Math.round((cat.count / Math.max(totalReviews, 1)) * 100)}% of all reviews
                      </div>
                    </Card>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && !error && stats.length === 0 && (
          <Card className="p-12 text-center text-slate-500 dark:text-slate-400">
            No reviews yet. Be the first to write one!
          </Card>
        )}
      </div>
    </div>
  );
}
