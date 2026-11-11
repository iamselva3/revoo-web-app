import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { geoApi } from '../../api/geo';
import { requestApi } from '../../api/requests';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../context/LocationContext';
import confetti from 'canvas-confetti';
import {
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Smartphone,
  Crosshair,
} from 'lucide-react';

export const DoorstepPickupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { location: savedLocation, detectLocation, saveLocation, isDetecting } = useUserLocation();
  const [locationError, setLocationError] = useState<string | null>(null);

  // Retrieved device session from valuation flow
  const [bookingData, setBookingData] = useState<any>(null);

  // Address fields
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('Tamil Nadu');

  // Geo options from API
  const [statesList, setStatesList] = useState<string[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [isPincodeLoading, setIsPincodeLoading] = useState<boolean>(false);

  // Logistics Slot
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeWindow, setTimeWindow] = useState<string>('Morning (10:00 AM - 01:00 PM)');

  // Submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load session booking
  useEffect(() => {
    const cached = sessionStorage.getItem('revoo_pending_booking');
    if (cached) {
      setBookingData(JSON.parse(cached));
    }
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.phone) setPhone(user.phone.replace(/\D/g, '').slice(-10));
    }

    // Load states
    geoApi.getStates().then(setStatesList);
  }, [user]);

  // Pre-fill the address from the location the customer picked (navbar / first-visit prompt)
  useEffect(() => {
    if (!savedLocation) return;
    setPincode((p) => p || savedLocation.pincode);
    setCity((c) => c || savedLocation.city);
    if (savedLocation.state) setState((s) => (s && s !== 'Tamil Nadu' ? s : savedLocation.state));
    setAddressLine2((a) => a || savedLocation.area || '');
  }, [savedLocation]);

  const handleUseCurrentLocation = async () => {
    setLocationError(null);
    try {
      const found = await detectLocation();
      saveLocation(found);
      setPincode(found.pincode);
      if (found.city) setCity(found.city);
      if (found.state) setState(found.state);
      if (found.area) setAddressLine2(found.area);
    } catch (err: any) {
      setLocationError(err?.message || "We couldn't detect your location. Please type your pincode.");
    }
  };

  // Load cities whenever state changes
  useEffect(() => {
    if (state) {
      geoApi.getCities(state).then(setCitiesList);
    }
  }, [state]);

  // Handle Pincode Auto-Fill
  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);

    if (clean.length === 6) {
      setIsPincodeLoading(true);
      const match = await geoApi.lookupPincode(clean);
      if (match) {
        if (match.city) setCity(match.city);
        if (match.state) setState(match.state);
      }
      setIsPincodeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData) {
      navigate('/sell');
      return;
    }
    if (!user) {
      openAuthModal();
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        device: bookingData.device,
        modelId: bookingData.device?.modelId,
        variantId: bookingData.device?.variantId,
        variantCapacity: bookingData.device?.variant,
        conditions: bookingData.conditions,
        indicativeValuation: bookingData.indicativeValuation,
        pickupAddress: {
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
        },
        scheduledPickupDate: pickupDate,
        preferredTimeWindow: timeWindow,
        paymentDetails: {
          paymentMethod: 'INSTANT_CASH',
        },
      };

      const result = await requestApi.submitBuybackRequest(payload);
      setSuccessBooking(result || { requestNumber: 'GENIE-' + Math.floor(100000 + Math.random() * 900000) });
      sessionStorage.removeItem('revoo_pending_booking');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E11D48', '#EC4899', '#8B5CF6', '#F59E0B'],
      });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successBooking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto dark:bg-amber-400/10 dark:text-amber-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Doorstep Pickup Confirmed!
          </h1>
          <p className="text-xs text-slate-500">
            Booking ID: <strong className="text-slate-900 font-mono">{successBooking.requestNumber || 'REV-89421'}</strong>
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card text-left space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Pickup Date & Window</span>
            <span className="font-bold text-slate-900">{pickupDate} • {timeWindow.split(' ')[0]}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Address</span>
            <span className="font-bold text-slate-900 text-right">{addressLine1}, {city} ({pincode})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Expected Payout</span>
            <span className="font-black text-amber-500 text-base">
              ₹{bookingData?.indicativeValuation?.toLocaleString('en-IN') || 'Quote'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => navigate('/track')}
            className="w-full py-3.5 rounded-2xl btn-genie w-full"
          >
            Track Live Request Status
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Gate: Show dedicated Login Required screen
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto dark:bg-amber-400/10 dark:text-amber-300">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Please Log In to Continue
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Log in with Google or your email to confirm your pickup address and lock in your price.
          </p>
        </div>

        {bookingData && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20 text-left flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900">{bookingData.device?.modelName}</p>
                <p className="text-[11px] text-slate-500 font-mono">{bookingData.device?.variant}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Locked Value</span>
              <p className="font-black text-ink dark:text-white text-sm">
                ₹{bookingData.indicativeValuation?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={openAuthModal}
            className="w-full py-4 rounded-2xl btn-genie w-full !py-4 !text-base"
          >
            <span>Log in to continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/sell')}
            className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            ← Return to Device Valuation
          </button>
        </div>
      </div>
    );
  }

  // 2. Missing Device Assessment: Guide user to select a device first
  if (!bookingData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Smartphone className="w-8 h-8 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            No Device Selected Yet
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Please choose your smartphone and complete the 30-second condition evaluation first to calculate your guaranteed buyback price.
          </p>
        </div>

        <button
          onClick={() => navigate('/sell')}
          className="w-full py-4 rounded-2xl btn-genie w-full !py-4 !text-base"
        >
          <span>Select Device to Sell</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <Truck className="w-6 h-6 text-amber-500" /> Book Doorstep Pickup
        </h1>
        <p className="text-xs text-slate-500">
          We service all districts across Tamil Nadu with free pickup and on-spot payment
        </p>
      </div>

      {/* Valuation summary strip */}
      {bookingData && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                {bookingData.device?.modelName}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {bookingData.device?.variant} • {typeof bookingData.device?.brand === 'object' ? (bookingData.device?.brand?.name || 'Device') : (bookingData.device?.brand || 'Device')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Guaranteed Payout</span>
            <p className="text-lg font-black text-ink dark:text-white">
              ₹{bookingData.indicativeValuation?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact info */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> 1. Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone number (our agent will call before arriving)</label>
              <input
                type="tel"
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                title="Enter a 10-digit mobile number"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').slice(0, 10))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Pickup address with India Geo autocomplete */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" /> 2. Pickup Address (Doorstep Location)
          </h2>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetecting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-amber-100 disabled:opacity-70 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
          >
            {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4 text-amber-600 dark:text-amber-300" />}
            {isDetecting ? 'Detecting your location…' : 'Use my current location'}
          </button>
          {locationError && <p className="text-xs font-medium text-red-600 dark:text-red-400">{locationError}</p>}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Flat, House No., Building, Street
              </label>
              <input
                type="text"
                required
                placeholder="e.g. No. 42, North Mada Street, Near Anna Nagar Post Office"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality (optional)</label>
              <input
                type="text"
                placeholder="e.g. Anna Nagar"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pincode with Auto-Fill */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Pincode</span>
                  {isPincodeLoading && <span className="text-[10px] text-amber-500">Checking...</span>}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 600001"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {(statesList.includes(state) || !state ? statesList : [state, ...statesList]).map((s, idx) => {
                    const label = typeof s === 'string' ? s : (s as any)?.name || (s as any)?.state || '';
                    return (
                      <option key={`${label}-${idx}`} value={label}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai, Coimbatore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  list="city-options"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <datalist id="city-options">
                  {citiesList.map((c, idx) => {
                    const label = typeof c === 'string' ? c : (c as any)?.city || (c as any)?.name || '';
                    return (
                      <option key={`${label}-${idx}`} value={label} />
                    );
                  })}
                </datalist>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time Slot */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" /> 3. Select Pickup Date & Slot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Date</label>
              <input
                type="date"
                required
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Window</label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM)</option>
                <option value="Afternoon (01:00 PM - 04:00 PM)">Afternoon (01:00 PM - 04:00 PM)</option>
                <option value="Evening (04:00 PM - 07:00 PM)">Evening (04:00 PM - 07:00 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Booking */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-genie w-full !py-4 !text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Scheduling Verified Collection...</span>
              </>
            ) : (
              <>
                <span>Confirm Pickup & Lock Valuation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
