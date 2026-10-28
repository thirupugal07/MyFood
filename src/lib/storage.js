/**
 * Tiny wrapper around localStorage so every key is namespaced and every read
 * is defensive (private mode, quota errors, corrupted JSON).
 */
const PREFIX = 'myfood:';

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

export const getItem = (key, fallback = null) => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const setItem = (key, value) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked - the app still works in memory */
  }
};

export const removeItem = (key) => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
};

export const clearAll = () => {
  if (!isBrowser) return;
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
};

export const STORAGE_KEYS = {
  token: 'token',
  cart: 'cart',
  favourites: 'favourites',
  orders: 'orders',
  users: 'users',
  theme: 'theme',
  location: 'location',
  recentSearches: 'recent-searches',
  lastAddress: 'last-address',
};
