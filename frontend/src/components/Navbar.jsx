import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import {
  Home,
  PenSquare,
  FileText,
  BarChart3,
  Shield,
  User,
  Bookmark,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileEdit,
  Coins,
  Wallet,
  Trophy,
  FolderOpen
} from "lucide-react";

function NavLink({ to, children, icon: Icon, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, icon: Icon, onClick, isActive }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
        isActive(to)
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </Link>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, coins } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  // Handle click outside for user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    const t = setTimeout(() => {
      setUserMenuOpen(false);
      setMobileOpen(false);
    }, 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
              <span className="text-white font-bold text-lg sm:text-xl">R</span>
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg sm:text-xl tracking-tight hidden xs:inline">
              Review<span className="text-blue-600 dark:text-blue-400">Hub</span>
            </span>
          </Link>

          {/* CENTER NAV (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-1">
            <NavLink to="/" icon={Home} isActive={isActive}>Home</NavLink>
            <NavLink to="/leaderboard" icon={Trophy} isActive={isActive}>Leaderboard</NavLink>
            <NavLink to="/categories" icon={FolderOpen} isActive={isActive}>Categories</NavLink>
            {user && <NavLink to="/create-review" icon={PenSquare} isActive={isActive}>New Review</NavLink>}
            {user && <NavLink to="/drafts" icon={FileEdit} isActive={isActive}>Drafts</NavLink>}
            {user && <NavLink to="/analytics" icon={BarChart3} isActive={isActive}>Analytics</NavLink>}
            {user && user.role === "admin" && <NavLink to="/admin" icon={Shield} isActive={isActive}>Admin</NavLink>}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            {user && <NotificationBell />}
            
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                >
                  {user.profilePicture?.url ? (
                    <img 
                      src={user.profilePicture.url} 
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
                    {/* User Info */}
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name || "User"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{coins}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">coins</span>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={`/profile/${user.id || user._id}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        to="/my-reviews"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FileText className="w-4 h-4" />
                        My Reviews
                      </Link>
                      <Link
                        to="/saved-reviews"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bookmark className="w-4 h-4" />
                        Saved Reviews
                      </Link>
                      <Link
                        to="/wallet"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Wallet className="w-4 h-4" />
                        My Wallet
                        <span className="ml-auto bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full">{coins}</span>
                      </Link>
                      <Link
                        to="/security"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Security Settings
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    
                    {/* Logout */}
                    <div className="border-t border-slate-200 dark:border-slate-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <MobileNavLink to="/" icon={Home} onClick={() => setMobileOpen(false)} isActive={isActive}>
              Home
            </MobileNavLink>
            <MobileNavLink to="/leaderboard" icon={Trophy} onClick={() => setMobileOpen(false)} isActive={isActive}>
              Leaderboard
            </MobileNavLink>
            <MobileNavLink to="/categories" icon={FolderOpen} onClick={() => setMobileOpen(false)} isActive={isActive}>
              Categories
            </MobileNavLink>
            {user && (
              <>
                <MobileNavLink to="/create-review" icon={PenSquare} onClick={() => setMobileOpen(false)} isActive={isActive}>
                  New Review
                </MobileNavLink>
                <MobileNavLink to="/my-reviews" icon={FileText} onClick={() => setMobileOpen(false)} isActive={isActive}>
                  My Reviews
                </MobileNavLink>
                <MobileNavLink to="/drafts" icon={FileEdit} onClick={() => setMobileOpen(false)} isActive={isActive}>
                  Drafts
                </MobileNavLink>
                <MobileNavLink to="/analytics" icon={BarChart3} onClick={() => setMobileOpen(false)} isActive={isActive}>
                  Analytics
                </MobileNavLink>
                <MobileNavLink to="/saved-reviews" icon={Bookmark} onClick={() => setMobileOpen(false)} isActive={isActive}>
                  Saved Reviews
                </MobileNavLink>
                {user.role === "admin" && (
                  <MobileNavLink to="/admin" icon={Shield} onClick={() => setMobileOpen(false)} isActive={isActive}>
                    Admin Dashboard
                  </MobileNavLink>
                )}
              </>
            )}

            {/* Auth Section */}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              {!user ? (
                <div className="space-y-2">
                  <Link 
                    to="/login" 
                    className="block w-full px-4 py-3 text-center rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 font-medium transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block w-full px-4 py-3 text-center rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 font-semibold shadow-lg transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
