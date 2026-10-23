import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, setUnauthorizedHandler } from './api';
import {
  clearSession as clearStorageSession,
  loadSession as loadStorageSession,
  saveSession as saveStorageSession,
} from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialSession = loadStorageSession();

  const [token, setToken] = useState(initialSession.token);
  const [user, setUser] = useState(initialSession.student);
  const [loading, setLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');

  const clearSessionMessage = useCallback(() => {
    setSessionMessage('');
  }, []);

  const saveSession = useCallback((newToken, studentData) => {
    saveStorageSession(newToken, studentData);
    setToken(newToken);
    setUser(studentData);
    setSessionMessage('');
  }, []);

  const logout = useCallback(() => {
    clearStorageSession();
    setToken(null);
    setUser(null);
  }, []);

  // Listen to 401 unauthenticated events from API calls
  useEffect(() => {
    setUnauthorizedHandler((msg) => {
      logout();
      setSessionMessage(msg || 'Your session has expired. Please log in again.');
    });
  }, [logout]);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const data = await authApi.login(credentials);
        saveSession(data.token, data.student);
        return data.student;
      } finally {
        setLoading(false);
      }
    },
    [saveSession]
  );

  const adminLogin = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const data = await authApi.login(credentials);
        if (data.student?.role !== 'ADMIN') {
          throw new Error('Access denied. This account does not possess administrative privileges.');
        }
        saveSession(data.token, data.student);
        return data.student;
      } finally {
        setLoading(false);
      }
    },
    [saveSession]
  );

  const register = useCallback(
    async (details) => {
      setLoading(true);
      try {
        const data = await authApi.register(details);
        saveSession(data.token, data.student);
        return data.student;
      } finally {
        setLoading(false);
      }
    },
    [saveSession]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const profile = await authApi.getProfile();
      setUser((current) => {
        const updated = { ...current, ...profile };
        saveStorageSession(token, updated);
        return updated;
      });
      return profile;
    } catch {
      return null;
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      student: user, // Alias for student components
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
      sessionMessage,
      clearSessionMessage,
      login,
      adminLogin,
      register,
      logout,
      refreshProfile,
    }),
    [
      user,
      token,
      loading,
      sessionMessage,
      clearSessionMessage,
      login,
      adminLogin,
      register,
      logout,
      refreshProfile,
    ]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}

export default AuthContext;
