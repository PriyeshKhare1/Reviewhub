import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Trophy, Coins, Star, Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { getBadge } from "../utils/coinBadge";
import { usePageTitle } from "../hooks/usePageTitle";

const rankStyle = (rank) => {
  if (rank === 1) return { bg: "from-yellow-400 to-amber-500", icon: Crown, label: "1st" };
  if (rank === 2) return { bg: "from-slate-400 to-slate-500", icon: Medal, label: "2nd" };
  if (rank === 3) return { bg: "from-amber-600 to-orange-600", icon: Medal, label: "3rd" };
  return { bg: "from-blue-500 to-purple-600", icon: null, label: `#${rank}` };
};

export default function Leaderboard() {
  const { user } = useAuth();
  usePageTitle("Leaderboard", "Top coin earners on ReviewHub.");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/leaderboard")
      .then((res) => setLeaders(res.data))
      .catch(() => setError("Failed to load leaderboard."))
      .finally(() => setLoading(false));
  }, []);

  const myRank = user ? leaders.findIndex((l) => l._id === (user._id || user.id)) + 1 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-400/30">
            <Trophy className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Top reviewers ranked by coins earned. Write quality reviews to climb the board.
          </p>
          {myRank > 0 && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-200 dark:border-yellow-800">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                You are ranked #{myRank}
              </span>
            </div>
          )}
        </div>

        {/* Top 3 podium */}
        {!loading && !error && leaders.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-8 items-end">
            {[leaders[1], leaders[0], leaders[2]].map((leader, i) => {
              const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const style = rankStyle(actualRank);
              const isFirst = actualRank === 1;
              return (
                <motion.div
                  key={leader._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/profile/${leader._id}`}>
                    <Card hover className={`p-4 text-center cursor-pointer ${isFirst ? "ring-2 ring-yellow-400 shadow-yellow-400/20" : ""}`}>
                      <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${style.bg} flex items-center justify-center mb-2 shadow-md`}>
                        {leader.profilePicture?.url ? (
                          <img src={leader.profilePicture.url} alt={leader.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-white">{leader.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className={`text-xs font-bold mb-1 ${isFirst ? "text-yellow-500" : "text-slate-500"}`}>
                        {style.label}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{leader.name}</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{leader.coins}</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full List */}
        {loading && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-white dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <Card className="p-8 text-center text-slate-500 dark:text-slate-400">{error}</Card>
        )}

        {!loading && !error && (
          <div className="space-y-2">
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const isMe = user && leader._id === (user._id || user.id);
              return (
                <motion.div
                  key={leader._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link to={`/profile/${leader._id}`}>
                    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                      isMe
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                    }`}>
                      {/* Rank */}
                      <div className={`w-8 text-center text-sm font-bold flex-shrink-0 ${
                        rank <= 3 ? "text-yellow-500" : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : `#${rank}`}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {leader.profilePicture?.url ? (
                          <img src={leader.profilePicture.url} alt={leader.name} className="w-10 h-10 object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">{leader.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* Name + badge + reviews */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
                          {leader.name}
                          {getBadge(leader.coins) && (
                            <span className="text-base" title={getBadge(leader.coins).label}>
                              {getBadge(leader.coins).emoji}
                            </span>
                          )}
                          {isMe && <span className="text-xs font-normal text-yellow-600 dark:text-yellow-400">(you)</span>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Star className="w-3 h-3" />
                          {leader.reviewCount} review{leader.reviewCount !== 1 ? "s" : ""}
                        </div>
                      </div>

                      {/* Coins */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">{leader.coins}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && !error && leaders.length === 0 && (
          <Card className="p-12 text-center text-slate-500 dark:text-slate-400">
            No coin earners yet. Be the first!
          </Card>
        )}
      </div>
    </div>
  );
}
