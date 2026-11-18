import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, KeyRound, Phone, QrCode, Search } from 'lucide-react';
import { GenieLogo } from '../components/brand/GenieLogo';
import {
  PARTNER_SIGNED_OUT,
  Partner,
  bookingRefFrom,
  clearPartnerSession,
  errorMessage,
  getPartnerToken,
  getStoredPartner,
  partnerApi,
  storePartnerSession,
} from './partnerApi';
import { QrScanner } from './QrScanner';
import { CheckPage } from './CheckPage';
import { ErrorNote, OutcomeBadge, PartnerTopBar, Spinner, formatINR, signedINR } from './ui';

/** Where a scanned or typed booking opens (keeps the QR link's number through sign-in). */
const checkPath = (ref: string) => `/partner/check/${encodeURIComponent(ref)}`;

const usePartnerSession = () => {
  const [partner, setPartner] = useState<Partner | null>(() => (getPartnerToken() ? getStoredPartner() : null));
  useEffect(() => {
    const onOut = () => setPartner(null);
    window.addEventListener(PARTNER_SIGNED_OUT, onOut);
    return () => window.removeEventListener(PARTNER_SIGNED_OUT, onOut);
  }, []);
  const signOut = useCallback(() => {
    clearPartnerSession();
    setPartner(null);
  }, []);
  return { partner, setPartner, signOut };
};

const LoginPage: React.FC<{ onSignedIn: (p: Partner) => void }> = ({ onSignedIn }) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return setError('Enter your phone number.');
    if (!/^\d{6}$/.test(pin)) return setError('Enter your 6-digit PIN.');
    setBusy(true);
    setError(null);
    try {
      const { token, partner } = await partnerApi.login(phone.trim(), pin);
      storePartnerSession(token, partner);
      onSignedIn(partner);
    } catch (err) {
      setError(errorMessage(err));
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-br from-amber-50 via-white to-violet-50 px-4 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
        <div className="flex flex-col items-center text-center">
          <GenieLogo size="lg" animateOnMount />
          <span className="mt-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
            Pickup partner
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink dark:text-white">Sign in to check devices</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">Use your phone number and the PIN the Genie team gave you.</p>
        </div>
        <form onSubmit={submit} className="surface mt-8 space-y-4 p-5" noValidate>
          <label className="block">
            <span className="text-sm font-semibold text-ink dark:text-white">Phone number</span>
            <span className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-ink focus-within:ring-4 focus-within:ring-slate-200/60 dark:border-neutral-800 dark:bg-neutral-950 dark:focus-within:border-amber-400 dark:focus-within:ring-amber-400/20">
              <Phone className="h-4 w-4 text-slate-400" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="username"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="h-12 w-full bg-transparent text-base outline-none"
              />
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink dark:text-white">PIN</span>
            <span className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-ink focus-within:ring-4 focus-within:ring-slate-200/60 dark:border-neutral-800 dark:bg-neutral-950 dark:focus-within:border-amber-400 dark:focus-within:ring-amber-400/20">
              <KeyRound className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6 digits"
                className="h-12 w-full bg-transparent text-base tracking-[0.3em] outline-none placeholder:tracking-normal"
              />
            </span>
          </label>
          {error && <ErrorNote>{error}</ErrorNote>}
          <button type="submit" disabled={busy} className="btn-genie w-full !py-4 !text-base">
            {busy ? <Spinner /> : <>Sign in <ArrowRight className="h-5 w-5" /></>}
          </button>
          <p className="text-center text-xs text-slate-500 dark:text-neutral-400">Forgot your PIN? Ask the Genie team to set a new one.</p>
        </form>
      </div>
    </div>
  );
};

const HomePage: React.FC<{ partner: Partner; onSignOut: () => void }> = ({ partner, onSignOut }) => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [typed, setTyped] = useState(`GENIE-${new Date().getFullYear()}-`);
  const [error, setError] = useState<string | null>(null);
  const checks = useQuery({ queryKey: ['partner-checks', partner.id], queryFn: partnerApi.myChecks, staleTime: 30_000 });

  const open = useCallback(
    (text: string) => {
      const ref = bookingRefFrom(text);
      if (!ref) {
        setError('That isn’t a Genie booking number. It looks like GENIE-2026-1011.');
        return;
      }
      setError(null);
      setScanning(false);
      navigate(checkPath(ref));
    },
    [navigate]
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-black">
      <PartnerTopBar onSignOut={onSignOut} />
      <main className="mx-auto max-w-xl space-y-5 px-4 py-5">
        <div>
          <p className="text-sm text-slate-500 dark:text-neutral-400">Hi {partner.fullName.split(' ')[0]} · {partner.employeeCode}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink dark:text-white">Check a device</h1>
        </div>

        <button
          type="button"
          onClick={() => setScanning(true)}
          className="flex w-full items-center gap-4 rounded-3xl bg-ink p-5 text-left text-white shadow-soft transition active:scale-[0.99] dark:bg-amber-400 dark:text-black"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 dark:bg-black/10">
            <QrCode className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold">Scan the booking QR</span>
            <span className="block text-sm opacity-75">The customer shows it from their Genie booking</span>
          </span>
          <ChevronRight className="h-5 w-5 opacity-60" />
        </button>

        <form
          className="surface p-4"
          onSubmit={(e) => {
            e.preventDefault();
            open(typed);
          }}
        >
          <label htmlFor="booking-number" className="text-sm font-semibold text-ink dark:text-white">
            Or type the booking number
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="booking-number"
              value={typed}
              onChange={(e) => setTyped(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 font-mono text-base tracking-wide outline-none focus:border-ink focus:ring-4 focus:ring-slate-200/60 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-amber-400 dark:focus:ring-amber-400/20"
            />
            <button type="submit" className="btn-genie shrink-0 !px-4" aria-label="Open booking">
              <Search className="h-5 w-5" />
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{error}</p>}
        </form>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Your recent checks</h2>
          {checks.isLoading ? (
            <div className="flex justify-center py-8 text-slate-400"><Spinner /></div>
          ) : !checks.data?.length ? (
            <p className="surface p-5 text-center text-sm text-slate-500 dark:text-neutral-400">Checks you finish show up here.</p>
          ) : (
            <ul className="surface divide-y divide-slate-100 overflow-hidden dark:divide-neutral-900">
              {checks.data.map((c) => (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => navigate(checkPath(c.requestNumber))}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-neutral-900"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink dark:text-white">{c.device?.modelName}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-neutral-400">
                        {c.requestNumber} · {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-ink dark:text-white">{formatINR(c.finalAmount)}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1.5">
                        {c.difference !== 0 && (
                          <span className={`text-[11px] font-semibold ${c.difference < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
                            {signedINR(c.difference)}
                          </span>
                        )}
                        <OutcomeBadge outcome={c.outcome} />
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      {scanning && <QrScanner onResult={open} onClose={() => setScanning(false)} />}
    </div>
  );
};

/** genietn.in/partner: sign in, then scan or type a booking and check the device. */
export const PartnerApp: React.FC = () => {
  const { partner, setPartner, signOut } = usePartnerSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // The customer's QR is a link: genietn.in/partner?r=GENIE-2026-1011 (also when scanned with the
  // phone's own camera app). Keep the number through sign-in, then open it.
  const fromQr = bookingRefFrom(params.get('r') || '');
  useEffect(() => {
    if (partner && fromQr) navigate(checkPath(fromQr), { replace: true });
  }, [partner, fromQr, navigate]);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Genie Partner';
    return () => {
      document.title = previous;
    };
  }, []);

  if (!partner) return <LoginPage onSignedIn={setPartner} />;

  return (
    <Routes location={location}>
      <Route index element={<HomePage partner={partner} onSignOut={signOut} />} />
      <Route path="check/:ref" element={<CheckPage partner={partner} />} />
      <Route path="*" element={<Navigate to="/partner" replace />} />
    </Routes>
  );
};

export default PartnerApp;
