import React, { createContext, useCallback, useContext, useState } from 'react';
import { geoApi } from '../api/geo';

export interface SavedLocation {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  /** Taluk */
  subDistrict?: string;
  area?: string;
  source: 'gps' | 'pincode';
  /** GPS only: how far off the fix may be, in metres */
  accuracyM?: number;
  savedAt: number;
}

interface LocationContextType {
  location: SavedLocation | null;
  saveLocation: (loc: Omit<SavedLocation, 'savedAt'>) => void;
  clearLocation: () => void;
  /** Uses the browser's GPS (best fix in a few seconds) + Mappls / free reverse geocoding + our pincode table. Does not save. */
  detectLocation: () => Promise<Omit<SavedLocation, 'savedAt'>>;
  /** Looks up a PIN code in our seeded India locations table. Does not save. */
  resolvePincode: (pincode: string) => Promise<Omit<SavedLocation, 'savedAt'> | null>;
  isDetecting: boolean;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
}

export const LOCATION_STORAGE_KEY = 'genie_location';
export const SERVICE_STATE = 'Tamil Nadu';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const readSaved = (): SavedLocation | null => {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && /^\d{6}$/.test(parsed.pincode) ? parsed : null;
  } catch {
    return null;
  }
};

const geolocationErrorMessage = (err: GeolocationPositionError | Error): string => {
  if ('code' in err) {
    if (err.code === 1) return 'Location permission is blocked. Allow it in your browser settings, or enter your pincode below.';
    if (err.code === 2) return "Your device's location seems to be off. Turn on Location, or enter your pincode below.";
    if (err.code === 3) return "We couldn't find you this time. Turn on Location and Wi-Fi and try again, or enter your pincode below.";
  }
  return err.message || "We couldn't detect your location. Please enter your pincode.";
};

// A fix this close is as good as phones get: stop there
const GOOD_FIX_M = 50;
// After the first fix, keep listening this long for a sharper one
const SETTLE_MS = 4000;
// No fix at all by then: give up
const GIVE_UP_MS = 20000;
// The quick Wi-Fi / mobile-tower fix may be one the device took in the last 10 minutes
const QUICK_FIX_MAX_AGE_MS = 10 * 60 * 1000;

/**
 * The best location we can get in a few seconds, from two requests at once:
 * - a quick Wi-Fi / mobile-tower fix (answers in a second or two, even indoors where GPS is slow);
 * - a precise GPS fix that keeps sharpening.
 * Done as soon as a fix is within 50 m, otherwise the best one 4 s after the first. Only fails when
 * both requests fail (or nothing arrives in 20 s), so a slow GPS no longer means "took too long".
 */
/**
 * How far off a fix may be now: its accuracy, plus how far someone could have walked since an older
 * fix was taken (1 m per second after the first 30 s), so a precise but stale cached fix never wins.
 */
const uncertaintyM = (pos: GeolocationPosition) =>
  pos.coords.accuracy + Math.max(0, (Date.now() - pos.timestamp) / 1000 - 30);

const getAccuratePosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    let best: GeolocationPosition | null = null;
    let done = false;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let watchId: number | undefined;
    let quickFailed = false;
    let preciseFailed = false;
    let lastError: GeolocationPositionError | undefined;

    const finish = (err?: GeolocationPositionError) => {
      if (done) return;
      done = true;
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      clearTimeout(settleTimer);
      clearTimeout(giveUpTimer);
      if (best) resolve(best);
      else reject(err || lastError || Object.assign(new Error('timeout'), { code: 3 }));
    };
    const giveUpTimer = setTimeout(() => finish(), GIVE_UP_MS);

    const onFix = (pos: GeolocationPosition) => {
      if (done) return;
      if (!best || uncertaintyM(pos) < uncertaintyM(best)) best = pos;
      if (uncertaintyM(pos) <= GOOD_FIX_M) finish();
      else if (!settleTimer) settleTimer = setTimeout(() => finish(), SETTLE_MS);
    };
    // Blocked: stop at once. Otherwise wait for the other request; an error after a fix keeps the fix.
    const onError = (which: 'quick' | 'precise') => (err: GeolocationPositionError) => {
      if (done) return;
      lastError = err;
      if (err.code === 1) return finish(err);
      if (which === 'quick') quickFailed = true;
      else preciseFailed = true;
      if (quickFailed && preciseFailed && !best) finish(err);
    };

    navigator.geolocation.getCurrentPosition(onFix, onError('quick'), {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: QUICK_FIX_MAX_AGE_MS,
    });
    watchId = navigator.geolocation.watchPosition(onFix, onError('precise'), {
      enableHighAccuracy: true,
      timeout: GIVE_UP_MS,
      maximumAge: 0,
    });
    if (done) navigator.geolocation.clearWatch(watchId);
  });

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<SavedLocation | null>(readSaved);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const saveLocation = useCallback((loc: Omit<SavedLocation, 'savedAt'>) => {
    const next: SavedLocation = { ...loc, savedAt: Date.now() };
    setLocation(next);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const resolvePincode = useCallback(async (pincode: string) => {
    const pin = pincode.replace(/\D/g, '').slice(0, 6);
    if (pin.length !== 6) return null;
    const match = await geoApi.lookupPincode(pin);
    if (!match) return null;
    return {
      pincode: pin,
      city: match.city,
      state: match.state,
      district: match.district,
      source: 'pincode' as const,
    };
  }, []);

  const detectLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      throw new Error("Your browser doesn't support location detection. Please enter your pincode.");
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      throw new Error('Location detection needs a secure (https) connection. Please enter your pincode.');
    }

    setIsDetecting(true);
    try {
      const position = await getAccuratePosition().catch((err) => {
        throw new Error(geolocationErrorMessage(err));
      });

      const { latitude, longitude } = position.coords;
      const accuracy = uncertaintyM(position);
      const geo = await geoApi.reverseGeocode(latitude, longitude);
      if (!geo.pincode) {
        throw new Error("We found you, but couldn't match a pincode. Please enter it below.");
      }

      // Our seeded pincode table is the source of truth for city & state names
      const db = await geoApi.lookupPincode(geo.pincode);
      return {
        pincode: geo.pincode,
        city: db?.city || geo.city || geo.district || '',
        state: db?.state || geo.state || '',
        district: db?.district || geo.district,
        area: geo.area,
        source: 'gps' as const,
        accuracyM: Math.round(accuracy),
      };
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        saveLocation,
        clearLocation,
        detectLocation,
        resolvePincode,
        isDetecting,
        isPickerOpen,
        openPicker: () => setIsPickerOpen(true),
        closePicker: () => setIsPickerOpen(false),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useUserLocation must be used within LocationProvider');
  return ctx;
};
