import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { requestApi } from '../../api/requests';
import { useAuth } from '../../context/AuthContext';
import { BuybackRequest } from '../../types';
import { usePageLoading } from '../../context/PageLoadingContext';
import { PageLoadingSkeleton } from '../../components/common/PageLoadingSkeleton';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Smartphone,
  Calendar,
  MapPin,
  CreditCard,
  User,
  ArrowRight,
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, openAuthModal } = useAuth();

  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [requests, setRequests] = useState<BuybackRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BuybackRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If user is logged in, auto-load their requests
  useEffect(() => {
    if (user) {
      requestApi.getMyRequests().then((list) => {
        const safeList = list || [];
        setRequests(safeList);
        if (safeList.length > 0) {
          const reqId = searchParams.get('id');
          const found = reqId ? safeList.find((r) => r.requestNumber === reqId || r._id === reqId) : safeList[0];
          setSelectedRequest(found || safeList[0]);
        }
      }).catch(() => {
        setRequests([]);
      });
    }
  }, [user, searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Find locally first or search API
      const found = requests.find(
        (r) => r.requestNumber?.toLowerCase() === query.trim().toLowerCase() || r._id === query.trim()
      );
      if (found) {
        setSelectedRequest(found);
      } else {
        const item = await requestApi.getRequestById(query.trim());
        if (item) {
          setSelectedRequest(item);
        } else {
          setErrorMsg('No booking found for this Request ID. Please verify your reference number.');
        }
      }
    } catch {
      setErrorMsg('No booking found with this ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { id: 'SUBMITTED', title: 'Request Placed', desc: 'Doorstep pickup booked online', done: true },
      { id: 'ASSIGNED', title: 'Collection Partner Assigned', desc: 'Verified local pickup staff allocated', done: false },
      { id: 'OUT_FOR_PICKUP', title: 'Out for Pickup', desc: 'Staff en-route to your address', done: false },
      { id: 'INSPECTED', title: 'Device Verified', desc: 'Quick diagnostic check at doorstep', done: false },
      { id: 'PAID', title: 'Payment Completed', desc: 'Direct IMPS / UPI payout credited', done: false },
    ];

    if (['COLLECTION_ASSIGNED', 'OUT_FOR_PICKUP', 'COLLECTED', 'UNDER_INSPECTION', 'FINAL_OFFER_MADE', 'OFFER_ACCEPTED', 'PAID', 'COMPLETED'].includes(status)) {
      steps[1].done = true;
    }
    if (['OUT_FOR_PICKUP', 'COLLECTED', 'UNDER_INSPECTION', 'FINAL_OFFER_MADE', 'OFFER_ACCEPTED', 'PAID', 'COMPLETED'].includes(status)) {
      steps[2].done = true;
    }
    if (['COLLECTED', 'UNDER_INSPECTION', 'FINAL_OFFER_MADE', 'OFFER_ACCEPTED', 'PAID', 'COMPLETED'].includes(status)) {
      steps[3].done = true;
    }
    if (['PAID', 'COMPLETED'].includes(status)) {
      steps[4].done = true;
    }

    return steps;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <Truck className="w-6 h-6 text-rose-600" /> Track Pickup Request
        </h1>
        <p className="text-xs text-slate-500">
          Enter your Request Number or login to view real-time doorstep collection status
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            required
            placeholder="Enter Request ID (e.g. REV-89421)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-bold text-xs shadow-brand-sm transition"
        >
          Track
        </button>
      </form>

      {!user && (
        <div className="text-center">
          <button
            onClick={openAuthModal}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Or Log In to view all your past requests automatically →
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center max-w-lg mx-auto">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <PageLoadingSkeleton
          title="Looking up Request Status..."
          subtitle="Fetching verified status and doorstep pickup appointment details"
          type="generic"
        />
      ) : selectedRequest ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-8 animate-slide-up">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Booking Reference
              </span>
              <h2 className="text-lg font-black text-slate-900 font-mono">
                {selectedRequest.requestNumber
                  ? selectedRequest.requestNumber.replace(/^REV-/i, 'GENIE-')
                  : selectedRequest._id}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {selectedRequest.status?.replace(/_/g, ' ') || 'CONFIRMED'}
              </span>
            </div>
          </div>

          {/* Device & Valuation summary */}
          {(() => {
            const modelName =
              selectedRequest.device?.modelName ||
              (selectedRequest as any).deviceDetails?.modelName ||
              'Smartphone';
            const variant =
              selectedRequest.device?.variant ||
              (selectedRequest as any).deviceDetails?.storageCapacity ||
              '';
            const scheduledDate =
              selectedRequest.scheduledPickupDate ||
              (selectedRequest as any).pickupAddress?.scheduledDate ||
              (selectedRequest as any).assignedCollector?.scheduledDate ||
              (selectedRequest.createdAt
                ? new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
                : 'Tomorrow');
            const timeWindow =
              selectedRequest.preferredTimeWindow ||
              (selectedRequest as any).pickupAddress?.preferredSlot ||
              (selectedRequest as any).assignedCollector?.timeSlot ||
              '10:00 AM - 1:00 PM';
            const payoutAmount =
              selectedRequest.indicativeValuation ||
              (selectedRequest as any).indicativeEstimate?.estimatedAmount ||
              (selectedRequest as any).finalOfferAmount ||
              0;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Device</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {modelName}
                    {variant ? ` (${variant})` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Scheduled Slot</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {scheduledDate}
                    {timeWindow ? ` • ${timeWindow}` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Expected Payout</span>
                  <p className="font-black text-rose-600 text-sm mt-0.5">
                    ₹{payoutAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Visual Step Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Doorstep Progress Timeline
            </h3>

            <div className="space-y-4 pl-2">
              {getTimelineSteps(selectedRequest.status).map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  {idx < 4 && (
                    <div
                      className={`absolute left-3.5 top-7 w-0.5 h-8 transition-colors ${step.done ? 'bg-gradient-to-b from-rose-600 to-violet-600' : 'bg-slate-200'
                        }`}
                    />
                  )}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 z-10 transition-colors ${step.done
                        ? 'bg-gradient-to-r from-rose-600 to-violet-600 text-white shadow-brand-sm'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                  >
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'
                        }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-3 max-w-xl mx-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Your Active Bookings
          </h3>
          {requests.map((r) => (
            <div
              key={r._id}
              onClick={() => setSelectedRequest(r)}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card hover:border-rose-500 cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-xs text-slate-900">{r.device?.modelName}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {r.requestNumber ? r.requestNumber.replace(/^REV-/i, 'GENIE-') : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-rose-600">
                  ₹{r.indicativeValuation?.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-slate-400">{r.scheduledPickupDate}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

