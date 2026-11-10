import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageLoadingContextType {
  isPageLoading: boolean;
  setIsPageLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (msg: string) => void;
}

const PageLoadingContext = createContext<PageLoadingContextType>({
  isPageLoading: false,
  setIsPageLoading: () => {},
  loadingMessage: 'Loading...',
  setLoadingMessage: () => {},
});

export const PageLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading...');
  const location = useLocation();

  // On route change, reset message
  useEffect(() => {
    setLoadingMessage('Loading latest data...');
  }, [location.pathname]);

  return (
    <PageLoadingContext.Provider
      value={{
        isPageLoading,
        setIsPageLoading,
        loadingMessage,
        setLoadingMessage,
      }}
    >
      {children}
    </PageLoadingContext.Provider>
  );
};

export const usePageLoading = () => useContext(PageLoadingContext);

