import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../api/client';

/**
 * Pickup partner app (genietn.in/partner). Its own sign-in, separate from the customer's: a
 * partner session never touches the customer session in the same browser, and back.
 */
const TOKEN_KEY = 'genie_partner_token';
const PARTNER_KEY = 'genie_partner';
export const PARTNER_SIGNED_OUT = 'genie:partner-signed-out';

export interface Partner {
  id: string;
  fullName: string;
  employeeCode: string;
  phone: string;
  district?: string;
}

export interface PriceLine {
  component: string;
  quoted: number;
  checked: number;
  difference: number;
}

export interface DoorstepPricing {
  quotedAmount: number;
  requotedAmount: number;
  checkedAmount: number;
  finalAmount: number;
  difference: number;
  bestAmount: number;
  worstAmount: number;
  changes: PriceLine[];
  checkedStorage: string;
  checkedVariantId?: string;
}

export interface PartnerRequest {
  id: string;
  requestNumber: string;
  status: string;
  closed: boolean;
  bookedOn: string;
  device: { brandName?: string; modelName: string; storage?: string; variantId?: string; imageUrl?: string };
  variants: Array<{ id: string; capacity: string }>;
  customer: { fullName?: string; phone?: string; alternatePhone?: string };
  pickupAddress: { street?: string; area?: string; landmark?: string; city?: string; state?: string; pincode?: string };
  scheduledPickupDate?: string;
  preferredTimeWindow?: string;
  payout?: { method: string; upiId?: string; bankName?: string; accountNumber?: string; ifscCode?: string };
  assignedTo?: string;
  customerCondition: any;
  quotedAmount: number;
  pricing: DoorstepPricing | null;
  checks: Array<{ id: string; partnerName: string; finalAmount: number; difference: number; outcome: Outcome; createdAt: string }>;
  notBuyableReasons: string[];
}

export type Outcome = 'AGREED' | 'DECLINED' | 'NOT_BUYABLE';

export interface MyCheck {
  _id: string;
  requestNumber: string;
  device: { modelName: string; brandName?: string; checkedStorage?: string };
  quotedAmount: number;
  finalAmount: number;
  difference: number;
  outcome: Outcome;
  createdAt: string;
}

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getPartnerToken = () => read(TOKEN_KEY);
export const getStoredPartner = (): Partner | null => {
  try {
    const raw = read(PARTNER_KEY);
    return raw ? (JSON.parse(raw) as Partner) : null;
  } catch {
    return null;
  }
};

export const storePartnerSession = (token: string, partner: Partner) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PARTNER_KEY, JSON.stringify(partner));
  } catch {
    // storage unavailable: the session lasts until the page closes
  }
};

export const clearPartnerSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PARTNER_KEY);
  } catch {
    // ignore
  }
};

const http = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

http.interceptors.request.use((cfg) => {
  const token = getPartnerToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    // Session over (expired, or access switched off): back to sign-in
    if ((status === 401 || status === 403) && !url.includes('/partner/login')) {
      clearPartnerSession();
      window.dispatchEvent(new Event(PARTNER_SIGNED_OUT));
    }
    return Promise.reject(err);
  }
);

/** The server's message, or a plain one for network trouble. */
export const errorMessage = (err: unknown, fallback = 'Something went wrong. Please try again.') => {
  const e = err as AxiosError<{ message?: string }>;
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.code === 'ECONNABORTED' || e?.message === 'Network Error') return 'No connection. Check your mobile data and try again.';
  return fallback;
};

export const partnerApi = {
  login: async (phone: string, pin: string) => {
    const res = await http.post('/partner/login', { phone, pin });
    return res.data.data as { token: string; partner: Partner };
  },
  me: async () => (await http.get('/partner/me')).data.data as Partner,
  myChecks: async () => (await http.get('/partner/checks')).data.data as MyCheck[],
  getRequest: async (ref: string) => (await http.get(`/partner/requests/${encodeURIComponent(ref)}`)).data.data as PartnerRequest,
  price: async (ref: string, body: { variantId?: string; condition: any }, signal?: AbortSignal) =>
    (await http.post(`/partner/requests/${encodeURIComponent(ref)}/price`, body, { signal })).data.data as DoorstepPricing,
  submitCheck: async (
    ref: string,
    body: { variantId?: string; condition: any; outcome: Outcome; notBuyableReason?: string; imei?: string; photoUrls?: string[]; notes?: string }
  ) => (await http.post(`/partner/requests/${encodeURIComponent(ref)}/checks`, body)).data.data,
  uploadPhoto: async (file: File) => {
    const form = new FormData();
    form.append('image', file);
    form.append('imageType', 'INSPECTION_EVIDENCE');
    const res = await http.post('/requests/upload', form);
    return res.data.data.imageUrl as string;
  },
};

/** Booking number from a typed number or a scanned QR (a link like ".../partner?r=GENIE-2026-1011"). */
export const bookingRefFrom = (text: string): string | null => {
  const raw = String(text || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const r = url.searchParams.get('r');
    if (r) return bookingRefFrom(r);
  } catch {
    // not a link
  }
  const m = /(?:GENIE|REV)[\s-]*(\d{4})[\s-]*(\d{3,6})/i.exec(raw) || /^(\d{4})[\s-]*(\d{3,6})$/.exec(raw);
  return m ? `GENIE-${m[1]}-${m[2]}` : null;
};
