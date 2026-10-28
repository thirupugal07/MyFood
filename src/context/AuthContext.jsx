import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../lib/api';
import { getItem, removeItem, setItem, STORAGE_KEYS } from '../lib/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getItem(STORAGE_KEYS.token, null));
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(() => Boolean(getItem(STORAGE_KEYS.token, null)));

  /* Re-hydrate the session on first paint so a refresh keeps you signed in. */
  useEffect(() => {
    let cancelled = false;
    const storedToken = getItem(STORAGE_KEYS.token, null);

    if (!storedToken) {
      setInitializing(false);
      return () => {
        cancelled = true;
      };
    }

    api
      .me(storedToken)
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        setToken(storedToken);
      })
      .catch(() => {
        if (cancelled) return;
        removeItem(STORAGE_KEYS.token);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback((session) => {
    setItem(STORAGE_KEYS.token, session.token);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const login = useCallback(
    async (credentials) => persistSession(await api.login(credentials)),
    [persistSession],
  );

  const signup = useCallback(
    async (payload) => persistSession(await api.signup(payload)),
    [persistSession],
  );

  const logout = useCallback(() => {
    removeItem(STORAGE_KEYS.token);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      const updated = await api.updateProfile(token, patch);
      setUser(updated);
      return updated;
    },
    [token],
  );

  const changePassword = useCallback(
    (payload) => api.changePassword(token, payload),
    [token],
  );

  const saveAddress = useCallback(
    async (address) => {
      const updated = await api.saveAddress(token, address);
      setUser(updated);
      return updated;
    },
    [token],
  );

  const deleteAddress = useCallback(
    async (addressId) => {
      const updated = await api.deleteAddress(token, addressId);
      setUser(updated);
      return updated;
    },
    [token],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
      saveAddress,
      deleteAddress,
    }),
    [
      user,
      token,
      initializing,
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
      saveAddress,
      deleteAddress,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
