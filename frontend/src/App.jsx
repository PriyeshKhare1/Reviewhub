import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

const Login           = lazy(() => import("./pages/Login"));
const Register        = lazy(() => import("./pages/Register"));
const VerifyEmail     = lazy(() => import("./pages/VerifyEmail"));
const Home            = lazy(() => import("./pages/Home"));
const CreateReview    = lazy(() => import("./pages/CreateReview"));
const ReviewDetails   = lazy(() => import("./pages/ReviewDetails"));
const EditReview      = lazy(() => import("./pages/EditReview"));
const MyReviews       = lazy(() => import("./pages/MyReviews"));
const AdminDashboard  = lazy(() => import("./pages/AdminDashboard"));
const UserProfile     = lazy(() => import("./pages/UserProfile"));
const EditProfile     = lazy(() => import("./pages/EditProfile"));
const SavedReviews    = lazy(() => import("./pages/SavedReviews"));
const Analytics       = lazy(() => import("./pages/Analytics"));
const Drafts          = lazy(() => import("./pages/Drafts"));
const ForgotPassword  = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword   = lazy(() => import("./pages/ResetPassword"));
const SecuritySettings = lazy(() => import("./pages/SecuritySettings"));
const Notifications   = lazy(() => import("./pages/Notifications"));
const Wallet          = lazy(() => import("./pages/Wallet"));
const Leaderboard     = lazy(() => import("./pages/Leaderboard"));
const Categories      = lazy(() => import("./pages/Categories"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
  </div>
);

export default function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* PUBLIC */}
            <Route path="/reviews/:id" element={<ReviewDetails />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/categories" element={<Categories />} />

            {/* PROTECTED */}
            <Route path="/create-review" element={<ProtectedRoute><CreateReview /></ProtectedRoute>} />
            <Route path="/edit-review/:id" element={<ProtectedRoute><EditReview /></ProtectedRoute>} />
            <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
            <Route path="/saved-reviews" element={<ProtectedRoute><SavedReviews /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/drafts" element={<ProtectedRoute><Drafts /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
