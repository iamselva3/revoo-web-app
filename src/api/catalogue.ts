import { apiClient } from './client';
import {
  Brand,
  SmartphoneModel,
  Banner,
  AppPopup,
  CustomerReview,
  RefurbishedProduct,
  ModelWithVariants,
  DeviceVariant,
} from '../types';

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

  /** Models of a brand, each with its "Get up to" `maxPrice`. Optional category filter. */
  getModelsByBrand: async (brandId: string, category?: string): Promise<SmartphoneModel[]> => {
    const res = await apiClient.get(`/catalogue/brands/${brandId}/models`, {
      params: category ? { category } : undefined,
    });
    return res.data?.data || [];
  },

  /** Model + its variants, each variant carrying its top-condition `price`. */
  getModelWithVariants: async (modelId: string): Promise<ModelWithVariants | null> => {
    const res = await apiClient.get(`/catalogue/models/${modelId}`);
    const data = res.data?.data;
    if (!data?.model) return null;
    const base = Number(data.model.basePrice) || 0;
    const variants: DeviceVariant[] = (data.variants || []).map((v: any) => ({
      _id: v._id,
      capacity: v.capacity,
      ram: v.ram,
      storage: v.storage,
      priceModifier: Number(v.priceModifier) || 0,
      price: typeof v.price === 'number' ? v.price : base + (Number(v.priceModifier) || 0),
    }));
    const prices = variants.length ? variants.map((v) => v.price as number) : [base];
    return {
      model: data.model,
      variants,
      maxPrice: data.maxPrice ?? Math.max(...prices),
      minPrice: data.minPrice ?? Math.min(...prices),
    };
  },

  calculateEstimate: async (
    payload: any
  ): Promise<{ indicativeValuation: number; basePrice?: number; valuation?: any; disclaimer?: string; breakdown?: any[] }> => {
    const res = await apiClient.post('/catalogue/estimate', payload);
    const data = res.data?.data;
    const valuation = data?.valuation;
    const quote = valuation?.finalCalculatedAmount ?? data?.finalPrice ?? 0;
    return {
      indicativeValuation: quote,
      basePrice: valuation?.basePrice ?? data?.basePrice,
      valuation: valuation || data,
      disclaimer: data?.disclaimer,
      breakdown: valuation?.breakdown,
    };
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
      const raw = res.data?.data || [];
      return raw.map((r: any) => ({
        ...r,
        _id: r._id || r.id,
        customerName: r.customerName || r.name || 'Verified Customer',
        comment: r.comment || r.quote || '',
        deviceModel: r.deviceModel || r.device || 'Smart Device',
        rating: r.rating || 5,
        city: r.city || 'Tamil Nadu',
        amount: r.amount,
        date: r.date,
        verified: r.verified !== false,
      }));
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

