import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, ChevronDown } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { Button } from "./ui/button";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function CommentSection({ reviewId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/comments/review/${reviewId}?page=${pageNum}&limit=10`);
      
      if (pageNum === 1) {
        setComments(res.data.comments);
      } else {
        setComments((prev) => [...prev, ...res.data.comments]);
      }
      
      setTotalComments(res.data.total);
      setHasMore(pageNum < res.data.totalPages);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (content) => {
    try {
      await api.post("/comments", {
        content,
        reviewId,
      });
      fetchComments(1); // Refresh comments
      setPage(1);
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const handleReply = async (parentCommentId, content) => {
    try {
      await api.post("/comments", {
        content,
        reviewId,
        parentCommentId,
      });
      fetchComments(1); // Refresh comments
      setPage(1);
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Comments
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {totalComments} {totalComments === 1 ? "comment" : "comments"}
          </p>
        </div>
      </div>

      {/* Add Comment Form */}
      {user ? (
        <div className="mb-8">
          <CommentForm onSubmit={handleAddComment} />
        </div>
      ) : (
        <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-3">
            Please login to leave a comment
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Login to Comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      {loading && page === 1 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                  <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            No comments yet
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onUpdate={() => fetchComments(1)}
                onDelete={() => fetchComments(1)}
                onReply={handleReply}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="gap-2 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600"
                disabled={loading}
              >
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    Load More Comments
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
