import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Calendar, Star, Eye, Heart, MessageSquare, Edit, Users, UserPlus, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReviewCard from "../components/ReviewCard";
import VerifiedBadge from "../components/VerifiedBadge";
import { Button } from "../components/ui/button";
import api from "../api/axios";
import { motion } from "framer-motion";
import { usePageTitle } from "../hooks/usePageTitle";

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  usePageTitle("Profile", "View user profile on ReviewHub.");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?._id === id || currentUser?.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/profile/${id}`);
        setProfile(res.data);
        // Check if current user is following this profile
        if (currentUser && res.data.user.followers) {
          setIsFollowing(res.data.user.followers.includes(currentUser._id || currentUser.id));
        }
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      setFollowLoading(true);
      const res = await api.post(`/users/${id}/follow`);
      setIsFollowing(res.data.isFollowing);
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          followers: res.data.isFollowing 
            ? [...(prev.user.followers || []), currentUser._id || currentUser.id]
            : (prev.user.followers || []).filter(f => f !== (currentUser._id || currentUser.id))
        }
      }));
    } catch (err) {
      console.error("Failed to follow/unfollow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden mb-8"
        >
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

          <div className="px-6 pb-6">
            {/* Avatar & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-4">
              {/* Avatar */}
              <div className="relative">
                {profile.user.profilePicture?.url ? (
                  <img
                    src={profile.user.profilePicture.url}
                    alt={profile.user.name}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white dark:border-slate-900 shadow-xl">
                    {profile.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  {profile.user.name}
                  {profile.user.isEmailVerified && (
                    <VerifiedBadge type="email" size="lg" />
                  )}
                  {profile.user.isVerified && (
                    <VerifiedBadge type="verified" size="lg" />
                  )}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-3">{profile.user.email}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDistanceToNow(new Date(profile.joinedAt), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {profile.reviewCount} {profile.reviewCount === 1 ? "Review" : "Reviews"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {profile.user.followers?.length || 0} Followers
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {profile.user.following?.length || 0} Following
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Link to="/profile/edit">
                    <Button variant="outline" className="gap-2 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </Link>
                ) : currentUser && (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`gap-2 ${isFollowing ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}
                  >
                    {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.user.bio && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-slate-700 dark:text-slate-300">{profile.user.bio}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {isOwnProfile ? "Your Reviews" : `${profile.user.name}'s Reviews`}
          </h2>

          {profile.reviews.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Star className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {isOwnProfile ? "You haven't created any reviews yet" : "No reviews yet"}
              </p>
              {isOwnProfile && (
                <Link to="/create-review" className="inline-block mt-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Create Your First Review
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
