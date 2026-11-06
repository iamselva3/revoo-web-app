import { apiClient } from './client';
import { CustomerUser } from '../types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: CustomerUser;
}

const extractAuthData = (data: any): AuthResponse => {
  const accessToken =
    data?.tokens?.accessToken ||
    data?.accessToken ||
    data?.token ||
    '';
  const refreshToken =
    data?.tokens?.refreshToken ||
    data?.refreshToken ||
    '';
  const user = data?.user || data;
  return { accessToken, refreshToken, user };
};

export const authApi = {
  requestOtp: async (phone: string): Promise<{ success: boolean; message: string; debugOtp?: string }> => {
    const res = await apiClient.post('/auth/customer/request-otp', { phone });
    return res.data;
  },

  verifyOtp: async (
    phone: string,
    otp: string
  ): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/customer/verify-otp', { phone, otp });
    return extractAuthData(res.data?.data);
  },

  passwordLogin: async (
    phone: string,
    password: string
  ): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/customer/login-password', { phone, password });
    return extractAuthData(res.data?.data);
  },

  signup: async (data: {
    fullName: string;
    phone: string;
    password?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/customer/signup', data);
    return extractAuthData(res.data?.data);
  },

  googleAuth: async (payload: {
    idToken?: string;
    code?: string;
    accessToken?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/customer/google', payload);
    return extractAuthData(res.data?.data);
  },

  getProfile: async (): Promise<CustomerUser> => {
    const res = await apiClient.get('/auth/customer/profile');
    return res.data?.data?.user || res.data?.data;
  },
};

