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
  displayOrder?: number;
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

/** Address as stored on a pickup request (website and app bookings use slightly different keys). */
export interface RequestAddress {
  street?: string;
  area?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  preferredSlot?: string;
}

export interface PayoutDetails {
  method: 'UPI' | 'BANK_TRANSFER' | 'INSTANT_CASH';
  upiId?: string;
  /** Masked by the API, e.g. "•••• 6789" */
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

export interface RequestTimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface BuybackRequest {
  _id: string;
  requestNumber: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  device: {
    brand: string;
    modelName: string;
    variant: string;
    imageUrl?: string;
    slug?: string;
  };
  pickupAddress: RequestAddress;
  scheduledPickupDate: string;
  preferredTimeWindow: string;
  indicativeValuation: number;
  finalOfferAmount?: number;
  payoutDetails?: PayoutDetails;
  declaredCondition?: { summary?: Array<{ title: string; items: string[] }>; [key: string]: any };
  timeline?: RequestTimelineEntry[];
  assignedCollector?: { staffName?: string; scheduledDate?: string; timeSlot?: string };
  /** Backend RequestStatus value, e.g. SUBMITTED, ASSIGNED_FOR_COLLECTION, PAYMENT_COMPLETED */
  status: string;
  createdAt: string;
  updatedAt?: string;
}

