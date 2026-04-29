import { useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { Outlet, Link } from 'react-router-dom';
import { ChevronDown, Shield, LogOut, LogIn, UserRound, UserPlus, Sparkles, KeyRound } from 'lucide-react';
import { LOGIN, REGISTER } from '../graphql/mutations';
import { clearAuthSession, saveAuthSession } from '../auth/session';
import { useAuthSession } from '../auth/useAuthSession';
import BackgroundFX from './BackgroundFX';

function AtlasLogo() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="atlas-logo-svg"
    >
      <defs>
        <linearGradient id="atlasPeak" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6d1b4" />
          <stop offset="55%" stopColor="#d97a4a" />
          <stop offset="100%" stopColor="#8f3f22" />
        </linearGradient>
      </defs>
      <path d="M12 49 28 14h8l16 35h-9l-4.5-10h-13L21 49Z" fill="url(#atlasPeak)" />
      <path d="M31 22 22.5 41h6.8l3.7-8.5 3.8 8.5h6.7L35 22Z" fill="#fff7ef" opacity="0.95" />
      <circle cx="48" cy="17" r="4" fill="#fff7ef" opacity="0.9" />
    </svg>
  );
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    adminCode: '',
  });
  const menuRef = useRef(null);
  const apolloClient = useApolloClient();
  const userState = useAuthSession();

  const [loginMutation, { loading: loginLoading, error: loginError }] = useMutation(LOGIN, {
    onCompleted: ({ login }) => {
      saveAuthSession(login);
      setMenuOpen(false);
      setAuthForm(prev => ({ ...prev, password: '' }));
    },
  });

  const [registerMutation, { loading: registerLoading, error: registerError }] = useMutation(REGISTER, {
    onCompleted: ({ register }) => {
      saveAuthSession(register);
      setMenuOpen(false);
      setAuthForm({ username: '', email: '', password: '', adminCode: '' });
    },
  });

  useEffect(() => {
    const onDocumentClick = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);

    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, []);

  const authError = authMode === 'login' ? loginError : registerError;
  const authLoading = authMode === 'login' ? loginLoading : registerLoading;

  const handleAuthSubmit = async event => {
    event.preventDefault();

    if (authMode === 'login') {
      await loginMutation({
        variables: {
          email: authForm.email.trim(),
          password: authForm.password,
        },
      });
      return;
    }

    await registerMutation({
      variables: {
        username: authForm.username.trim(),
        email: authForm.email.trim(),
        password: authForm.password,
        adminCode: authForm.adminCode.trim() || null,
      },
    });
  };

  const handleLogout = async () => {
    clearAuthSession();
    setMenuOpen(false);
    await apolloClient.clearStore();
  };

  return (
    <div className="min-h-screen flex flex-col text-[var(--atlas-ink)]">
      <BackgroundFX />
      <header className="sticky top-0 z-20 border-b border-[var(--atlas-line)] bg-[rgba(13,17,31,0.84)] backdrop-blur-md">
        <div className="atlas-header-glow atlas-header-glow-left" aria-hidden="true" />
        <div className="atlas-header-glow atlas-header-glow-right" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="atlas-brand-mark atlas-float-soft group-hover:translate-y-[-1px] transition-transform">
              <AtlasLogo />
            </div>
            <div>
              <span className="atlas-wordmark">Atlas</span>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--atlas-glow-soft)]">Games Registry</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3 relative" ref={menuRef}>
            {userState.isAdmin && (
              <Link
                to="/add-game"
                className="atlas-action-chip"
              >
                New Record
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              className="atlas-session-trigger"
            >
              <span className="h-8 w-8 rounded-full bg-[var(--atlas-ink)] text-[var(--atlas-surface)] inline-flex items-center justify-center shadow-[0_8px_20px_rgba(40,24,12,0.18)]">
                <UserRound size={14} />
              </span>
              <span className="hidden sm:inline text-sm font-semibold max-w-[160px] truncate text-[var(--atlas-surface)]">
                {userState.user?.username || 'Guest Access'}
              </span>
              <ChevronDown size={16} className={`text-[var(--atlas-glow-soft)] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-[340px] atlas-panel overflow-hidden">
                <div className="atlas-panel-topper" />
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-muted)] font-semibold">Current Session</p>
                    <p className="atlas-panel-title mt-2">{userState.user?.username || 'Anonymous browser'}</p>
                    <p className="text-xs text-[var(--atlas-muted)] mt-1">{userState.user?.email || 'Browse freely or sign in to manage records.'}</p>
                  </div>

                  <div className="atlas-info-block text-xs space-y-1">
                    <p><span className="font-semibold text-[var(--atlas-ink)]">Mode:</span> {userState.isAuthenticated ? 'Signed in' : 'Public browse'}</p>
                    <p><span className="font-semibold text-[var(--atlas-ink)]">Role:</span> {userState.isAdmin ? 'Administrator' : 'Reader'}</p>
                    <p><span className="font-semibold text-[var(--atlas-ink)]">Access:</span> Live GraphQL session</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {userState.isAdmin && (
                      <span className="atlas-badge">
                        <Shield size={11} /> admin
                      </span>
                    )}
                    {userState.isAuthenticated && !userState.isAdmin && (
                      <span className="atlas-badge atlas-badge-soft">
                        <Sparkles size={11} /> member
                      </span>
                    )}
                  </div>

                  {userState.isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="atlas-ghost-button w-full justify-center"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 rounded-full bg-[rgba(117,92,67,0.08)] p-1">
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${authMode === 'login' ? 'bg-[var(--atlas-ink)] text-[var(--atlas-surface)]' : 'text-[var(--atlas-muted)]'}`}
                        >
                          <span className="inline-flex items-center gap-2"><LogIn size={14} /> Sign in</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('register')}
                          className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${authMode === 'register' ? 'bg-[var(--atlas-ink)] text-[var(--atlas-surface)]' : 'text-[var(--atlas-muted)]'}`}
                        >
                          <span className="inline-flex items-center gap-2"><UserPlus size={14} /> Register</span>
                        </button>
                      </div>

                      <form onSubmit={handleAuthSubmit} className="space-y-3">
                        {authMode === 'register' && (
                          <label className="space-y-1 block">
                            <span className="atlas-field-label">Username</span>
                            <input
                              type="text"
                              required
                              minLength={3}
                              value={authForm.username}
                              onChange={event => setAuthForm(prev => ({ ...prev, username: event.target.value }))}
                              className="atlas-input"
                              placeholder="atlas-admin"
                            />
                          </label>
                        )}

                        <label className="space-y-1 block">
                          <span className="atlas-field-label">Email</span>
                          <input
                            type="email"
                            required
                            value={authForm.email}
                            onChange={event => setAuthForm(prev => ({ ...prev, email: event.target.value }))}
                            className="atlas-input"
                            placeholder="player@atlas.dev"
                          />
                        </label>

                        <label className="space-y-1 block">
                          <span className="atlas-field-label">Password</span>
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={authForm.password}
                            onChange={event => setAuthForm(prev => ({ ...prev, password: event.target.value }))}
                            className="atlas-input"
                            placeholder="At least 8 characters"
                          />
                        </label>

                        {authMode === 'register' && (
                          <label className="space-y-1 block">
                            <span className="atlas-field-label">Admin invite code</span>
                            <input
                              type="text"
                              value={authForm.adminCode}
                              onChange={event => setAuthForm(prev => ({ ...prev, adminCode: event.target.value }))}
                              className="atlas-input"
                              placeholder="Optional"
                            />
                          </label>
                        )}

                        {authError && (
                          <div className="rounded-2xl border border-[rgba(166,57,18,0.2)] bg-[rgba(230,114,57,0.08)] px-4 py-3 text-sm text-[#8b3417]">
                            {authError.message}
                          </div>
                        )}

                        {authMode === 'register' && (
                          <p className="text-xs leading-5 text-[var(--atlas-muted)]">
                            The first registered account becomes admin automatically. After that, admin access requires a matching invite code.
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="atlas-primary-button w-full justify-center"
                        >
                          <KeyRound size={15} />
                          {authLoading ? 'Working...' : authMode === 'login' ? 'Enter Atlas' : 'Create Account'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 atlas-page-enter">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--atlas-line)] bg-[rgba(9,12,23,0.86)] py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[var(--atlas-muted)] font-medium">
          &copy; {new Date().getFullYear()} Atlas Games Database. Local auth, live updates, and studio cataloging in one place.
        </div>
      </footer>
    </div>
  );
}
