import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';

const FavouritesContext = createContext(null);

export const FavouritesProvider = ({ children }) => {
  const [ids, setIds] = useState(() => {
    const stored = getItem(STORAGE_KEYS.favourites, []);
    return Array.isArray(stored) ? stored : [];
  });

  useEffect(() => {
    setItem(STORAGE_KEYS.favourites, ids);
  }, [ids]);

  const isFavourite = useCallback((id) => ids.includes(id), [ids]);

  const toggleFavourite = useCallback((id) => {
    setIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, []);

  const clearFavourites = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({ ids, count: ids.length, isFavourite, toggleFavourite, clearFavourites }),
    [ids, isFavourite, toggleFavourite, clearFavourites],
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error('useFavourites must be used inside a FavouritesProvider');
  return context;
};
