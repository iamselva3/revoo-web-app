import { apiClient } from './client';
import { CustomerUser } from '../types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: CustomerUser;
}

export interface EmailOtpRequestResult {
  message: string;
  resendCooldownSeconds: number;
  expiresInSeconds: number;
  /** Only returned by a development backend when email delivery isn't configured. */
  devOtp?: string;
}

const extractAuthData = (data: any): AuthResponse => {
  const accessToken = data?.tokens?.accessToken || data?.accessToken || data?.token || '';
  const refreshToken = data?.tokens?.refreshToken || data?.refreshToken || '';
  const user = data?.user || data;
  return { accessToken, refreshToken, user };
};

export const authApi = {
  /** Sends a 6-digit sign-in code to the email address (delivered by the backend via nodemailer). */
  requestEmailOtp: async (email: string): Promise<EmailOtpRequestResult> => {
    const res = await apiClient.post('/auth/customer/request-otp', {
      destination: email.trim().toLowerCase(),
      channel: 'EMAIL',
    });
    const data = res.data?.data || {};
    return {
      message: res.data?.message || 'Code sent',
      resendCooldownSeconds: data.resendCooldownSeconds ?? 60,
      expiresInSeconds: data.expiresInSeconds ?? 300,
      devOtp: data.devOtp,
    };
  },

  verifyEmailOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/customer/verify-otp', {
      destination: email.trim().toLowerCase(),
      channel: 'EMAIL',
      otp,
    });
    return extractAuthData(res.data?.data);
  },

  /** Exchanges a Google OAuth access token (verified server-side) for a Genie session. */
  googleAuth: async (payload: { idToken?: string; accessToken?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/customer/google', payload);
    return extractAuthData(res.data?.data);
  },

  /** Name and mobile number are editable; email is the login identity and can't be changed. */
  updateProfile: async (payload: { fullName?: string; phone?: string }): Promise<CustomerUser> => {
    const res = await apiClient.put('/auth/customer/profile', payload);
    return res.data?.data;
  },

  getProfile: async (): Promise<CustomerUser> => {
    const res = await apiClient.get('/auth/customer/profile');
    return res.data?.data?.user || res.data?.data;
  },
};
