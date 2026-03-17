import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import ImageGallery from "../components/ImageGallery";
import RichTextContent from "../components/RichTextContent";
import VerifiedBadge from "../components/VerifiedBadge";
import { formatDateTime, isWithin24Hours } from "../utils/time";
import { Star, Heart, Flag, Edit, Trash2, Image as ImageIcon, Shield, Clock, User, AlertCircle, ZoomIn, ArrowLeft, ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import CommentSection from "../components/CommentSection";
import ShareButton from "../components/ShareButton";
import { usePageTitle } from "../hooks/usePageTitle";

export default function ReviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  usePageTitle("Review", "Read the full review on ReviewHub.");

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState(null); // "helpful" or "notHelpful"

  /* ================= FETCH REVIEW ================= */
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(`/reviews/${id}`);
        console.log("API response:", res.data); // 👈 add this
        setReview(res.data);
        
        // Check if current user liked
        if (user && res.data.likes) {
          const userId = user.id || user._id;
          setIsLiked(res.data.likes.includes(userId));
        }
        setLikesCount(res.data.likes?.length || 0);

        // Check bookmark status
        if (user) {
          const userId = user.id || user._id;
          setIsBookmarked(user.savedReviews?.includes(id) || false);
        }

        // Check helpful vote status
        if (user) {
          const userId = user.id || user._id;
          if (res.data.helpful?.includes(userId)) {
            setUserVote("helpful");
          } else if (res.data.notHelpful?.includes(userId)) {
            setUserVote("notHelpful");
          }
        }
      } catch (err) {
        setError("Failed to load review");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id, user]);

  /* ================= OWNER CHECK ================= */
  const isOwner =
    user &&
    review &&
    review.user &&
    (review.user._id === user._id || review.user._id === user.id);

  /* ================= EDIT PERMISSION ================= */
  const canEdit =
    isOwner &&
    review?.createdAt &&
    isWithin24Hours(review.createdAt);

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.delete(`/reviews/${review._id}`);
      navigate("/");
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  /* ================= LIKE / UNLIKE ================= */
  const handleLike = async () => {
    if (!user) {
      alert("Please login to like reviews");
      return;
    }

    try {
      const res = await api.post(`/reviews/${id}/like`);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      alert("Failed to like review");
    }
  };

  /* ================= REPORT ================= */
  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Please enter a reason");
      return;
    }

    try {
      await api.post(`/reviews/${id}/report`, { reason: reportReason });
      setShowReportModal(false);
      setReportReason("");
      alert("Review reported successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to report");
    }
  };

  /* ================= BOOKMARK ================= */
  const handleBookmark = async () => {
    if (!user) {
      alert("Please login to bookmark reviews");
      return;
    }

    try {
      const res = await api.post(`/reviews/${id}/bookmark`);
      setIsBookmarked(res.data.isSaved);
    } catch (err) {
      alert("Failed to bookmark review");
    }
  };

  /* ================= HELPFUL VOTING ================= */
  const handleHelpful = async (voteType) => {
    if (!user) {
      alert("Please login to vote");
      return;
    }

    try {
      const res = await api.post(`/reviews/${id}/helpful`, { voteType });
      setReview(prev => ({
        ...prev,
        helpful: Array(res.data.helpful).fill(null),
        notHelpful: Array(res.data.notHelpful).fill(null),
        helpfulPercentage: res.data.helpful + res.data.notHelpful > 0
          ? Math.round((res.data.helpful / (res.data.helpful + res.data.notHelpful)) * 100)
          : 0,
      }));

      // Update user vote state
      if (userVote === voteType) {
        setUserVote(null); // User removed their vote
      } else {
        setUserVote(voteType);
      }
    } catch (err) {
      alert("Failed to vote");
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="p-8 text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Star className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading review...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
        <Card className="p-8 text-center bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 shadow-xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          <Button
            onClick={() => navigate("/")}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!review) return null;

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-6 sm:py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-5xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-2xl">
            {/* Color stripe */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <div className="p-4 sm:p-6 lg:p-10">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                    {review.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-sm">
                      <Star className="w-4 h-4" />
                      {review.category}
                    </span>
                    {review.isVerifiedProof && (
                      <span className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-sm border border-green-200 dark:border-green-800">
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">Verified Proof</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  <span>{review.rating}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <RichTextContent content={review.description} />
              </div>

              {/* Attachments */}
              {review.attachments && review.attachments.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    Proof Attachments ({review.attachments.length})
                  </h3>
                  <ImageGallery images={review.attachments} />
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700 my-6 sm:my-8" />

              {/* Author Info */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-900/30 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {review.isAnonymous ? "?" : (review.user?.name?.charAt(0)?.toUpperCase() || "U")}
                    </div>
                    <div>
                      <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium text-sm sm:text-base">
                        <User className="w-4 h-4" />
                        {review.isAnonymous ? "Anonymous" : review.user?.name}
                        {!review.isAnonymous && review.user?.isEmailVerified && (
                          <VerifiedBadge type="email" size="md" />
                        )}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  {review.isAnonymous && (
                    <span className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-purple-200 dark:border-purple-800">
                      <Shield className="w-3.5 h-3.5" />
                      Anonymous
                    </span>
                  )}
                </div>
              </div>

              {/* Interactions */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {user && (
                  <Button
                    onClick={handleLike}
                    className={`gap-2 text-sm sm:text-base ${
                      isLiked
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        : "bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    <span className="hidden xs:inline">{isLiked ? "Liked" : "Like"}</span>
                    <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded-full text-xs font-medium">
                      {likesCount}
                    </span>
                  </Button>
                )}

                {!isLiked && !user && (
                  <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base">
                    <Heart className="w-4 h-4" />
                    <span>{likesCount}</span>
                  </div>
                )}

                {user && (
                  <Button
                    onClick={handleBookmark}
                    className={`gap-2 text-sm sm:text-base ${
                      isBookmarked
                        ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                        : "bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-yellow-300 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                    <span className="hidden xs:inline">{isBookmarked ? "Saved" : "Save"}</span>
                  </Button>
                )}

                <ShareButton review={review} />

                {user && !isOwner && (
                  <Button
                    onClick={() => setShowReportModal(true)}
                    variant="outline"
                    className="gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm sm:text-base"
                  >
                    <Flag className="w-4 h-4" />
                    <span className="hidden xs:inline">Report</span>
                  </Button>
                )}
              </div>

              {/* Helpful Voting */}
              <div className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700/50 dark:to-purple-900/30 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="text-center mb-4">
                  <p className="text-slate-700 dark:text-slate-200 font-medium mb-1">Was this review helpful?</p>
                  {review.helpful && review.notHelpful && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {review.helpfulPercentage}% found this helpful ({review.helpful.length + review.notHelpful.length} votes)
                    </p>
                  )}
                </div>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => handleHelpful("helpful")}
                    disabled={!user}
                    className={`gap-2 ${
                      userVote === "helpful"
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        : "bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${userVote === "helpful" ? "fill-current" : ""}`} />
                    <span>Helpful</span>
                    <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded-full text-xs font-medium">
                      {review.helpful?.length || 0}
                    </span>
                  </Button>
                  <Button
                    onClick={() => handleHelpful("notHelpful")}
                    disabled={!user}
                    className={`gap-2 ${
                      userVote === "notHelpful"
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                        : "bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    }`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${userVote === "notHelpful" ? "fill-current" : ""}`} />
                    <span>Not Helpful</span>
                    <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded-full text-xs font-medium">
                      {review.notHelpful?.length || 0}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 sm:pt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {canEdit ? (
                      <Button
                        onClick={() => navigate(`/edit-review/${review._id}`)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Review
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-lg text-xs sm:text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Edit window expired</span>
                      </div>
                    )}

                    <Button
                      onClick={handleDelete}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Review
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Comment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <CommentSection reviewId={id} />
        </motion.div>
      </div>

      {/* ================= IMAGE MODAL ================= */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Proof Image"
      >
        <div className="flex justify-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size proof"
              className="max-w-full max-h-96 object-contain rounded-xl shadow-lg"
            />
          )}
        </div>
      </Modal>

      {/* ================= REPORT MODAL ================= */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Review"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reason for reporting:
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">Select a reason</option>
              <option value="Spam">Spam</option>
              <option value="Harassment">Harassment</option>
              <option value="False information">False information</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            onClick={handleReport}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Submit Report
          </button>
        </div>
      </Modal>
    </div>
  );
}
