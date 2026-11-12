import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronRight,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Smartphone,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePageLoading } from '../../context/PageLoadingContext';
import { requestApi } from '../../api/requests';
import { authApi } from '../../api/auth';
import { BuybackRequest } from '../../types';
import { DeviceImage } from '../sell/components/shared';
import { RequestDetailsPanel } from './RequestDetailsPanel';
import { TONE_CLASSES, deviceTitle, formatINR, formatPhone, formatPickupDate, isClosed, statusMeta } from './requestFormat';

type Filter = 'all' | 'active' | 'closed';

const inputClass =
  'h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-300/30 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:bg-neutral-900';

const ProfileCard: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const startEditing = () => {
    setFullName(user?.fullName || '');
    setPhone((user?.phone || '').replace(/\D/g, '').slice(-10));
    setError(null);
    setSaved(false);
    setEditing(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fullName.replace(/\s+/g, ' ').trim();
    if (name.length < 2) return setError('Please enter your full name.');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a valid 10-digit mobile number.');
    setError(null);
    setIsSaving(true);
    try {
      const updated = await authApi.updateProfile({ fullName: name, phone });
      updateUser({ ...user!, ...updated, id: user!.id });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;
  const initial = (user.fullName || user.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 text-xl font-extrabold text-white">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-ink dark:text-white">{user.fullName || 'Genie customer'}</p>
          <p className="truncate text-sm text-slate-500 dark:text-neutral-400">{user.email || formatPhone(user.phone)}</p>
        </div>
      </div>

      {saved && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Check className="h-4 w-4" /> Profile updated
        </p>
      )}

      {!editing ? (
        <>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
              <dt className="sr-only">Name</dt>
              <dd className="min-w-0 truncate text-slate-700 dark:text-neutral-200">{user.fullName || 'Add your name'}</dd>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
              <dt className="sr-only">Mobile</dt>
              <dd className={user.phone ? 'text-slate-700 dark:text-neutral-200' : 'text-amber-700 dark:text-amber-300'}>
                {user.phone ? formatPhone(user.phone) : 'Add your mobile number'}
              </dd>
            </div>
            {user.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                <dt className="sr-only">Email</dt>
                <dd className="min-w-0 truncate text-slate-700 dark:text-neutral-200">{user.email}</dd>
              </div>
            )}
          </dl>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={startEditing} className="btn-ghost !px-3 !py-2.5">
              <Pencil className="h-4 w-4" /> Edit profile
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={save} className="mt-5 space-y-3.5" noValidate>
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-neutral-300">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              maxLength={60}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-phone" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-neutral-300">
              Mobile number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-neutral-400">
                +91
              </span>
              <input
                id="profile-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`${inputClass} pl-12 font-mono tracking-wide`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-neutral-300">
              Email
            </label>
            <div className="relative">
              <input
                id="profile-email"
                type="email"
                value={user.email || 'Not linked'}
                disabled
                className={`${inputClass} cursor-not-allowed pr-10 opacity-70`}
              />
              <Lock className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-neutral-400">Your email is your login, so it can't be changed.</p>
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300" role="alert">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost !px-3 !py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-genie !px-3 !py-2.5">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const RequestCard: React.FC<{ request: BuybackRequest; onOpen: () => void }> = ({ request: r, onOpen }) => {
  const meta = statusMeta(r.status);
  const slotDiffers = r.preferredTimeWindow && r.preferredTimeWindow !== r.scheduledPickupDate;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-300 hover:shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 sm:p-5"
    >
      <span className="hidden h-20 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f6f5fa] p-1.5 dark:bg-neutral-900 sm:flex">
        <DeviceImage model={{ imageUrl: r.device?.imageUrl, slug: r.device?.slug || '', name: r.device?.modelName }} className="h-full w-full" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-slate-500 dark:text-neutral-400">
            {r.requestNumber ? r.requestNumber.replace(/^REV-/i, 'GENIE-') : ''}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TONE_CLASSES[meta.tone]}`}>{meta.label}</span>
        </span>
        <span className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-ink dark:text-white">
          {deviceTitle(r)} <span className="font-normal text-slate-500 dark:text-neutral-400">({r.device?.variant || 'Standard'})</span>
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatPickupDate(r.scheduledPickupDate)}
            {slotDiffers ? ` · ${r.preferredTimeWindow}` : ''}
          </span>
          {r.pickupAddress?.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {r.pickupAddress.city}
            </span>
          )}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="text-right">
          <span className="block text-[11px] text-slate-500 dark:text-neutral-400">Quoted</span>
          <span className="block text-base font-bold text-ink dark:text-white sm:text-lg">{formatINR(r.indicativeValuation)}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-ink dark:text-neutral-600 dark:group-hover:text-white" />
      </span>
    </button>
  );
};

export const ProfilePage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { setIsPageLoading } = usePageLoading();
  const [requests, setRequests] = useState<BuybackRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [openRequest, setOpenRequest] = useState<BuybackRequest | null>(null);
  const closeDetails = useCallback(() => setOpenRequest(null), []);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsPageLoading(true);
    requestApi
      .getMyRequests()
      .then((data) => setRequests(data || []))
      .catch(() => setRequests([]))
      .finally(() => {
        setIsLoading(false);
        setIsPageLoading(false);
      });
    return () => setIsPageLoading(false);
  }, [user?.id, setIsPageLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(
    () => ({
      all: requests.length,
      active: requests.filter((r) => !isClosed(r.status)).length,
      closed: requests.filter((r) => isClosed(r.status)).length,
    }),
    [requests]
  );

  const visible = requests.filter((r) => (filter === 'all' ? true : filter === 'active' ? !isClosed(r.status) : isClosed(r.status)));

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center animate-fade-in">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
          <User className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink dark:text-white">Log in to see your account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">View your pickups, quotes and profile details.</p>
        <button type="button" onClick={openAuthModal} className="btn-genie mt-6">
          Log in <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 animate-fade-in sm:px-6 sm:pt-10 lg:px-8 lg:pb-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">My account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">Your profile and doorstep pickups in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <ProfileCard />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Pickups', value: counts.all },
              { label: 'Active', value: counts.active },
              { label: 'Closed', value: counts.closed },
            ].map((s) => (
              <div key={s.label} className="surface px-3 py-3 text-center">
                <p className="text-xl font-bold text-ink dark:text-white">{isLoading ? '–' : s.value}</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">{s.label}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-ink dark:text-white">My pickup requests</h2>
            <Link to="/sell" className="btn-genie !px-4 !py-2.5 !text-[13px] self-start sm:self-auto">
              <Plus className="h-4 w-4" /> Sell another device
            </Link>
          </div>

          {requests.length > 0 && (
            <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
              {(['all', 'active', 'closed'] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`chip shrink-0 !rounded-full !px-4 !py-1.5 !text-[13px] ${filter === f ? 'chip-selected' : ''}`}
                >
                  {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Completed & closed'} ({counts[f]})
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[108px] animate-pulse rounded-3xl bg-slate-100 dark:bg-neutral-900" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="surface flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
                <Smartphone className="h-7 w-7" />
              </span>
              <p className="mt-4 text-base font-semibold text-ink dark:text-white">No pickups yet</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-neutral-400">
                Check your phone's price in 60 seconds and we'll pick it up for free.
              </p>
              <Link to="/sell" className="btn-genie mt-5">
                Get your price <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-neutral-800 dark:text-neutral-400">
              No pickups in this list.
            </p>
          ) : (
            <div className="space-y-3">
              {visible.map((r) => (
                <RequestCard key={r._id} request={r} onOpen={() => setOpenRequest(r)} />
              ))}
            </div>
          )}
        </section>
      </div>

      <RequestDetailsPanel request={openRequest} onClose={closeDetails} />
    </div>
  );
};
