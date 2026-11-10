import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestApi } from '../../api/requests';
import { usePageLoading } from '../../context/PageLoadingContext';
import { PageLoadingSkeleton } from '../../components/common/PageLoadingSkeleton';
import {
  User,
  Smartphone,
  Truck,
  Phone,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, openAuthModal } = useAuth();
  const { setIsPageLoading } = usePageLoading();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setIsPageLoading(true);
      requestApi
        .getMyRequests()
        .then((data) => {
          setRequests(data || []);
        })
        .catch(() => setRequests([]))
        .finally(() => {
          setIsLoading(false);
          setIsPageLoading(false);
        });
    } else {
      setIsLoading(false);
      setIsPageLoading(false);
    }

    return () => setIsPageLoading(false);
  }, [user, setIsPageLoading]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Please Log In</h2>
        <p className="text-xs text-slate-500">
          Log in with your mobile number to view your buyback requests and order history.
        </p>
        <button
          onClick={openAuthModal}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-bold text-xs shadow-brand-sm transition"
        >
          Log In with Mobile Number
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-rose-600 to-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-brand-sm">
            {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {user.fullName || 'Genie Customer'}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>+91 {user.phone}</span>
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="py-2 px-4 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-rose-600" /> Doorstep Pickup Requests ({requests.length})
          </h2>
          <button
            onClick={() => navigate('/sell')}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            + Sell Another Device
          </button>
        </div>

        {isLoading ? (
          <PageLoadingSkeleton
            title="Loading Orders & Pickup Requests..."
            subtitle="Fetching your order history and scheduled doorstep inspections"
            type="generic"
          />
        ) : requests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-700">No active pickup requests yet.</p>
            <p className="text-[11px] text-slate-400">
              Calculate your old smartphone's value and get instant cash at your doorstep.
            </p>
            <button
              onClick={() => navigate('/sell')}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 hover:from-rose-700 hover:via-pink-700 hover:to-violet-700 text-white font-bold text-xs shadow-brand-sm"
            >
              Sell Used Phone
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/track?id=${r.requestNumber}`)}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card hover:border-rose-500 cursor-pointer transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {r.requestNumber || r._id}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      {r.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-rose-600 transition mt-1">
                    {r.device?.brand} {r.device?.modelName} ({r.device?.variant})
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pickup: {r.scheduledPickupDate} • {r.pickupAddress?.city || 'Tamil Nadu'}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Valuation</span>
                    <span className="text-sm font-black text-rose-600">
                      ₹{r.indicativeValuation?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
