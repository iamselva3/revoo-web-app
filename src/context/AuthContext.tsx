import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  loginWithAuthData: (accessToken: string, refreshToken: string, user: CustomerUser) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(() => {
    const cached = localStorage.getItem('revoo_customer_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('revoo_customer_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('revoo_customer_token');
      if (storedToken) {
        try {
          const profile = await authApi.getProfile();
          if (profile) {
            setUser(profile);
            localStorage.setItem('revoo_customer_user', JSON.stringify(profile));
          }
        } catch {
          // Token might be expired or invalid
          localStorage.removeItem('revoo_customer_token');
          localStorage.removeItem('revoo_customer_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginWithAuthData = (
    accessToken: string,
    refreshToken: string,
    customerUser: CustomerUser
  ) => {
    setToken(accessToken);
    setUser(customerUser);
    localStorage.setItem('revoo_customer_token', accessToken);
    localStorage.setItem('revoo_customer_refresh_token', refreshToken);
    localStorage.setItem('revoo_customer_user', JSON.stringify(customerUser));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('revoo_customer_token');
    localStorage.removeItem('revoo_customer_refresh_token');
    localStorage.removeItem('revoo_customer_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginWithAuthData,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

