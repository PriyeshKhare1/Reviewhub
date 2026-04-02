import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Coins, TrendingUp, TrendingDown, Star, ThumbsUp, ShieldCheck, EyeOff, ArrowLeft, Wallet } from "lucide-react";
import { getBadge, getNextMilestone, BADGES } from "../utils/coinBadge";
import { usePageTitle } from "../hooks/usePageTitle";

const reasonConfig = {
  review_published: {
    label: "Review Published",
    icon: Star,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/30",
  },
  helpful_votes: {
    label: "5+ Helpful Votes",
    icon: ThumbsUp,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
  },
  proof_verified: {
    label: "Proof Verified by Admin",
    icon: ShieldCheck,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/30",
  },
  review_hidden: {
    label: "Review Hidden",
    icon: EyeOff,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
  },
};

export default function WalletPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  usePageTitle("My Wallet", "View your coin balance and transaction history.");
  const [coins, setCoins] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchWallet();
  }, [user, navigate]);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/users/wallet/coins");
      setCoins(res.data.coins);
      setTransactions(res.data.transactions);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const earned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="container mx-auto max-w-3xl">

        {/* Back */}
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 gap-2 bg-white/80 dark:bg-slate-800/80">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-4">
            <Wallet className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              My Coin Wallet
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Earn coins by writing genuine, helpful reviews</p>
        </div>

        {/* Coin Balance Card */}
        <Card className="p-8 text-center bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-2xl mb-6">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <div className="text-6xl font-black text-white mb-2">{coins}</div>
          <div className="text-white/90 text-lg font-medium">Total Coins</div>
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-white font-bold text-xl">{earned}</div>
              <div className="text-white/75 text-xs">Earned</div>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center">
              <div className="text-white font-bold text-xl">{spent}</div>
              <div className="text-white/75 text-xs">Revoked</div>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center">
              <div className="text-white font-bold text-xl">{transactions.length}</div>
              <div className="text-white/75 text-xs">Transactions</div>
            </div>
          </div>
        </Card>

        {/* Badge & Milestone */}
        {(() => {
          const badge = getBadge(coins);
          const next = getNextMilestone(coins);
          const prevMilestone = badge ? badge.min : 0;
          const progress = next ? Math.round(((coins - prevMilestone) / (next - prevMilestone)) * 100) : 100;
          return (
            <Card className="p-6 bg-white/90 dark:bg-slate-800/90 border-0 shadow-lg mb-6">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4">Your Badge</h2>
              {badge ? (
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border text-sm font-semibold ${badge.bg} ${badge.border} ${badge.color} mb-4`}>
                  <span className="text-xl">{badge.emoji}</span>
                  {badge.label}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Earn 5 coins to unlock your first badge.</p>
              )}
              {next && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>{coins} coins</span>
                    <span>Next milestone: {next} coins</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {next - coins} more coin{next - coins !== 1 ? "s" : ""} to unlock next badge
                  </p>
                </div>
              )}
              {!next && (
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">You've reached the highest badge — Legend!</p>
              )}
            </Card>
          );
        })()}

        {/* How to Earn */}
        <Card className="p-6 bg-white/90 dark:bg-slate-800/90 border-0 shadow-lg mb-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> How to Earn Coins
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Star className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-green-800 dark:text-green-300 text-sm">+1 Coin</div>
                <div className="text-green-700 dark:text-green-400 text-xs">Publish a review (min 100 characters)</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <ThumbsUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-300 text-sm">+1 Coin</div>
                <div className="text-blue-700 dark:text-blue-400 text-xs">Your review gets 5+ helpful votes</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-purple-800 dark:text-purple-300 text-sm">+2 Coins</div>
                <div className="text-purple-700 dark:text-purple-400 text-xs">Admin verifies your proof image</div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <EyeOff className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-red-800 dark:text-red-300 text-sm">-1 Coin</div>
              <div className="text-red-700 dark:text-red-400 text-xs">Admin hides your review for being fake or spam — write genuine reviews only</div>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="p-6 bg-white/90 dark:bg-slate-800/90 border-0 shadow-lg">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">Transaction History</h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No transactions yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Publish your first review to earn coins</p>
              <Button onClick={() => navigate("/create-review")} className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500">
                Write a Review
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const config = reasonConfig[tx.reason] || reasonConfig.review_published;
                const Icon = config.icon;
                const isPositive = tx.amount > 0;
                return (
                  <div key={tx._id} className={`flex items-center gap-4 p-4 rounded-xl ${config.bg}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-green-100 dark:bg-green-800/50" : "bg-red-100 dark:bg-red-800/50"}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${config.color}`}>{config.label}</div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs truncate">{tx.description}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className={`text-xl font-black flex-shrink-0 ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {isPositive ? "+" : ""}{tx.amount}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
