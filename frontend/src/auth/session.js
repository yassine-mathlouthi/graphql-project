const STORAGE_KEY = 'atlas-auth-session';
const listeners = new Set();

const anonymousSession = {
  token: '',
  user: null,
  isAuthenticated: false,
  isAdmin: false,
};

function parseStoredSession(rawValue) {
  if (!rawValue) {
    return anonymousSession;
  }

  try {
    const parsed = JSON.parse(rawValue);
    const roles = Array.isArray(parsed?.user?.roles) ? parsed.user.roles : [];
    const token = typeof parsed?.token === 'string' ? parsed.token : '';

    if (!token || !parsed?.user?.id) {
      return anonymousSession;
    }

    return {
      token,
      user: {
        id: parsed.user.id,
        username: parsed.user.username || 'Player',
        email: parsed.user.email || '',
        roles,
      },
      isAuthenticated: true,
      isAdmin: roles.includes('admin'),
    };
  } catch {
    return anonymousSession;
  }
}

let currentSession =
  typeof window === 'undefined'
    ? anonymousSession
    : parseStoredSession(window.localStorage.getItem(STORAGE_KEY));

function emitChange() {
  listeners.forEach(listener => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    currentSession = parseStoredSession(event.newValue);
    emitChange();
  });
}

export function getAuthSession() {
  return currentSession;
}

export function getAuthToken() {
  return currentSession.token;
}

export function subscribeAuthSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function saveAuthSession(payload) {
  currentSession = parseStoredSession(JSON.stringify(payload));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  emitChange();
}

export function clearAuthSession() {
  currentSession = anonymousSession;
  window.localStorage.removeItem(STORAGE_KEY);
  emitChange();
}
