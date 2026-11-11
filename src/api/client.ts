import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://revoo-backend-ivqq.onrender.com/api/v1';

// ---------------------------------------------------------------------------------------------
// Session storage
// ---------------------------------------------------------------------------------------------
export const TOKEN_KEY = 'revoo_customer_token';
export const REFRESH_KEY = 'revoo_customer_refresh_token';
export const USER_KEY = 'revoo_customer_user';
/** Fired (on window) when the server says the session has really ended. */
export const SESSION_ENDED_EVENT = 'genie:session-ended';

const read = (key: string): string | null => {
  try {
    const v = localStorage.getItem(key);
    return v && v !== 'undefined' && v !== 'null' ? v : null;
  } catch {
    return null;
  }
};

export const isJwt = (token: string | null | undefined): token is string =>
  typeof token === 'string' && token.trim().split('.').length === 3;

export const getAccessToken = () => read(TOKEN_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);

export const storeSession = (accessToken: string, refreshToken?: string | null) => {
  try {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch {
    // storage unavailable
  }
};

export const clearStoredSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
};

const endSession = () => {
  clearStoredSession();
  window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
};

/** Milliseconds until the JWT expires (negative when already expired), or null if unknown. */
const msUntilExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 - Date.now() : null;
  } catch {
    return null;
  }
};

const EXPIRY_MARGIN_MS = 60 * 1000;
const isExpiringSoon = (token: string) => {
  const ms = msUntilExpiry(token);
  return ms !== null && ms < EXPIRY_MARGIN_MS;
};

// ---------------------------------------------------------------------------------------------
// Refresh: one at a time per tab (shared promise) and across tabs (Web Locks)
// ---------------------------------------------------------------------------------------------
let inFlightRefresh: Promise<string | null> | null = null;

/**
 * Exchanges the stored refresh token for a new access token.
 * Resolves with the new access token, or null when the session has definitively ended
 * (the server answered 401/403). Rejects on network/server errors so a sleeping or
 * redeploying backend never logs the customer out.
 */
export const refreshAccessToken = (staleToken?: string | null): Promise<string | null> => {
  if (inFlightRefresh) return inFlightRefresh;

  const run = async (): Promise<string | null> => {
    // Another tab (or an earlier request) may already have renewed the session
    const current = getAccessToken();
    if (isJwt(current) && current !== staleToken && !isExpiringSoon(current)) return current;

    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/customer/refresh-token`, { refreshToken }, { timeout: 70000 });
      const data = res.data?.data || {};
      if (!isJwt(data.accessToken)) throw new Error('Malformed refresh response');
      storeSession(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      if (status === 400 || status === 401 || status === 403) return null;
      throw err;
    }
  };

  const locks = typeof navigator !== 'undefined' ? (navigator as any).locks : undefined;
  const task: Promise<string | null> = locks?.request ? locks.request('genie-auth-refresh', run) : run();

  inFlightRefresh = task
    .then((token) => {
      if (!token) endSession();
      return token;
    })
    .finally(() => {
      inFlightRefresh = null;
    });
  return inFlightRefresh;
};

// ---------------------------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------------------------
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isSessionEndpoint = (url?: string) =>
  !!url && /\/auth\/customer\/(refresh-token|logout|request-otp|verify-otp|google|login-password|signup)/.test(url);

type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

apiClient.interceptors.request.use(async (config) => {
  let token = getAccessToken();

  // Renew a little before expiry (or when only the refresh token is left) so requests
  // don't bounce off a 401 first
  if (!isSessionEndpoint(config.url) && getRefreshToken() && (!isJwt(token) || isExpiringSoon(token))) {
    try {
      token = await refreshAccessToken(token);
    } catch {
      // Backend unreachable: send the request with the current token and let it fail normally
    }
  }

  if (isJwt(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const sentToken = (original?.headers?.Authorization as string | undefined)?.replace(/^Bearer\s+/i, '') || null;

    if (error.response?.status === 401 && original && sentToken && !isSessionEndpoint(original.url)) {
      if (!original._authRetried && getRefreshToken()) {
        original._authRetried = true;
        try {
          const fresh = await refreshAccessToken(sentToken);
          if (fresh) {
            original.headers.Authorization = `Bearer ${fresh}`;
            return apiClient(original);
          }
        } catch {
          // Transient failure while refreshing: keep the session, surface the original error
        }
      } else if (!getRefreshToken()) {
        endSession(); // nothing to renew with
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Resolves an image URL (relative uploads or remote CDN) cleanly to a loadable URL
 */
export const resolveImageUrl = (url?: string, fallbackSlug?: string): string => {
  if (!url || url.trim() === '') {
    if (fallbackSlug) {
      return `/uploads/devices/${fallbackSlug}.png`;
    }
    return '/uploads/devices/pixel-7a.png';
  }
  if (url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Remove duplicate api/v1 prefix
  const baseHost = API_BASE_URL.replace('/api/v1', '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseHost}${cleanPath}`;
};
