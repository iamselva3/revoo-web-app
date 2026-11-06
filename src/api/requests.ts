import { apiClient } from './client';
import { BuybackRequest, Address } from '../types';

export interface SubmitBuybackPayload {
  device: {
    brand: string;
    modelName: string;
    variant: string;
  };
  conditions: any;
  pickupAddress: Address;
  scheduledPickupDate: string;
  preferredTimeWindow: string;
  indicativeValuation: number;
  paymentDetails?: {
    paymentMethod: 'UPI' | 'BANK_TRANSFER' | 'INSTANT_CASH';
    upiId?: string;
    bankAccount?: {
      accountNumber: string;
      ifscCode: string;
      bankName?: string;
    };
  };
}

export const requestApi = {
  submitBuybackRequest: async (payload: SubmitBuybackPayload): Promise<BuybackRequest> => {
    const res = await apiClient.post('/requests', payload);
    return res.data?.data;
  },

  getMyRequests: async (): Promise<BuybackRequest[]> => {
    try {
      const res = await apiClient.get('/requests/my');
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  getRequestById: async (id: string): Promise<BuybackRequest | null> => {
    try {
      const res = await apiClient.get(`/requests/my/${id}`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },
};

