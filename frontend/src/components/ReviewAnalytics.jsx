import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Eye, Heart, MessageSquare, ThumbsUp, TrendingUp, Star } from "lucide-react";
import { Card } from "./ui/card";
import api from "../api/axios";
import { motion } from "framer-motion";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function ReviewAnalytics({ reviewId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/reviews/${reviewId}/analytics`);
        setAnalytics(res.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (reviewId) {
      fetchAnalytics();
    }
  }, [reviewId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
    );
  }

  if (!analytics) return null;

  const statsData = [
    {
      label: "Total Views",
      value: analytics.viewCount || 0,
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Likes",
      value: analytics.likesCount || 0,
      icon: Heart,
      color: "from-pink-500 to-rose-500",
    },
    {
      label: "Comments",
      value: analytics.commentCount || 0,
      icon: MessageSquare,
      color: "from-purple-500 to-indigo-500",
    },
    {
      label: "Helpful Votes",
      value: analytics.helpfulCount || 0,
      icon: ThumbsUp,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const engagementData = [
    { name: "Views", value: analytics.viewCount || 0 },
    { name: "Likes", value: analytics.likesCount || 0 },
    { name: "Comments", value: analytics.commentCount || 0 },
    { name: "Helpful", value: analytics.helpfulCount || 0 },
  ];

  const helpfulnessData = [
    { name: "Helpful", value: analytics.helpfulCount || 0, fill: "#10b981" },
    { name: "Not Helpful", value: analytics.notHelpfulCount || 0, fill: "#ef4444" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Review Analytics
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Performance insights for your review
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Bar Chart */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Engagement Overview
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Helpfulness Pie Chart */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Helpfulness Rating
          </h4>
          <div className="h-64 flex items-center justify-center">
            {(analytics.helpfulCount || 0) + (analytics.notHelpfulCount || 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={helpfulnessData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {helpfulnessData.map((entry, index) => (
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <ThumbsUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No helpfulness votes yet</p>
              </div>
            )}
          </div>
          {(analytics.helpfulCount || 0) + (analytics.notHelpfulCount || 0) > 0 && (
            <div className="text-center mt-4">
              <span className="text-2xl font-bold text-green-600">
                {analytics.helpfulPercentage || 0}%
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                found this helpful
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Rating Display */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Your Rating
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The rating you gave in this review
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= (analytics.rating || 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {analytics.rating || 0}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
