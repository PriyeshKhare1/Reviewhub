import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../utils/time";
import { 
  Shield, Users, FileText, Flag, Eye, EyeOff, Trash2, CheckCircle, XCircle, 
  BarChart3, Search, Filter, ChevronLeft, ChevronRight,
  Download, RefreshCw, Star, Calendar, Mail, UserCheck, UserX, AlertTriangle
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  usePageTitle("Admin Dashboard", "ReviewHub admin panel.");

  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States - Reviews
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewCategory, setReviewCategory] = useState("all");
  const [reviewRating, setReviewRating] = useState("all");
  const [reviewStatus, setReviewStatus] = useState("all");
  const [reviewSort, setReviewSort] = useState("newest");

  // Filter States - Users
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("all");
  const [userStatus, setUserStatus] = useState("all");
  const [userSort, setUserSort] = useState("newest");

  // Pagination
  const [reviewPage, setReviewPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 10;

  // Categories
  const categories = ["Tech", "Food", "Travel", "Fashion", "Health", "Entertainment", "Sports", "Education", "Other"];

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch data on tab change
  useEffect(() => {
    if (activeTab === "stats") {
      fetchStats();
    } else if (activeTab === "reviews") {
      fetchReviews();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      alert("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/reviews");
      setReviews(res.data.reviews);
    } catch (err) {
      alert("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Search filter
    if (reviewSearch) {
      const search = reviewSearch.toLowerCase();
      result = result.filter(r => 
        r.title?.toLowerCase().includes(search) ||
        r.user?.name?.toLowerCase().includes(search) ||
        r.user?.email?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (reviewCategory !== "all") {
      result = result.filter(r => r.category === reviewCategory);
    }

    // Rating filter
    if (reviewRating !== "all") {
      result = result.filter(r => r.rating === parseInt(reviewRating));
    }

    // Status filter
    if (reviewStatus === "reported") {
      result = result.filter(r => r.reports && r.reports.length > 0);
    } else if (reviewStatus === "hidden") {
      result = result.filter(r => r.isHidden);
    } else if (reviewStatus === "verified") {
      result = result.filter(r => r.isVerifiedProof);
    }

    // Sorting
    result.sort((a, b) => {
      switch (reviewSort) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        case "most-reports":
          return (b.reports?.length || 0) - (a.reports?.length || 0);
        case "most-likes":
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [reviews, reviewSearch, reviewCategory, reviewRating, reviewStatus, reviewSort]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (userSearch) {
      const search = userSearch.toLowerCase();
      result = result.filter(u => 
        u.name?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (userRole !== "all") {
      result = result.filter(u => u.role === userRole);
    }

    // Status filter
    if (userStatus === "verified") {
      result = result.filter(u => u.isVerified);
    } else if (userStatus === "unverified") {
      result = result.filter(u => !u.isVerified);
    } else if (userStatus === "banned") {
      result = result.filter(u => u.isBanned);
    }

    // Sorting
    result.sort((a, b) => {
      switch (userSort) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name-asc":
          return a.name?.localeCompare(b.name);
        case "name-desc":
          return b.name?.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [users, userSearch, userRole, userStatus, userSort]);

  // Pagination
  const paginatedReviews = useMemo(() => {
    const start = (reviewPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, reviewPage]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, userPage]);

  const totalReviewPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => { setReviewPage(1); }, [reviewSearch, reviewCategory, reviewRating, reviewStatus, reviewSort]);
  useEffect(() => { setUserPage(1); }, [userSearch, userRole, userStatus, userSort]);

  // Actions
  const handleVerifyProof = async (reviewId) => {
    try {
      await api.patch(`/admin/reviews/${reviewId}/verify-proof`);
      alert("Proof verified");
      fetchReviews();
    } catch (err) {
      alert("Failed to verify proof");
    }
  };

  const handleToggleHide = async (reviewId) => {
    const reason = prompt("Enter reason for hiding (or leave empty to unhide):");
    try {
      await api.patch(`/admin/reviews/${reviewId}/toggle-hide`, { reason });
      alert("Review updated");
      fetchReviews();
    } catch (err) {
      alert("Failed to update review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Permanently delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      alert("Review deleted");
      fetchReviews();
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const handleBanUser = async (userId) => {
    const reason = prompt("Enter ban reason:");
    if (!reason) return;
    try {
      await api.patch(`/admin/users/${userId}/ban`, { reason });
      alert("User banned");
      fetchUsers();
    } catch (err) {
      alert("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/unban`);
      alert("User unbanned");
      fetchUsers();
    } catch (err) {
      alert("Failed to unban user");
    }
  };

  // Export to CSV
  const exportReviewsCSV = () => {
    const headers = ["Title", "Author", "Category", "Rating", "Reports", "Likes", "Status", "Created At"];
    const rows = filteredReviews.map(r => [
      r.title,
      r.user?.name || "Anonymous",
      r.category,
      r.rating,
      r.reports?.length || 0,
      r.likes?.length || 0,
      r.isHidden ? "Hidden" : r.isVerifiedProof ? "Verified" : "Active",
      new Date(r.createdAt).toLocaleDateString()
    ]);
    downloadCSV(headers, rows, "reviews-export.csv");
  };

  const exportUsersCSV = () => {
    const headers = ["Name", "Email", "Role", "Verified", "Banned", "Joined At"];
    const rows = filteredUsers.map(u => [
      u.name,
      u.email,
      u.role,
      u.isVerified ? "Yes" : "No",
      u.isBanned ? "Yes" : "No",
      new Date(u.createdAt).toLocaleDateString()
    ]);
    downloadCSV(headers, rows, "users-export.csv");
  };

  const downloadCSV = (headers, rows, filename) => {
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  // Clear Filters
  const clearReviewFilters = () => {
    setReviewSearch("");
    setReviewCategory("all");
    setReviewRating("all");
    setReviewStatus("all");
    setReviewSort("newest");
  };

  const clearUserFilters = () => {
    setUserSearch("");
    setUserRole("all");
    setUserStatus("all");
    setUserSort("newest");
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="p-8 text-center bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 shadow-xl max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-red-600 dark:text-red-300">You don't have permission to access this page.</p>
          <Button onClick={() => navigate("/")} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-6 sm:py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Manage reviews, users, and monitor platform activity
          </p>
        </motion.div>

        {/* TABS */}
        <Card className="mb-6 sm:mb-8 overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
          <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-700">
            {[
              { key: "stats", label: "Stats", icon: BarChart3 },
              { key: "reviews", label: "Reviews", icon: FileText },
              { key: "users", label: "Users", icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center justify-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-base transition-all duration-200 ${
                  activeTab === key
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {loading && (
          <Card className="p-12 text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center animate-pulse">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">Loading...</p>
          </Card>
        )}

        {/* STATS TAB */}
        {!loading && activeTab === "stats" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                <Card className="p-4 sm:p-6 text-center bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">{stats.totalReviews}</div>
                  <div className="text-blue-700 dark:text-blue-300 font-medium text-xs sm:text-sm">Total Reviews</div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-4 sm:p-6 text-center bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">{stats.totalUsers}</div>
                  <div className="text-purple-700 dark:text-purple-300 font-medium text-xs sm:text-sm">Total Users</div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-4 sm:p-6 text-center bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-all">
                  <Flag className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-300 mb-1">{stats.reportedReviews}</div>
                  <div className="text-amber-700 dark:text-amber-300 font-medium text-xs sm:text-sm">Reported</div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-4 sm:p-6 text-center bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all">
                  <EyeOff className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-300 mb-1">{stats.hiddenReviews}</div>
                  <div className="text-red-700 dark:text-red-300 font-medium text-xs sm:text-sm">Hidden</div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="p-4 sm:p-6 text-center bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all">
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-300 mb-1">{stats.bannedUsers}</div>
                  <div className="text-red-700 dark:text-red-300 font-medium text-xs sm:text-sm">Banned Users</div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="p-4 sm:p-6 text-center bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-300 mb-1">{stats.verifiedProofs}</div>
                  <div className="text-green-700 dark:text-green-300 font-medium text-xs sm:text-sm">Verified Proofs</div>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <Card className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button onClick={() => { setActiveTab("reviews"); setReviewStatus("reported"); }} className="bg-amber-600 hover:bg-amber-700 gap-2">
                  <Flag className="w-4 h-4" /> View Reported
                </Button>
                <Button onClick={() => { setActiveTab("users"); setUserStatus("banned"); }} className="bg-red-600 hover:bg-red-700 gap-2">
                  <UserX className="w-4 h-4" /> View Banned
                </Button>
                <Button onClick={() => { setActiveTab("reviews"); setReviewStatus("hidden"); }} className="bg-slate-600 hover:bg-slate-700 gap-2">
                  <EyeOff className="w-4 h-4" /> View Hidden
                </Button>
                <Button onClick={() => { setActiveTab("users"); setUserStatus("unverified"); }} className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Mail className="w-4 h-4" /> Unverified Users
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* REVIEWS TAB */}
        {!loading && activeTab === "reviews" && (
          <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4 sm:p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search reviews by title or author..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={fetchReviews} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                  </Button>
                  <Button onClick={exportReviewsCSV} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Export
                  </Button>
                  <Button onClick={clearReviewFilters} variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                    <XCircle className="w-4 h-4" /> Clear
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Select value={reviewCategory} onValueChange={setReviewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={reviewRating} onValueChange={setReviewRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    {[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? "s" : ""}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                    <SelectItem value="verified">Verified Proof</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={reviewSort} onValueChange={setReviewSort}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="rating-high">Highest Rating</SelectItem>
                    <SelectItem value="rating-low">Lowest Rating</SelectItem>
                    <SelectItem value="most-reports">Most Reports</SelectItem>
                    <SelectItem value="most-likes">Most Likes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Showing {paginatedReviews.length} of {filteredReviews.length} reviews</span>
                {(reviewSearch || reviewCategory !== "all" || reviewRating !== "all" || reviewStatus !== "all") && (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Filter className="w-4 h-4" /> Filters applied
                  </span>
                )}
              </div>
            </Card>

            {/* Reviews List */}
            <div className="space-y-3">
              <AnimatePresence>
                {paginatedReviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-lg hover:shadow-xl transition-all ${
                      review.isHidden ? "border-l-4 border-l-red-500" : review.reports?.length > 0 ? "border-l-4 border-l-amber-500" : ""
                    }`}>
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{review.title}</h3>
                              <div className="flex gap-1 flex-shrink-0">
                                {review.isHidden && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">Hidden</span>}
                                {review.isVerifiedProof && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Verified</span>}
                                {review.reports?.length > 0 && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">{review.reports.length} Report{review.reports.length > 1 ? "s" : ""}</span>}
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">{review.description?.substring(0, 150)}...</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs">
                                <FileText className="w-3 h-3" /> {review.category}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs">
                                <Star className="w-3 h-3 fill-current" /> {review.rating}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full text-xs">
                                <Calendar className="w-3 h-3" /> {formatDateTime(review.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 flex-shrink-0">
                            <p><strong>By:</strong> {review.user?.name || "Unknown"}</p>
                            <p><strong>Likes:</strong> {review.likes?.length || 0}</p>
                            {review.isAnonymous && <p className="text-purple-600 dark:text-purple-400">Anonymous</p>}
                          </div>
                        </div>

                        {review.reports?.length > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-2 flex items-center gap-2">
                              <Flag className="w-4 h-4" /> Reports:
                            </h4>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {review.reports.map((r, idx) => (
                                <p key={idx} className="text-xs text-amber-700 dark:text-amber-300">
                                  • {r.reason} - by {r.user?.name} ({formatDateTime(r.reportedAt)})
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {review.attachments?.length > 0 && !review.isVerifiedProof && (
                            <Button onClick={() => handleVerifyProof(review._id)} size="sm" className="bg-green-600 hover:bg-green-700 gap-1">
                              <CheckCircle className="w-4 h-4" /> Verify Proof
                            </Button>
                          )}
                          <Button onClick={() => handleToggleHide(review._id)} size="sm" variant="outline" className="gap-1">
                            {review.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {review.isHidden ? "Unhide" : "Hide"}
                          </Button>
                          <Button onClick={() => handleDeleteReview(review._id)} size="sm" variant="destructive" className="gap-1">
                            <Trash2 className="w-4 h-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {paginatedReviews.length === 0 && (
                <Card className="p-12 text-center bg-white/90 dark:bg-slate-800/90">
                  <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No reviews found matching your filters</p>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {totalReviewPages > 1 && (
              <Card className="p-4 bg-white/90 dark:bg-slate-800/90 flex items-center justify-between">
                <Button onClick={() => setReviewPage(p => Math.max(1, p - 1))} disabled={reviewPage === 1} variant="outline" className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {reviewPage} of {totalReviewPages}
                </span>
                <Button onClick={() => setReviewPage(p => Math.min(totalReviewPages, p + 1))} disabled={reviewPage === totalReviewPages} variant="outline" className="gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {!loading && activeTab === "users" && (
          <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4 sm:p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={fetchUsers} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                  </Button>
                  <Button onClick={exportUsersCSV} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Export
                  </Button>
                  <Button onClick={clearUserFilters} variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                    <XCircle className="w-4 h-4" /> Clear
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Select value={userRole} onValueChange={setUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={userStatus} onValueChange={setUserStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Email Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={userSort} onValueChange={setUserSort}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Showing {paginatedUsers.length} of {filteredUsers.length} users</span>
                {(userSearch || userRole !== "all" || userStatus !== "all") && (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Filter className="w-4 h-4" /> Filters applied
                  </span>
                )}
              </div>
            </Card>

            {/* Users List */}
            <div className="space-y-3">
              <AnimatePresence>
                {paginatedUsers.map((u, index) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-lg hover:shadow-xl transition-all ${
                      u.isBanned ? "border-l-4 border-l-red-500" : ""
                    }`}>
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {u.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {u.name}
                                {u.role === "admin" && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Admin</span>}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {u.email}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                  u.isVerified 
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                }`}>
                                  {u.isVerified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  {u.isVerified ? "Verified" : "Unverified"}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Joined {formatDateTime(u.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {u.isBanned && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                              <p className="font-medium text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                                <UserX className="w-4 h-4" /> Banned
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                <strong>Reason:</strong> {u.banReason}
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400">
                                <strong>Date:</strong> {formatDateTime(u.bannedAt)}
                              </p>
                            </div>
                          )}
                        </div>

                        {u.role !== "admin" && (
                          <div className="mt-4 flex gap-2">
                            {u.isBanned ? (
                              <Button onClick={() => handleUnbanUser(u._id)} size="sm" className="bg-green-600 hover:bg-green-700 gap-1">
                                <UserCheck className="w-4 h-4" /> Unban User
                              </Button>
                            ) : (
                              <Button onClick={() => handleBanUser(u._id)} size="sm" variant="destructive" className="gap-1">
                                <UserX className="w-4 h-4" /> Ban User
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {paginatedUsers.length === 0 && (
                <Card className="p-12 text-center bg-white/90 dark:bg-slate-800/90">
                  <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No users found matching your filters</p>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {totalUserPages > 1 && (
              <Card className="p-4 bg-white/90 dark:bg-slate-800/90 flex items-center justify-between">
                <Button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} variant="outline" className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {userPage} of {totalUserPages}
                </span>
                <Button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} variant="outline" className="gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
