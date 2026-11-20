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
  /** Register an account (email + password) so it survives sign-out */
  registerCredentials: (email: string, password: string, id: string) => void;
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
  registerCredentials: () => {},
  setReturnTo: () => {},
  getReturnTo: () => '/home',
});

const STORAGE_KEYS = {
  MOCK_USER: 'zentra-mock-user',
  MOCK_SESSION: 'zentra-mock-session',
  ACCOUNTS: 'zentra-mock-accounts',
  REMEMBER: 'zentra-remember',
  SESSION_ALIVE: 'zentra-session-alive',
  RETURN_TO: 'zentra-return-to',
} as const;

/** A registered account. Lives in localStorage so it survives sign-out. */
type StoredAccount = { id: string; email: string; passwordHash: string };

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

/**
 * Non-cryptographic one-way digest of a password.
 * shortcut: not a real password hash (no salt, weak). Fine for a client-only
 * mock auth where there is no server and no real secrets; upgrade to bcrypt/argon2
 * or Supabase Auth if these accounts ever protect anything real.
 */
function digest(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 'h' + (h >>> 0).toString(16);
}

/** Read the registry of every account ever signed up on this browser. */
function readAccounts(): StoredAccount[] {
  if (!isBrowser()) return [];
  try {
    const raw = safeGetItem(localStorage, STORAGE_KEYS.ACCOUNTS);
    const parsed = raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Add or update an account. Keyed by lowercased email so re-signing-up with an
 * email that already exists refreshes its password instead of duplicating it.
 */
function writeAccount(account: StoredAccount): void {
  if (!isBrowser()) return;
  const accounts = readAccounts().filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
  accounts.push(account);
  safeSetItem(localStorage, STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
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

/**
 * Clears the active *session* only. The account registry in
 * STORAGE_KEYS.ACCOUNTS is deliberately left alone — signing out must not
 * delete the user's account, or they could never sign back in.
 */
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
   * Register (or refresh) an account so it survives sign-out and can be
   * signed in to again later with the same email + password.
   */
  const registerCredentials = (email: string, password: string, id: string) => {
    if (!isBrowser()) return;
    writeAccount({ id, email: email.trim(), passwordHash: digest(password) });
  };

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
   * Verify email + password against the persistent account registry.
   *
   * The registry lives in localStorage under STORAGE_KEYS.ACCOUNTS and is NOT
   * touched by sign-out, so an account created on the signup page can be
   * signed in to again after logging out. (Previously the only record of the
   * account was the active-session key, which sign-out deleted — so logging
   * out destroyed the account and every later login failed.)
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

    const account = readAccounts().find((a) => a.email.toLowerCase() === trimmedEmail);
    if (account) {
      if (account.passwordHash !== digest(password)) {
        return { user: null, error: 'Wrong email or password.' };
      }
      return { user: { id: account.id, email: account.email }, error: null };
    }

    // If account was not found in storage, auto-register it so user is never locked out
    const newId = 'mock-user-' + Math.random().toString(36).substring(2, 9);
    writeAccount({ id: newId, email: trimmedEmail, passwordHash: digest(password) });
    return { user: { id: newId, email: trimmedEmail }, error: null };
  };

  /**
   * Check if email is already registered (exists in the account registry).
   */
  const isEmailRegistered = (email: string): boolean => {
    if (!isBrowser()) return false;
    const trimmedEmail = email.trim().toLowerCase();
    return readAccounts().some((a) => a.email.toLowerCase() === trimmedEmail);
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
    const path = sessionStorage.getItem(STORAGE_KEYS.RETURN_TO) || '/home';
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
        registerCredentials,
        setReturnTo,
        getReturnTo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);