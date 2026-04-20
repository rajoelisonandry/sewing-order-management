import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiPackage,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiSettings,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import logoImage from '../../assets/images/logo_gt.png';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const getLinkStyle = (path: string) => {
    const isCurrentPath = isActive(path);
    return `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
      isCurrentPath
        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
    }`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {/* Desktop Navbar */}
      <nav className="hidden md:fixed md:inset-x-0 md:top-0 md:z-50 md:flex md:items-center md:justify-between md:border-b md:border-secondary-200 dark:md:border-secondary-800 md:bg-white dark:md:bg-secondary-900 md:px-6 md:py-4 md:shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logoImage}
            alt="Glow Tailor Logo"
            className="h-14 w-14 rounded-lg object-contain"
          />
          <span className="text-xl font-bold text-secondary-900 dark:text-white">
            Glow Tailor
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className={getLinkStyle('/')}>
            <FiPackage size={20} />
            <span>Commandes</span>
          </Link>

          <Link to="/stats" className={getLinkStyle('/stats')}>
            <FiBarChart2 size={20} />
            <span>Statistiques</span>
          </Link>

          {isAdmin && (
            <Link to="/admin" className={getLinkStyle('/admin')}>
              <FiSettings size={20} />
              <span>Administration</span>
            </Link>
          )}

          <Link to="/profile" className={getLinkStyle('/profile')}>
            <FiUser size={20} />
            <span>
              {user?.user_metadata?.full_name || user?.email || 'Profil'}
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            className="hidden md:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all"
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          <button
            onClick={handleSignOut}
            className="hidden md:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all"
          >
            <FiLogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex md:hidden items-center justify-around gap-3 border-t border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 px-4 py-2 shadow-sm">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 rounded-3xl px-3 py-3 text-[11px] font-semibold transition-colors ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
        >
          <FiPackage size={22} />
          <span>Commandes</span>
        </Link>

        <Link
          to="/stats"
          className={`flex flex-col items-center justify-center gap-1 rounded-3xl px-3 py-3 text-[11px] font-semibold transition-colors ${isActive('/stats') ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
        >
          <FiBarChart2 size={22} />
          <span>Stats</span>
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center gap-1 rounded-3xl px-3 py-3 text-[11px] font-semibold transition-colors ${isActive('/admin') ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
          >
            <FiSettings size={22} />
            <span>Admin</span>
          </Link>
        )}

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center gap-1 rounded-3xl px-3 py-3 text-[11px] font-semibold transition-colors ${isActive('/profile') ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
        >
          <FiUser size={22} />
          <span>Profil</span>
        </Link>
      </nav>

      <main className="pb-24 md:pt-20 md:pb-0 dark:text-secondary-100">
        <Outlet />
      </main>
    </div>
  );
}
