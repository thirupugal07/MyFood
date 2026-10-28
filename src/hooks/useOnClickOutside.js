import { useEffect } from 'react';

export const useOnClickOutside = (ref, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (event) => {
      const element = ref.current;
      if (!element || element.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
};

export default useOnClickOutside;
