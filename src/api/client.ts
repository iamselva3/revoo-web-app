import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://revoo-backend-ivqq.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('revoo_customer_token');
  if (
    token &&
    token !== 'undefined' &&
    token !== 'null' &&
    typeof token === 'string' &&
    token.trim().length > 10
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Prevent carrying stale/broken token
    delete config.headers.Authorization;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if server rejects it as invalid
      localStorage.removeItem('revoo_customer_token');
      localStorage.removeItem('revoo_customer_user');
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

