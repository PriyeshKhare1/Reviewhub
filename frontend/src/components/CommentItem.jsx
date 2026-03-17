import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Heart, Reply, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import CommentForm from "./CommentForm";
import VerifiedBadge from "./VerifiedBadge";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function CommentItem({ comment, onUpdate, onDelete, onReply }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?._id === comment.user?._id || user?.id === comment.user?._id;

  const handleLike = async () => {
    try {
      const res = await api.post(`/comments/${comment._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleEdit = async (content) => {
    try {
      await api.put(`/comments/${comment._id}`, { content });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this comment?")) {
      try {
        await api.delete(`/comments/${comment._id}`);
        onDelete(comment._id);
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleReplySubmit = async (content) => {
    try {
      await onReply(comment._id, content);
      setIsReplying(false);
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  if (comment.isDeleted) {
    return (
      <div className="py-4 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 italic text-sm">
          [Comment deleted]
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user?.profilePicture?.url ? (
            <img
              src={comment.user.profilePicture.url}
              alt={comment.user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {comment.user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                  {comment.user?.name}
                  {comment.user?.isEmailVerified && (
                    <VerifiedBadge type="email" size="sm" />
                  )}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.isEdited && (
                    <span className="ml-1">(edited)</span>
                  )}
                </p>
              </div>

              {/* Menu */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 py-1 min-w-[120px]"
                      >
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Body */}
            {isEditing ? (
              <div className="mt-2">
                <CommentForm
                  initialValue={comment.content}
                  onSubmit={handleEdit}
                  onCancel={() => setIsEditing(false)}
                  buttonText="Save"
                />
              </div>
            ) : (
              <p className="text-slate-700 dark:text-slate-200 text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 ml-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-colors ${
                liked
                  ? "text-red-500 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {user && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <CommentForm
                  onSubmit={handleReplySubmit}
                  onCancel={() => setIsReplying(false)}
                  buttonText="Reply"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
