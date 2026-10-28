import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';

const LocationContext = createContext(null);

const DEFAULT_AREA = 'Anna Nagar';

export const LocationProvider = ({ children }) => {
  const [area, setAreaState] = useState(() => getItem(STORAGE_KEYS.location, DEFAULT_AREA));

  const setArea = useCallback((next) => {
    setAreaState(next);
    setItem(STORAGE_KEYS.location, next);
  }, []);

  const value = useMemo(
    () => ({ area, setArea, city: 'Chennai', defaultArea: DEFAULT_AREA }),
    [area, setArea],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

/* Named `useDeliveryLocation` on purpose - react-router already owns `useLocation`. */
export const useDeliveryLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useDeliveryLocation must be used inside a LocationProvider');
  return context;
};
