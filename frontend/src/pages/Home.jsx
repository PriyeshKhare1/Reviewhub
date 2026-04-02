import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../api/axios";
import ReviewCard from "../components/ReviewCard";
import { useAuth } from "../context/AuthContext";
import { Users, Star, FolderOpen, Monitor, Gift, ShoppingBag, Utensils, Wrench, Search, AlertCircle, Tag, X, SlidersHorizontal, Rss, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { motion } from 'framer-motion';
import AdvancedSearch from '../components/AdvancedSearch';
import { usePageTitle } from "../hooks/usePageTitle";

export default function Home() {
  const { user } = useAuth();
  usePageTitle("Discover Real Reviews", "Browse genuine reviews across tech, food, lifestyle and more.");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0, categories: 0 });
  const [feedTab, setFeedTab] = useState("all"); // "all" | "following"

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    categories: [],
    minRating: 0,
    maxRating: 5,
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest',
    tags: [],
  });

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categoryData = [
    {
      id: 'tech',
      name: 'Tech',
      icon: Monitor,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      icon: Gift,
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 'retail',
      name: 'Retail',
      icon: ShoppingBag,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      id: 'food',
      name: 'Food',
      icon: Utensils,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'service',
      name: 'Service',
      icon: Wrench,
      color: 'from-teal-500 to-emerald-500',
    },
    {
      id: 'other',
      name: 'Other',
      icon: Star,
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  const categoryCount = categoryData.length;

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Following feed — simpler fetch, no filters
      if (feedTab === "following") {
        const res = await api.get("/reviews/following", { params: { page, limit: 9 } });
        const data = res.data;
        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);
        setStats({ totalReviews: data.total || 0, avgRating: "—", categories: categoryCount });
        return;
      }

      // Merge regular filters with advanced filters
      const effectiveCategories = advancedFilters.categories.length > 0
        ? advancedFilters.categories.join(',')
        : selectedCategory;

      const effectiveTags = advancedFilters.tags.length > 0
        ? [...selectedTags, ...advancedFilters.tags]
        : selectedTags;

      // Use advanced search endpoint when advanced filters or tags are active
      const useAdvancedSearch = effectiveTags.length > 0 ||
        advancedFilters.dateFrom ||
        advancedFilters.dateTo ||
        advancedFilters.minRating > 0 ||
        advancedFilters.maxRating < 5;

      const endpoint = useAdvancedSearch ? '/reviews/search/advanced' : '/reviews';

      const res = await api.get(endpoint, {
        params: {
          keyword: searchQuery,
          category: effectiveCategories,
          rating: ratingFilter === 'all' ? '' : ratingFilter,
          minRating: advancedFilters.minRating > 0 ? advancedFilters.minRating : '',
          maxRating: advancedFilters.maxRating < 5 ? advancedFilters.maxRating : '',
          dateFrom: advancedFilters.dateFrom || '',
          dateTo: advancedFilters.dateTo || '',
          sort: sortBy === 'newest' ? 'createdAt' : sortBy === 'oldest' ? '-createdAt' : sortBy === 'highest' ? '-rating' : sortBy === 'mostHelpful' ? 'helpful' : sortBy === 'mostViewed' ? 'trending' : 'rating',
          tags: effectiveTags.length > 0 ? effectiveTags.join(',') : '',
          page,
          limit: 9
        },
      });

      const data = res.data;
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);

      if (data.reviews && data.reviews.length > 0) {
        const avgRating = (
          data.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / data.reviews.length
        ).toFixed(1);
        setStats({
          totalReviews: data.total || data.reviews.length,
          avgRating: avgRating,
          categories: categoryCount,
        });
      } else {
        setStats({ totalReviews: 0, avgRating: "0", categories: categoryCount });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load reviews. Please try again.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [advancedFilters, categoryCount, feedTab, page, ratingFilter, searchQuery, selectedCategory, selectedTags, sortBy]);

  useEffect(() => {
    const delay = setTimeout(fetchReviews, 400);
    return () => clearTimeout(delay);
  }, [fetchReviews]);

  // Handle advanced filters apply
  const handleApplyAdvancedFilters = (filters) => {
    setAdvancedFilters(filters);
    setSortBy(filters.sortBy);
    setPage(1);
  };

  // Count active advanced filters
  const activeAdvancedFilterCount = 
    advancedFilters.categories.length +
    (advancedFilters.minRating > 0 ? 1 : 0) +
    (advancedFilters.maxRating < 5 ? 1 : 0) +
    (advancedFilters.dateFrom ? 1 : 0) +
    (advancedFilters.dateTo ? 1 : 0) +
    advancedFilters.tags.length;

  const statsData = [
    {
      icon: Users,
      value: stats.totalReviews,
      label: 'Reviews',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Star,
      value: stats.avgRating,
      label: 'Avg Rating',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: FolderOpen,
      value: stats.categories,
      label: 'Categories',
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* ========== HERO SECTION ========== */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-slate-900 dark:text-white">
              Discover
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Real Reviews
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
              Join our community of honest reviewers. Share experiences, discover hidden gems, and make informed decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start">
              <Link to={user ? "/create-review" : "/register"}>
                <Button 
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Start Reviewing
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Reviews
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== CATEGORY SECTION ========== */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
            Explore by Category
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Find reviews that match your interests
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoryData.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                onClick={() => setSelectedCategory(selectedCategory === category.id ? "" : category.id)}
                hover
                className={`p-4 sm:p-6 cursor-pointer border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-transparent hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <category.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white text-center text-sm sm:text-base">{category.name}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== REVIEWS SECTION ========== */}
      <section id="reviews-section" className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">

          {/* Feed Tab Switcher — only shown when logged in */}
          {user && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setFeedTab("all"); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  feedTab === "all"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400"
                }`}
              >
                <Globe className="w-4 h-4" />
                All Reviews
              </button>
              <button
                onClick={() => { setFeedTab("following"); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  feedTab === "following"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400"
                }`}
              >
                <Rss className="w-4 h-4" />
                Following
              </button>
            </div>
          )}

          {/* Search and Filters — hidden on Following tab */}
          {feedTab === "all" && (
          <div className="mb-6 sm:mb-8 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm text-sm sm:text-base"
                />
              </div>
              <Button
                onClick={() => setShowAdvancedSearch(true)}
                variant="outline"
                className="h-12 sm:h-14 px-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 relative"
              >
                <SlidersHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {activeAdvancedFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeAdvancedFilterCount}
                  </span>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="h-10 sm:h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 text-sm sm:text-base">
                  <SelectValue 
                    placeholder="All Ratings" 
                    value={
                      ratingFilter === "all" ? "All Ratings" :
                      ratingFilter === "5" ? "5 Stars" :
                      ratingFilter === "4" ? "4+ Stars" :
                      ratingFilter === "3" ? "3+ Stars" :
                      ratingFilter === "2" ? "2+ Stars" :
                      ratingFilter === "1" ? "1+ Stars" : "All Ratings"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4+ Stars</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3+ Stars</SelectItem>
                  <SelectItem value="2">⭐⭐ 2+ Stars</SelectItem>
                  <SelectItem value="1">⭐ 1+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 sm:h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 text-sm sm:text-base">
                  <SelectValue 
                    placeholder="Newest First" 
                    value={
                      sortBy === "newest" ? "Newest First" :
                      sortBy === "oldest" ? "Oldest First" :
                      sortBy === "highest" ? "Highest Rated" :
                      sortBy === "lowest" ? "Lowest Rated" : "Newest First"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">🆕 Newest First</SelectItem>
                  <SelectItem value="oldest">🕐 Oldest First</SelectItem>
                  <SelectItem value="highest">⭐ Highest Rated</SelectItem>
                  <SelectItem value="lowest">📉 Lowest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        const tag = tagInput.toLowerCase().trim().replace(/\s+/g, '-');
                        if (!selectedTags.includes(tag)) {
                          setSelectedTags([...selectedTags, tag]);
                        }
                        setTagInput('');
                      }
                    }}
                    className="w-full pl-9 pr-4 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                      className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTags([])}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Active Advanced Filters Display */}
            {activeAdvancedFilterCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-wrap items-center gap-2 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800"
              >
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  Active filters:
                </span>
                {advancedFilters.categories.map(cat => (
                  <span key={cat} className="px-2 py-1 bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200 text-xs rounded-full capitalize">
                    {cat}
                  </span>
                ))}
                {advancedFilters.minRating > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    Min {advancedFilters.minRating}★
                  </span>
                )}
                {advancedFilters.maxRating < 5 && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    Max {advancedFilters.maxRating}★
                  </span>
                )}
                {advancedFilters.dateFrom && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    From: {advancedFilters.dateFrom}
                  </span>
                )}
                {advancedFilters.dateTo && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    To: {advancedFilters.dateTo}
                  </span>
                )}
                {advancedFilters.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
                <button
                  onClick={() => setAdvancedFilters({
                    categories: [],
                    minRating: 0,
                    maxRating: 5,
                    dateFrom: '',
                    dateTo: '',
                    sortBy: 'newest',
                    tags: [],
                  })}
                  className="ml-auto text-xs text-violet-600 dark:text-violet-400 hover:text-red-500 underline"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </div>
          )} {/* End feedTab === "all" filters */}

          {/* Following feed empty state */}
          {feedTab === "following" && !loading && reviews.length === 0 && !error && (
            <Card className="p-8 sm:p-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-600 mb-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Rss className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No reviews from people you follow
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Follow other reviewers to see their latest reviews here.
                </p>
                <Button onClick={() => setFeedTab("all")}>Browse All Reviews</Button>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4 sm:mb-6" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error or Empty State */}
          {(error || (!loading && reviews.length === 0)) && (
            <Card className="p-8 sm:p-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {error ? "Something went wrong" : "No reviews found"}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                  {error || "Failed to load reviews. Please try again."}
                </p>
                <Button 
                  onClick={fetchReviews}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Reviews Grid */}
          {!loading && !error && reviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== PAGINATION ========== */}
      {totalPages > 1 && reviews.length > 0 && (
        <div className="container mx-auto px-4 pb-12 sm:pb-16">
          <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              variant="outline"
              className="px-3 sm:px-4 py-2 text-sm"
            >
              <span className="hidden sm:inline">← Prev</span>
              <span className="sm:hidden">←</span>
            </Button>

            <div className="flex gap-1">
              {[...Array(Math.min(totalPages, window.innerWidth < 640 ? 3 : 5))].map((_, i) => {
                const maxVisible = window.innerWidth < 640 ? 3 : 5;
                const pageNum = Math.max(1, Math.min(page - Math.floor(maxVisible/2), totalPages - maxVisible + 1)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    variant={page === pageNum ? "default" : "outline"}
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-sm ${
                      page === pageNum
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : ""
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="outline"
              className="px-3 sm:px-4 py-2 text-sm"
            >
              <span className="hidden sm:inline">Next →</span>
              <span className="sm:hidden">→</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========== CTA SECTION ========== */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            
            <div className="relative px-6 sm:px-8 py-10 sm:py-12 md:py-16 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Ready to Share Your Experience?
              </h2>
              <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of reviewers and help others make informed decisions.
              </p>
              <Link to={user ? "/create-review" : "/register"}>
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all text-base sm:text-lg px-6 sm:px-8"
                >
                  {user ? "Write a Review" : "Create Your Account"}
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Advanced Search Drawer */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        filters={advancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
      />
    </div>
  );
}
