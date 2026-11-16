import React, { useEffect, useState } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { Crosshair, Loader2, MapPin, X, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { SavedLocation, SERVICE_STATE, useUserLocation } from '../../context/LocationContext';
import { geoApi } from '../../api/geo';

const POPULAR_CITIES: Array<{ city: string; pincode: string }> = [
  { city: 'Chennai', pincode: '600001' },
  { city: 'Coimbatore', pincode: '641001' },
  { city: 'Madurai', pincode: '625001' },
  { city: 'Tiruchirappalli', pincode: '620001' },
  { city: 'Salem', pincode: '636001' },
  { city: 'Tirunelveli', pincode: '627001' },
];

type Candidate = Omit<SavedLocation, 'savedAt'>;

// Further off than this, the PIN code may be a neighbouring one: ask the customer to check it
const APPROXIMATE_M = 1000;
const isApproximate = (loc: Candidate | null) =>
  Boolean(loc && loc.source === 'gps' && loc.accuracyM && loc.accuracyM > APPROXIMATE_M);

export const LocationPicker: React.FC = () => {
  const { isPickerOpen, closePicker, location, saveLocation, detectLocation, resolvePincode, isDetecting } =
    useUserLocation();
  const [pincode, setPincode] = useState('');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);

  // A typed pincode (or a rough GPS fix) gets the list of areas inside it to choose from, and the
  // taluk / district from Mappls, so the saved location says more than a bare number
  const needsAreas = Boolean(candidate && (candidate.source === 'pincode' || isApproximate(candidate)));
  const candidatePin = candidate?.pincode;
  useEffect(() => {
    setAreas([]);
    if (!isPickerOpen || !needsAreas || !candidatePin) return;
    let live = true;
    setAreasLoading(true);
    geoApi.pincodeAreas(candidatePin).then((info) => {
      if (!live) return;
      setAreasLoading(false);
      if (!info) return;
      setAreas(info.areas);
      setCandidate((c) =>
        c && c.pincode === info.pincode
          ? {
              ...c,
              city: c.source === 'pincode' ? info.city || c.city : c.city || info.city || '',
              district: c.district || info.district,
              subDistrict: c.subDistrict || info.subDistrict,
              state: c.state || info.state || '',
            }
          : c
      );
    });
    return () => {
      live = false;
      setAreasLoading(false);
    };
  }, [isPickerOpen, needsAreas, candidatePin]);

  useEffect(() => {
    if (!isPickerOpen) return;
    setPincode(location?.pincode || '');
    setCandidate(location ? { ...location } : null);
    setError(null);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePicker();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [isPickerOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isPickerOpen) return null;

  const lookup = async (pin: string) => {
    setError(null);
    setCandidate(null);
    if (!/^\d{6}$/.test(pin)) {
      setError('Enter a valid 6-digit pincode.');
      return;
    }
    setIsLooking(true);
    const found = await resolvePincode(pin);
    setIsLooking(false);
    if (!found) {
      setError("We couldn't find that pincode. Please check and try again.");
      return;
    }
    setCandidate(found);
  };

  const handleDetect = async () => {
    setError(null);
    try {
      const found = await detectLocation();
      setPincode(found.pincode);
      setCandidate(found);
    } catch (err: any) {
      setError(err?.message || "We couldn't detect your location.");
    }
  };

  const confirm = (loc: Candidate | null = candidate) => {
    if (!loc) return;
    saveLocation(loc);
    closePicker();
  };

  const outsideService = candidate && candidate.state && candidate.state.toLowerCase() !== SERVICE_STATE.toLowerCase();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && closePicker()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
    >
      <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl animate-slide-up safe-area-bottom">
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-2">
          <div>
            <h2 id="location-picker-title" className="text-lg font-bold text-ink dark:text-white">
              Select your location
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500 dark:text-neutral-400">
              We use it to check doorstep pickup and pre-fill your address.
            </p>
          </div>
          <button
            type="button"
            onClick={closePicker}
            className="-mr-1 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-6 pt-3">
          <button
            type="button"
            onClick={handleDetect}
            disabled={isDetecting}
            className="w-full flex items-center gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3.5 text-left transition hover:bg-amber-100 disabled:opacity-70 dark:border-amber-400/30 dark:bg-amber-400/10 dark:hover:bg-amber-400/15"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-[#1a1033]">
              {isDetecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crosshair className="h-5 w-5" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-ink dark:text-amber-200">
                {isDetecting ? 'Detecting your location…' : 'Use my current location'}
              </span>
              <span className="block text-xs text-slate-500 dark:text-neutral-400">
                Auto-fills pincode, city and state
              </span>
            </span>
          </button>

          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
            <span className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
            or enter pincode
            <span className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              lookup(pincode);
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              placeholder="6-digit pincode"
              value={pincode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPincode(v);
                if (v.length === 6) lookup(v);
              }}
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-semibold tracking-widest text-ink outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
            />
            <button type="submit" disabled={isLooking} className="btn-ghost !px-4">
              {isLooking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
            </button>
          </form>

          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          {candidate && (
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-neutral-800">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink dark:text-white">
                    {[candidate.area, candidate.city].filter(Boolean).join(', ') || candidate.district}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    {[
                      candidate.subDistrict && candidate.subDistrict !== candidate.city ? `${candidate.subDistrict} taluk` : null,
                      candidate.district !== candidate.city ? candidate.district : null,
                      candidate.state,
                      candidate.pincode,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {needsAreas && (areasLoading || areas.length > 0) && (
                    <div className="mt-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-neutral-300">
                        Choose your area
                        {areasLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />}
                      </p>
                      {areas.length > 0 && (
                        <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pr-1">
                          {areas.map((a) => {
                            const selected = candidate.area === a;
                            return (
                              <button
                                key={a}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setCandidate((c) => (c ? { ...c, area: selected ? undefined : a } : c))}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                  selected
                                    ? 'border-amber-400 bg-amber-100 text-ink dark:border-amber-400 dark:bg-amber-400/20 dark:text-amber-100'
                                    : 'border-slate-200 text-slate-600 hover:border-amber-400 hover:text-ink dark:border-neutral-800 dark:text-neutral-300'
                                }`}
                              >
                                {a}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {isApproximate(candidate) && (
                    <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                      Your device could only find you roughly (within ~{Math.round((candidate.accuracyM || 0) / 1000)}&nbsp;km).
                      Please check the pincode, or type yours above.
                    </p>
                  )}
                  {outsideService ? (
                    <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                      Doorstep pickup is currently available across {SERVICE_STATE}. We'll still save this so you can see prices.
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Free doorstep pickup available
                    </p>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => confirm()} className="btn-genie mt-4 w-full">
                Confirm location <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {!candidate && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-neutral-400">Popular cities</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.pincode}
                    type="button"
                    onClick={() => {
                      setPincode(c.pincode);
                      lookup(c.pincode);
                    }}
                    className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-amber-400 hover:text-ink dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-amber-400 dark:hover:text-white"
                  >
                    {c.city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PROMPT_DISMISSED_KEY = 'genie_location_prompt_dismissed';

/** One-time, non-blocking nudge on the first visit that asks for location (auto-detect first). */
export const LocationPrompt: React.FC = () => {
  const { location, detectLocation, saveLocation, openPicker, isDetecting, isPickerOpen } = useUserLocation();
  const routerLocation = useRouterLocation();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY) === '1';
    } catch {
      dismissed = true;
    }
    if (location || dismissed) return;
    // Wait until no other dialog (promo popup, login…) is holding the page, then nudge once
    let timer: ReturnType<typeof setTimeout>;
    const tryShow = () => {
      if (document.body.style.overflow === 'hidden') {
        timer = setTimeout(tryShow, 1500);
      } else {
        setVisible(true);
      }
    };
    timer = setTimeout(tryShow, 3500);
    return () => clearTimeout(timer);
  }, [location]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
  };

  const hiddenOnRoute = ['/terms', '/privacy'].includes(routerLocation.pathname);
  if (!visible || location || isPickerOpen || hiddenOnRoute) return null;

  const handleDetect = async () => {
    setError(null);
    try {
      const found = await detectLocation();
      saveLocation(found);
      dismiss();
      // A rough fix may land on the next PIN code: let the customer check it
      if (isApproximate(found)) openPicker();
    } catch (err: any) {
      setError(err?.message || "We couldn't detect your location.");
    }
  };

  return (
    // Just above the phone bottom menu, and above the chat button so it never covers "Enter pincode"
    <div className="fixed inset-x-3 bottom-[calc(var(--bottom-bar,0px)+0.75rem)] z-[55] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:w-[360px] animate-slide-up lg:bottom-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
            <MapPin className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink dark:text-white">Where should we pick up?</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400">
              Share your location to check free doorstep pickup near you.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={handleDetect} disabled={isDetecting} className="btn-genie !px-3 !py-2.5 !text-xs">
            {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            {isDetecting ? 'Detecting…' : 'Use my location'}
          </button>
          <button
            type="button"
            onClick={() => {
              dismiss();
              openPicker();
            }}
            className="btn-ghost !px-3 !py-2.5 !text-xs"
          >
            Enter pincode
          </button>
        </div>
      </div>
    </div>
  );
};
