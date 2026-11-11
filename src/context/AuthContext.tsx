import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CustomerUser } from '../types';
import { authApi } from '../api/auth';
import {
  SESSION_ENDED_EVENT,
  TOKEN_KEY,
  USER_KEY,
  apiClient,
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  isJwt,
  storeSession,
} from '../api/client';

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  loginWithAuthData: (accessToken: string, refreshToken: string, user: CustomerUser) => void;
  logout: () => void;
  /** Replace the cached profile after an edit (keeps the navbar and forms in sync). */
  updateUser: (user: CustomerUser) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readCachedUser = (): CustomerUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const cacheUser = (user: CustomerUser) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
};

/** Signed in = we hold a session that can still be renewed (refresh token) or used (access token). */
const hasSession = () => isJwt(getAccessToken()) || isJwt(getRefreshToken());

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => (hasSession() ? getAccessToken() : null));
  const [user, setUser] = useState<CustomerUser | null>(() => (hasSession() ? readCachedUser() : null));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const resetState = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Confirm the stored session on load. The API client renews an expired access token
  // automatically; only a definitive "session ended" from the server signs the customer out.
  // Network errors or a backend that is still waking up keep the cached profile.
  useEffect(() => {
    const init = async () => {
      if (!hasSession()) {
        clearStoredSession();
        resetState();
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authApi.getProfile();
        if (profile) {
          setUser(profile);
          cacheUser(profile);
        }
        setToken(getAccessToken());
      } catch {
        if (!hasSession()) resetState();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [resetState]);

  // Session ended by the server (refresh rejected) → reflect it in the UI
  useEffect(() => {
    const onEnded = () => resetState();
    window.addEventListener(SESSION_ENDED_EVENT, onEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onEnded);
  }, [resetState]);

  // Keep every open tab in sync: log in / log out / token renewals in one tab apply to all
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        if (!e.newValue) resetState();
        else setToken(e.newValue);
      } else if (e.key === USER_KEY) {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      } else if (e.key === null) {
        // localStorage.clear() in another tab
        if (!hasSession()) resetState();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [resetState]);

  const loginWithAuthData = (accessToken: string, refreshToken: string, customerUser: CustomerUser) => {
    if (!isJwt(accessToken)) {
      console.error('Invalid token rejected in loginWithAuthData');
      return;
    }
    storeSession(accessToken, refreshToken);
    cacheUser(customerUser);
    setToken(accessToken);
    setUser(customerUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    const refreshToken = getRefreshToken();
    clearStoredSession();
    resetState();
    // End this device's session on the server too (works even if the access token expired)
    apiClient.post('/auth/customer/logout', { refreshToken }).catch(() => undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginWithAuthData,
        logout,
        updateUser: (next: CustomerUser) => {
          setUser(next);
          cacheUser(next);
        },
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
