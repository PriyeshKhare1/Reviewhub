import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils/time";
import {
  Star,
  Image,
  Shield,
  Heart,
  ArrowRight,
  Bookmark,
  MessageSquare,
  Eye,
} from "lucide-react";
import api from "../api/axios";
import VerifiedBadge from "./VerifiedBadge";

export default function ReviewCard({ review, onBookmarkChange }) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const categoryData = {
    tech: { color: "from-blue-500 to-cyan-500", icon: "💻" },
    lifestyle: { color: "from-pink-500 to-rose-500", icon: "🎯" },
    retail: { color: "from-purple-500 to-indigo-500", icon: "🛍️" },
    food: { color: "from-orange-500 to-red-500", icon: "🍕" },
    service: { color: "from-teal-500 to-emerald-500", icon: "🔧" },
    entertainment: { color: "from-violet-500 to-purple-500", icon: "🎬" },
    travel: { color: "from-sky-500 to-blue-500", icon: "✈️" },
    health: { color: "from-green-500 to-teal-500", icon: "💪" },
    other: { color: "from-amber-500 to-yellow-500", icon: "⭐" },
  };

  const categoryKey = review.category?.toLowerCase() || "other";
  const category = categoryData[categoryKey] || categoryData.other;

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setBookmarking(true);
    try {
      const res = await api.post(`/reviews/${review._id}/bookmark`);
      setIsBookmarked(res.data.isBookmarked);
      if (onBookmarkChange) {
        onBookmarkChange();
      }
    } catch (error) {
      console.error("Error bookmarking:", error);
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <div className="group relative">
      <Link to={`/reviews/${review._id}`} className="block">
        <div className="h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-2">

          {/* Gradient strip */}
          <div className={`h-1.5 bg-gradient-to-r ${category.color}`} />

          <div className="p-5 sm:p-6">

            {/* Category + Rating */}
            <div className="flex justify-between items-start mb-4 gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${category.color} shadow-md`}
              >
                <span>{category.icon}</span>
                {review.category}
              </span>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= review.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                  {review.rating}.0
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              {review.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">
              {review.description}
            </p>

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {review.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {review.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                    +{review.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {review.viewCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  <Eye className="w-3 h-3" />
                  {review.viewCount}
                </span>
              )}

              {review.commentCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  <MessageSquare className="w-3 h-3" />
                  {review.commentCount}
                </span>
              )}

              {review.likes?.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-full">
                  <Heart className="w-3 h-3" />
                  {review.likes.length}
                </span>
              )}

              {review.attachments?.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                  <Image className="w-3 h-3" />
                  {review.attachments.length}
                </span>
              )}

              {review.isVerifiedProof && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 min-w-0">
                {review.user?.profilePicture?.url ? (
                  <img
                    src={review.user.profilePicture.url}
                    alt={review.user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {review.isAnonymous
                      ? "?"
                      : review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-slate-900 dark:text-white flex items-center gap-1">
                    {review.isAnonymous ? "Anonymous" : review.user?.name}
                    {!review.isAnonymous && review.user?.isEmailVerified && (
                      <VerifiedBadge type="email" size="sm" />
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {timeAgo(review.createdAt)}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:translate-x-1 transition">
                Read
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Bookmark Button */}
      {user && (
        <button
          onClick={handleBookmark}
          disabled={bookmarking}
          className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-slate-200 dark:border-slate-700 z-10"
        >
          <Bookmark
            className={`w-5 h-5 ${
              isBookmarked
                ? "text-blue-600 dark:text-blue-400 fill-current"
                : "text-slate-600 dark:text-slate-400"
            }`}
          />
        </button>
      )}
    </div>
  );
}
