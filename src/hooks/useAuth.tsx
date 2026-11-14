import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';

// Minimal mock types that satisfy the Supabase User/Session shape
type MockUser = Pick<User, 'id' | 'email'> & Partial<Omit<User, 'id' | 'email'>>;
type MockSession = Pick<Session, 'user'> & Partial<Omit<Session, 'user'>>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (mockUser: MockUser, mockSession: MockSession, remember: boolean) => void;
  signOut: () => Promise<void>;
  /** Verify email + password against stored mock users. Returns user if valid, null otherwise. */
  verifyCredentials: (email: string, password: string) => { user: MockUser | null; error: string | null };
  /** Check if email already registered */
  isEmailRegistered: (email: string) => boolean;
  /** Store returnTo path for post-login redirect */
  setReturnTo: (path: string) => void;
  /** Get and clear returnTo path */
  getReturnTo: () => string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: () => {},
  signOut: async () => {},
  verifyCredentials: () => ({ user: null, error: 'Not implemented' }),
  isEmailRegistered: () => false,
  setReturnTo: () => {},
  getReturnTo: () => '/',
});

const STORAGE_KEYS = {
  MOCK_USER: 'zentra-mock-user',
  MOCK_SESSION: 'zentra-mock-session',
  REMEMBER: 'zentra-remember',
  SESSION_ALIVE: 'zentra-session-alive',
  RETURN_TO: 'zentra-return-to',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function safeGetItem(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSetItem(storage: Storage | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemoveItem(storage: Storage | undefined, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // ignore
  }
}

function getStorage(remember: boolean): Storage | undefined {
  if (!isBrowser()) return undefined;
  return remember ? localStorage : sessionStorage;
}

function parseStoredUser(storage: Storage | undefined): { user: MockUser | null; session: MockSession | null } {
  if (!storage) return { user: null, session: null };
  try {
    const userStr = safeGetItem(storage, STORAGE_KEYS.MOCK_USER);
    const sessionStr = safeGetItem(storage, STORAGE_KEYS.MOCK_SESSION);
    if (userStr && sessionStr) {
      return {
        user: JSON.parse(userStr) as MockUser,
        session: JSON.parse(sessionStr) as MockSession,
      };
    }
  } catch {
    // ignore parse errors
  }
  return { user: null, session: null };
}

function clearAuthStorage() {
  if (!isBrowser()) return;
  [localStorage, sessionStorage].forEach((storage) => {
    safeRemoveItem(storage, STORAGE_KEYS.MOCK_USER);
    safeRemoveItem(storage, STORAGE_KEYS.MOCK_SESSION);
  });
  safeSetItem(localStorage, STORAGE_KEYS.REMEMBER, '0');
  safeRemoveItem(sessionStorage, STORAGE_KEYS.SESSION_ALIVE);
}

function getInitialAuth(): { user: User | null; session: Session | null } {
  if (!isBrowser()) return { user: null, session: null };
  try {
    const isRemembered = safeGetItem(localStorage, STORAGE_KEYS.REMEMBER) !== '0';
    const isSessionAlive = safeGetItem(sessionStorage, STORAGE_KEYS.SESSION_ALIVE) === '1';
    safeSetItem(sessionStorage, STORAGE_KEYS.SESSION_ALIVE, '1');

    if (!isRemembered && !isSessionAlive) {
      clearAuthStorage();
      return { user: null, session: null };
    }

    const storage = isRemembered ? localStorage : sessionStorage;
    const { user, session } = parseStoredUser(storage);
    return { user: user as User | null, session: session as Session | null };
  } catch {
    return { user: null, session: null };
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getInitialAuth().user);
  const [session, setSession] = useState<Session | null>(() => getInitialAuth().session);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;
    const init = getInitialAuth();
    if (init.user?.id !== user?.id) {
      setUser(init.user);
      setSession(init.session);
    }
    setLoading(false);
  }, []);

  /**
   * Call this immediately after a successful mock login.
   * It updates the in-memory auth context state so protected routes can
   * render without waiting for a full page reload.
   */
  const signIn = (mockUser: MockUser, mockSession: MockSession, remember: boolean) => {
    if (isBrowser()) {
      // Persist to storage so the state survives navigation & tab restores
      const storage = getStorage(remember);
      storage.setItem(STORAGE_KEYS.MOCK_USER, JSON.stringify(mockUser));
      storage.setItem(STORAGE_KEYS.MOCK_SESSION, JSON.stringify(mockSession));
      localStorage.setItem(STORAGE_KEYS.REMEMBER, remember ? '1' : '0');
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ALIVE, '1');
    }

    // *** Key fix: update the React state immediately so the context
    // reflects the signed-in user without needing a page reload. ***
    setUser(mockUser as User);
    setSession(mockSession as Session);
    console.log('[Auth] Signed in, updated context state', { email: mockUser.email, remember });
  };

  const signOut = async () => {
    // Clear mock auth state
    clearAuthStorage();
    setSession(null);
    setUser(null);
    console.log('[Auth] Signed out, cleared mock auth state');
  };

  /**
   * Verify credentials against stored mock users.
   * In a real app this would hit an API. Here we check localStorage/sessionStorage.
   */
  const verifyCredentials = (email: string, password: string): { user: MockUser | null; error: string | null } => {
    if (!isBrowser()) return { user: null, error: 'Not available on server.' };
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { user: null, error: 'Please enter both email and password.' };
    }

    if (password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters.' };
    }

    // Check both storages for a matching user
    const storages = [localStorage, sessionStorage];
    for (const storage of storages) {
      try {
        const userStr = storage.getItem(STORAGE_KEYS.MOCK_USER);
        if (userStr) {
          const parsed = JSON.parse(userStr) as { id: string; email: string };
          if (parsed.email.toLowerCase() === trimmedEmail) {
            // Email exists - in mock auth, any password >= 6 chars works
            // Return the existing user so they keep their ID
            return { user: parsed, error: null };
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    return { user: null, error: 'Wrong email or password.' };
  };

  /**
   * Check if email is already registered (exists in storage).
   */
  const isEmailRegistered = (email: string): boolean => {
    if (!isBrowser()) return false;
    const trimmedEmail = email.trim().toLowerCase();
    const storages = [localStorage, sessionStorage];
    for (const storage of storages) {
      try {
        const userStr = storage.getItem(STORAGE_KEYS.MOCK_USER);
        if (userStr) {
          const parsed = JSON.parse(userStr) as { email: string };
          if (parsed.email.toLowerCase() === trimmedEmail) {
            return true;
          }
        }
      } catch {
        // ignore
      }
    }
    return false;
  };

  /**
   * Store the path to redirect to after login.
   */
  const setReturnTo = (path: string) => {
    if (isBrowser()) sessionStorage.setItem(STORAGE_KEYS.RETURN_TO, path);
  };

  /**
   * Get and clear the stored returnTo path.
   */
  const getReturnTo = (): string => {
    if (!isBrowser()) return '/';
    const path = sessionStorage.getItem(STORAGE_KEYS.RETURN_TO) || '/';
    sessionStorage.removeItem(STORAGE_KEYS.RETURN_TO);
    return path;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signOut,
        verifyCredentials,
        isEmailRegistered,
        setReturnTo,
        getReturnTo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);