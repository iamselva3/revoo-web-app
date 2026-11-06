import { apiClient } from './client';

export interface PincodeLookupResponse {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  serviceable?: boolean;
}

export const geoApi = {
  getStates: async (): Promise<string[]> => {
    try {
      const res = await apiClient.get('/geo/states');
      return res.data?.data || [];
    } catch {
      return [
        'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra', 'Telangana',
        'Andhra Pradesh', 'Delhi', 'Gujarat', 'Uttar Pradesh', 'West Bengal'
      ];
    }
  },

  getCities: async (state?: string): Promise<string[]> => {
    try {
      const res = await apiClient.get('/geo/cities', {
        params: state ? { state } : undefined,
      });
      return res.data?.data || [];
    } catch {
      return ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Srivilliputhur', 'Bangalore', 'Mumbai'];
    }
  },

  lookupPincode: async (pincode: string): Promise<PincodeLookupResponse | null> => {
    if (!pincode || pincode.length !== 6) return null;
    try {
      const res = await apiClient.get(`/geo/pincode/${pincode}`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },
};

