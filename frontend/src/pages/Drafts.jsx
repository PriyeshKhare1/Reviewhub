import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Edit, Trash2, Send, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../components/ui/button";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

export default function Drafts() {
  usePageTitle("My Drafts", "Your saved draft reviews on ReviewHub.");
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews/drafts");
      setDrafts(res.data);
    } catch (err) {
      console.error("Failed to fetch drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      setPublishingId(id);
      await api.put(`/reviews/${id}/publish`);
      setDrafts(drafts.filter(d => d._id !== id));
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setDrafts(drafts.filter(d => d._id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-violet-600" />
              My Drafts
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {drafts.length} {drafts.length === 1 ? "draft" : "drafts"} saved
            </p>
          </div>
          <Link to="/create-review">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              New Review
            </Button>
          </Link>
        </div>

        {drafts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center"
          >
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No Drafts Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Start writing a review and save it as a draft!
            </p>
            <Link to="/create-review">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Create Review
              </Button>
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <motion.div
                  key={draft._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                        {draft.title || "Untitled Draft"}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                        {draft.description?.replace(/<[^>]*>/g, '').substring(0, 150) || "No description"}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                          {draft.category}
                        </span>
                        <span className="flex items-center gap-1">
                          {"★".repeat(draft.rating)}{"☆".repeat(5 - draft.rating)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/edit-review/${draft._id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handlePublish(draft._id)}
                        disabled={publishingId === draft._id}
                        size="sm"
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4" />
                        {publishingId === draft._id ? "Publishing..." : "Publish"}
                      </Button>
                      <Button
                        onClick={() => handleDelete(draft._id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
