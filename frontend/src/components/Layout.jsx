import { useEffect, useRef, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Gamepad2, ChevronDown, Shield, LogOut, LogIn, UserRound } from 'lucide-react';
import { getKeycloakUserState, login, logout } from '../auth/keycloakUser';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userState, setUserState] = useState(getKeycloakUserState());
  const menuRef = useRef(null);

  useEffect(() => {
    const syncUserState = () => setUserState(getKeycloakUserState());

    syncUserState();

    const onDocumentClick = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    window.addEventListener('focus', syncUserState);

    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      window.removeEventListener('focus', syncUserState);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gray-900 text-white p-2 rounded group-hover:bg-gray-800 transition-colors">
              <Gamepad2 size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Atlas
            </span>
          </Link>

          <nav className="flex items-center gap-3 relative" ref={menuRef}>
            {userState.isAdmin && (
              <Link
                to="/add-game"
                className="px-4 py-2 bg-gray-900 text-sm font-medium text-white rounded hover:bg-gray-800 transition-colors"
              >
                Add Project
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span className="h-7 w-7 rounded-full bg-gray-900 text-white inline-flex items-center justify-center">
                <UserRound size={14} />
              </span>
              <span className="hidden sm:inline text-sm font-semibold text-gray-800 max-w-[160px] truncate">
                {userState.username}
              </span>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-[300px] border border-gray-200 bg-white shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)] rounded-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900" />
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">Current Session</p>
                    <p className="text-base font-bold text-gray-900 mt-1">{userState.username}</p>
                    <p className="text-xs text-gray-500 mt-1">{userState.email || 'No email exposed in token claims'}</p>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 border border-gray-200 rounded-md p-3 bg-gray-50">
                    <p><span className="font-semibold text-gray-800">Realm:</span> {userState.realm}</p>
                    <p><span className="font-semibold text-gray-800">Client:</span> {userState.clientId}</p>
                    <p><span className="font-semibold text-gray-800">Status:</span> {userState.isAuthenticated ? 'Authenticated' : 'Anonymous'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {userState.isAdmin && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] uppercase tracking-widest font-bold border rounded bg-gray-900 text-white border-gray-900"
                      >
                        <Shield size={11} /> admin
                      </span>
                    )}
                  </div>

                  {userState.isAuthenticated ? (
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full h-10 rounded-md border border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-sm font-semibold text-gray-800 flex items-center justify-center gap-2"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={login}
                      className="w-full h-10 rounded-md border border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-sm font-semibold text-gray-800 flex items-center justify-center gap-2"
                    >
                      <LogIn size={15} /> Login
                    </button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} Atlas Games Database. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
