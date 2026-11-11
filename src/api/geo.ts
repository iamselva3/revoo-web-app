import { apiClient } from './client';

export interface PincodeLookupResponse {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  serviceable?: boolean;
}

export interface ReverseGeocodeResult {
  pincode?: string;
  city?: string;
  state?: string;
  district?: string;
  area?: string;
}

const FALLBACK_STATES = [
  'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra', 'Telangana',
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Uttar Pradesh', 'West Bengal',
];

const FALLBACK_CITIES = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Bangalore', 'Mumbai'];

const cleanPincode = (raw?: string | null): string | undefined => {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length >= 6 ? digits.slice(0, 6) : undefined;
};

const withTimeout = (ms: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
};

export const geoApi = {
  getStates: async (): Promise<string[]> => {
    try {
      const res = await apiClient.get('/geo/states');
      const raw = res.data?.data || [];
      if (Array.isArray(raw)) {
        return raw
          .map((item: any) => (typeof item === 'string' ? item : item.name || item.state || ''))
          .filter((name: string) => Boolean(name && name.trim()));
      }
      return FALLBACK_STATES;
    } catch {
      return FALLBACK_STATES;
    }
  },

  getCities: async (state?: string): Promise<string[]> => {
    try {
      const res = await apiClient.get('/geo/cities', {
        params: state ? { state } : undefined,
      });
      const raw = res.data?.data || [];
      if (Array.isArray(raw)) {
        const names = raw
          .map((item: any) => (typeof item === 'string' ? item : item.city || item.name || ''))
          .filter((city: string) => Boolean(city && city.trim()));
        return Array.from(new Set(names));
      }
      return FALLBACK_CITIES;
    } catch {
      return FALLBACK_CITIES;
    }
  },

  /** City / district / state for a 6-digit PIN from our seeded India locations table. */
  lookupPincode: async (pincode: string): Promise<PincodeLookupResponse | null> => {
    if (!pincode || !/^\d{6}$/.test(pincode)) return null;
    try {
      const res = await apiClient.get(`/geo/pincode/${pincode}`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Turns GPS coordinates into a PIN code (+ area names). Uses BigDataCloud's free client-side
   * endpoint, then OpenStreetMap Nominatim as a fallback when no postcode comes back.
   */
  reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodeResult> => {
    const result: ReverseGeocodeResult = {};

    try {
      const t = withTimeout(7000);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: t.signal }
      );
      t.done();
      if (res.ok) {
        const data: any = await res.json();
        result.pincode = cleanPincode(data.postcode);
        result.city = data.city || data.locality || undefined;
        result.state = data.principalSubdivision || undefined;
        result.area = data.locality && data.locality !== data.city ? data.locality : undefined;
        const admin: any[] = data.localityInfo?.administrative || [];
        const district = admin.find((a) => a.adminLevel === 5) || admin.find((a) => /district/i.test(a.description || ''));
        result.district = district?.name?.replace(/\s+district$/i, '') || undefined;
      }
    } catch {
      // fall through to Nominatim
    }

    if (!result.pincode) {
      try {
        const t = withTimeout(8000);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
          { signal: t.signal, headers: { Accept: 'application/json' } }
        );
        t.done();
        if (res.ok) {
          const data: any = await res.json();
          const a = data.address || {};
          result.pincode = cleanPincode(a.postcode);
          result.city = result.city || a.city || a.town || a.village || a.county || undefined;
          result.state = result.state || a.state || undefined;
          result.district = result.district || a.state_district?.replace(/\s+district$/i, '') || undefined;
          result.area = result.area || a.suburb || a.neighbourhood || a.residential || undefined;
        }
      } catch {
        // ignore — caller handles missing pincode
      }
    }

    return result;
  },
};
