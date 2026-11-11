export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
  displayOrder?: number;
}

export interface DeviceVariant {
  _id?: string;
  capacity: string;
  priceModifier: number;
  ram?: string;
  storage?: string;
  /** Top-condition "Get up to" price for this variant (basePrice + priceModifier). */
  price?: number;
}

export interface SmartphoneModel {
  _id: string;
  brandId: string | { _id: string; name: string; logoUrl?: string };
  name: string;
  slug: string;
  releaseYear: number;
  imageUrl?: string;
  basePrice: number;
  variants?: DeviceVariant[];
  isPublished?: boolean;
  /** Best variant, top condition: the "Get up to" price shown on listings. */
  maxPrice?: number;
  minPrice?: number;
  variantCount?: number;
}

export interface ModelWithVariants {
  model: SmartphoneModel;
  variants: DeviceVariant[];
  maxPrice: number;
  minPrice: number;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  targetCategory?: string;
  isActive: boolean;
  displayOrder?: number;
}

export interface AppPopup {
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
}

export interface CustomerReview {
  _id: string;
  customerName: string;
  city: string;
  rating: number;
  comment: string;
  deviceModel: string;
  type: 'sell' | 'buy';
  avatarUrl?: string;
  createdAt: string;
}

export interface RefurbishedProduct {
  _id: string;
  name: string;
  brand: string;
  category?: string;
  storage: string;
  color: string;
  grade: 'PRISTINE' | 'EXCELLENT' | 'VERY_GOOD' | 'GOOD';
  batteryHealth: number;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  offerTag?: string;
  warrantyMonths: number;
  imageUrl: string;
  galleryImages?: string[];
  inspectionScore: number;
  highlights?: string[];
  inStock?: boolean;
  isFeatured?: boolean;
}

export interface CustomerUser {
  id: string;
  phone: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BuybackRequest {
  _id: string;
  requestNumber: string;
  customer: {
    fullName: string;
    phone: string;
  };
  device: {
    brand: string;
    modelName: string;
    variant: string;
  };
  pickupAddress: Address;
  scheduledPickupDate: string;
  preferredTimeWindow: string;
  indicativeValuation: number;
  finalOfferAmount?: number;
  status: 'PENDING_ASSIGNMENT' | 'COLLECTION_ASSIGNED' | 'OUT_FOR_PICKUP' | 'COLLECTED' | 'UNDER_INSPECTION' | 'FINAL_OFFER_MADE' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

