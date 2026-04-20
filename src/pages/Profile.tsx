import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiLogOut, FiMoon, FiSun } from 'react-icons/fi';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-semibold text-primary-700 dark:text-primary-400">
          Mon Profil
        </h1>

        <div className="rounded-3xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 p-8 shadow-sm">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-5xl text-white shadow-lg">
                👩‍🦰
              </div>
              <p className="text-center text-sm text-secondary-500 dark:text-secondary-400">
                Informations de l'utilisateur authentifié.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: 'Nom',
                  value: user?.user_metadata?.full_name || 'Utilisateur',
                },
                {
                  label: 'Email',
                  value: user?.email || 'Non renseigné',
                },
                {
                  label: 'Rôle',
                  value: user?.user_metadata?.role || 'Utilisateur',
                },
              ].map((field) => (
                <div
                  key={field.label}
                  className="rounded-3xl bg-secondary-50 dark:bg-secondary-800 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">
                    {field.label}
                  </p>
                  <p className="mt-2 text-base text-secondary-900 dark:text-white">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile - Buttons */}
          <div className="md:hidden flex flex-col gap-4 mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-700">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-all"
              title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
              <span>{theme === 'light' ? 'Mode sombre' : 'Mode clair'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
            >
              <FiLogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
