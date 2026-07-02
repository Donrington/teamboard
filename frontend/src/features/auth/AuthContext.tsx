import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResponse, LoginPayload, SignupPayload, UserPublic } from '@teamboard/shared';
import { api, tokenStore, setUnauthorizedHandler } from '@/services/api';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: UserPublic | null;
  status: Status;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  /** Merges a profile change (name/avatar) into the cached user without a refetch. */
  updateUser: (patch: Partial<UserPublic>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Holds session state (docs/06). The token lives in localStorage; the user object
 * lives here in memory. On mount we validate any existing token against `/auth/me`,
 * and a 401 from anywhere (via the axios interceptor) triggers `logout`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    const token = tokenStore.get();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }
    api
      .get<UserPublic>('/auth/me')
      .then((res) => {
        setUser(res.data);
        setStatus('authenticated');
      })
      .catch(() => logout());
  }, [logout]);

  const applyAuth = useCallback((data: AuthResponse) => {
    tokenStore.set(data.accessToken);
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await api.post<AuthResponse>('/auth/login', payload);
      applyAuth(res.data);
    },
    [applyAuth],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const res = await api.post<AuthResponse>('/auth/signup', payload);
      applyAuth(res.data);
    },
    [applyAuth],
  );

  const updateUser = useCallback((patch: Partial<UserPublic>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, status, login, signup, logout, updateUser }),
    [user, status, login, signup, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
