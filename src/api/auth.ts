import { apiClient } from './client';
import { CustomerUser } from '../types';

export const authApi = {
  requestOtp: async (phone: string): Promise<{ success: boolean; message: string; debugOtp?: string }> => {
    const res = await apiClient.post('/auth/customer/request-otp', { phone });
    return res.data;
  },

  verifyOtp: async (
    phone: string,
    otp: string
  ): Promise<{ accessToken: string; refreshToken: string; user: CustomerUser }> => {
    const res = await apiClient.post('/auth/customer/verify-otp', { phone, otp });
    return res.data?.data;
  },

  passwordLogin: async (
    phone: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; user: CustomerUser }> => {
    const res = await apiClient.post('/auth/customer/login-password', { phone, password });
    return res.data?.data;
  },

  signup: async (data: {
    fullName: string;
    phone: string;
    password?: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: CustomerUser }> => {
    const res = await apiClient.post('/auth/customer/signup', data);
    return res.data?.data;
  },

  googleAuth: async (payload: {
    idToken?: string;
    code?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: CustomerUser }> => {
    const res = await apiClient.post('/auth/customer/google', payload);
    return res.data?.data;
  },

  getProfile: async (): Promise<CustomerUser> => {
    const res = await apiClient.get('/auth/customer/profile');
    return res.data?.data;
  },
};

