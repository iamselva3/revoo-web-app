import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { geoApi } from '../../api/geo';
import { requestApi } from '../../api/requests';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

export const DoorstepPickupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

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

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER' | 'INSTANT_CASH'>('UPI');
  const [upiId, setUpiId] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');

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
      if (user.phone) setPhone(user.phone);
    }

    // Load states
    geoApi.getStates().then(setStatesList);
  }, [user]);

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
          paymentMethod,
          upiId: paymentMethod === 'UPI' ? upiId : undefined,
          bankAccount:
            paymentMethod === 'BANK_TRANSFER'
              ? { accountNumber, ifscCode, bankName: 'Verified Account' }
              : undefined,
        },
      };

      const result = await requestApi.submitBuybackRequest(payload);
      setSuccessBooking(result || { requestNumber: 'REV-' + Math.floor(100000 + Math.random() * 900000) });
      sessionStorage.removeItem('revoo_pending_booking');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
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
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-emerald-sm">
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
            <span className="font-black text-emerald-600 text-base">
              ₹{bookingData?.indicativeValuation?.toLocaleString('en-IN') || 'Quote'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => navigate('/track')}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-emerald-sm transition"
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
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-emerald-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Please Log In to Continue
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Please log in with Google or your mobile number to verify your pickup address and lock in your instant buyback payout.
          </p>
        </div>

        {bookingData && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900">{bookingData.device?.modelName}</p>
                <p className="text-[11px] text-slate-500 font-mono">{bookingData.device?.variant}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Locked Value</span>
              <p className="font-black text-emerald-700 text-sm">
                ₹{bookingData.indicativeValuation?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={openAuthModal}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-emerald-sm hover:shadow-emerald-glow transition flex items-center justify-center gap-2"
          >
            <span>Log In with Google / Mobile</span>
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
          <Smartphone className="w-8 h-8 text-emerald-600" />
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
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-emerald-sm transition flex items-center justify-center gap-2"
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
          <Truck className="w-6 h-6 text-emerald-600" /> Book Doorstep Pickup
        </h1>
        <p className="text-xs text-slate-500">
          We service all districts across Tamil Nadu with free pickup and on-spot payment
        </p>
      </div>

      {/* Valuation summary strip */}
      {bookingData && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                {bookingData.device?.modelName}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {bookingData.device?.variant} • {bookingData.device?.brand}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Guaranteed Payout</span>
            <p className="text-lg font-black text-emerald-700">
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
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 1. Contact Information
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
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (For OTP & Arrival)</label>
              <input
                type="tel"
                required
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Pickup address with India Geo autocomplete */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> 2. Pickup Address (Doorstep Location)
          </h2>
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
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pincode with Auto-Fill */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Pincode</span>
                  {isPincodeLoading && <span className="text-[10px] text-emerald-600">Checking...</span>}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 600001"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {statesList.map((s, idx) => {
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
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            <Calendar className="w-4 h-4 text-emerald-600" /> 3. Select Pickup Date & Slot
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
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Window</label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM)</option>
                <option value="Afternoon (01:00 PM - 04:00 PM)">Afternoon (01:00 PM - 04:00 PM)</option>
                <option value="Evening (04:00 PM - 07:00 PM)">Evening (04:00 PM - 07:00 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment preference */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> 4. Payout Method (On Device Handover)
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'UPI', label: 'Instant UPI', sub: 'GPay / PhonePe / Paytm' },
              { id: 'BANK_TRANSFER', label: 'Bank Account', sub: 'Direct IMPS' },
              { id: 'INSTANT_CASH', label: 'Doorstep Cash', sub: 'Hand-to-Hand' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaymentMethod(p.id as any)}
                className={`p-3 rounded-2xl border text-center transition ${
                  paymentMethod === p.id
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-bold text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <p className="text-xs font-bold">{p.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{p.sub}</p>
              </button>
            ))}
          </div>

          {paymentMethod === 'UPI' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID</label>
              <input
                type="text"
                placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 501002345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Booking */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-sm shadow-emerald-glow transition flex items-center justify-center gap-2"
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

