import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart3, ArrowLeft, Eye, Heart, MessageSquare, ThumbsUp, Star, TrendingUp } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../api/axios";
import { motion } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  usePageTitle("Analytics", "View analytics for your reviews.");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalHelpful: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const res = await api.get("/reviews/my");
        const reviewsData = res.data.reviews || res.data || [];
        setReviews(reviewsData);

        // Calculate aggregate stats
        const totalViews = reviewsData.reduce((sum, r) => sum + (r.viewCount || 0), 0);
        const totalLikes = reviewsData.reduce((sum, r) => sum + (r.likes?.length || 0), 0);
        const totalComments = reviewsData.reduce((sum, r) => sum + (r.commentCount || 0), 0);
        const totalHelpful = reviewsData.reduce((sum, r) => sum + (r.helpful?.length || 0), 0);
        const avgRating = reviewsData.length > 0
          ? (reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length).toFixed(1)
          : 0;

        setStats({ totalViews, totalLikes, totalComments, totalHelpful, avgRating });
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyReviews();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Please login to view analytics</p>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </Card>
      </div>
    );
  }

  const statsData = [
    { label: "Total Views", value: stats.totalViews, icon: Eye, color: "from-blue-500 to-cyan-500" },
    { label: "Total Likes", value: stats.totalLikes, icon: Heart, color: "from-pink-500 to-rose-500" },
    { label: "Total Comments", value: stats.totalComments, icon: MessageSquare, color: "from-purple-500 to-indigo-500" },
    { label: "Helpful Votes", value: stats.totalHelpful, icon: ThumbsUp, color: "from-green-500 to-emerald-500" },
  ];

  // Chart data
  const reviewsPerformance = reviews.slice(0, 10).map((r) => ({
    name: r.title.substring(0, 15) + (r.title.length > 15 ? "..." : ""),
    views: r.viewCount || 0,
    likes: r.likes?.length || 0,
    comments: r.commentCount || 0,
  }));

  const categoryDistribution = reviews.reduce((acc, r) => {
    const cat = r.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryDistribution).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index % COLORS.length],
  }));

  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating} Star`,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

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
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                My Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Performance insights for all your reviews
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-16 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <BarChart3 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No reviews yet</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first review to see analytics</p>
            <Link to="/create-review">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Create Review</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {stat.value.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Average Rating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Average Rating</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Across {reviews.length} reviews</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.round(stats.avgRating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.avgRating}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reviews Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Top Reviews Performance
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reviewsPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: "#64748b", fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "8px",
                            color: "#f1f5f9",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="views" fill="#3b82f6" name="Views" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="likes" fill="#ec4899" name="Likes" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Reviews by Category
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "8px",
                            color: "#f1f5f9",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              {/* Rating Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-2"
              >
                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Rating Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="rating" tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "8px",
                            color: "#f1f5f9",
                          }}
                        />
                        <Bar dataKey="count" fill="url(#ratingGradient)" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ea580c" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
