import { apiClient } from './client';
import { Brand, SmartphoneModel, Banner, AppPopup, CustomerReview, RefurbishedProduct } from '../types';

export const catalogueApi = {
  getBanners: async (): Promise<Banner[]> => {
    try {
      const res = await apiClient.get('/catalogue/banners');
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  getBrands: async (): Promise<Brand[]> => {
    const res = await apiClient.get('/catalogue/brands');
    return res.data?.data || [];
  },

  getModelsByBrand: async (brandId: string): Promise<SmartphoneModel[]> => {
    const res = await apiClient.get(`/catalogue/brands/${brandId}/models`);
    return res.data?.data || [];
  },

  getModelDetails: async (modelId: string): Promise<SmartphoneModel> => {
    const res = await apiClient.get(`/catalogue/models/${modelId}`);
    return res.data?.data;
  },

  calculateEstimate: async (payload: {
    modelId: string;
    variantCapacity: string;
    conditions: any;
  }): Promise<{ indicativeValuation: number; breakdown?: any }> => {
    const res = await apiClient.post('/catalogue/estimate', payload);
    return res.data?.data || { indicativeValuation: 0 };
  },

  getRefurbishedProducts: async (category?: string): Promise<RefurbishedProduct[]> => {
    const res = await apiClient.get('/catalogue/refurbished', {
      params: category ? { category } : undefined,
    });
    return res.data?.data || [];
  },

  getReviews: async (type: 'sell' | 'buy' = 'sell'): Promise<CustomerReview[]> => {
    try {
      const res = await apiClient.get('/catalogue/reviews', { params: { type } });
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  getAppPopup: async (): Promise<AppPopup | null> => {
    try {
      const res = await apiClient.get('/catalogue/popup');
      return res.data?.data || null;
    } catch {
      return null;
    }
  },
};

