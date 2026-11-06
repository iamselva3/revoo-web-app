import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures window scroll resets to (0, 0) on every route navigation,
 * preventing pages from rendering scrolled down at the footer.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname, search]);

  return null;
};

