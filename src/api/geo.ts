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
  /** Which service answered: Mappls is the most precise for Indian addresses */
  source?: 'mappls' | 'bigdatacloud' | 'nominatim';
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
   * Turns GPS coordinates into a PIN code (+ area names). Asks Mappls (MapmyIndia) through our
   * server first, as its Indian address data is the most precise. When Mappls isn't set up, can't
   * be reached or has no PIN code there, BigDataCloud's free endpoint and then OpenStreetMap
   * Nominatim fill in what's missing.
   */
  reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodeResult> => {
    const result: ReverseGeocodeResult = {};

    try {
      const res = await apiClient.get('/geo/reverse', { params: { lat, lng }, timeout: 8000 });
      const m: any = res.data?.data;
      if (m) {
        result.pincode = cleanPincode(m.pincode);
        result.city = m.city || undefined;
        result.state = m.state || undefined;
        result.district = m.district || undefined;
        result.area = m.area || undefined;
        if (result.pincode) {
          result.source = 'mappls';
          return result;
        }
      }
    } catch {
      // server asleep or Mappls down: use the free providers
    }

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
        if (result.pincode) result.source = 'bigdatacloud';
        result.city = result.city || data.city || data.locality || undefined;
        result.state = result.state || data.principalSubdivision || undefined;
        result.area = result.area || (data.locality && data.locality !== data.city ? data.locality : undefined);
        const admin: any[] = data.localityInfo?.administrative || [];
        const district = admin.find((a) => a.adminLevel === 5) || admin.find((a) => /district/i.test(a.description || ''));
        result.district = result.district || district?.name?.replace(/\s+district$/i, '') || undefined;
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
          if (result.pincode) result.source = 'nominatim';
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
