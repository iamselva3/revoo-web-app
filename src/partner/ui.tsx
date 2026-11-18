import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2, Loader2, LogOut, X, XCircle } from 'lucide-react';
import { GenieLogo } from '../components/brand/GenieLogo';
import { formatINR } from '../pages/sell/components/shared';

export { formatINR };

/** "−₹1,200" / "+₹500" / "No change" */
export const signedINR = (difference: number) =>
  difference === 0 ? 'No change' : `${difference < 0 ? '−' : '+'}${formatINR(Math.abs(difference))}`;

export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

/** Top bar of every partner page: back (or the logo), a title, and sign out. */
export const PartnerTopBar: React.FC<{ title?: string; backTo?: string; onBack?: () => void; onSignOut?: () => void }> = ({
  title,
  backTo,
  onBack,
  onSignOut,
}) => (
  <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-neutral-900 dark:bg-black/85">
    <div className="mx-auto flex h-14 max-w-xl items-center gap-2 px-3">
      {backTo || onBack ? (
        backTo ? (
          <Link to={backTo} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-neutral-900" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        ) : (
          <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-neutral-900" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )
      ) : (
        <GenieLogo size="sm" />
      )}
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="truncate text-sm font-bold text-ink dark:text-white">{title}</p>
        ) : (
          <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
            Partner
          </span>
        )}
      </div>
      {onSignOut && (
        <button
          type="button"
          onClick={onSignOut}
          className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      )}
    </div>
  </header>
);

/** In-page dialog (never the browser's own pop-ups). Closes on Escape and on the backdrop. */
export const Dialog: React.FC<{ open: boolean; title: string; onClose: () => void; children: React.ReactNode }> = ({
  open,
  title,
  onClose,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(env(safe-area-inset-bottom),20px)] shadow-2xl animate-fade-in dark:bg-neutral-950 sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-ink dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="-mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-neutral-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ErrorNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10">
    {children}
  </p>
);

const OUTCOME_BADGE = {
  AGREED: { label: 'Bought', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' },
  DECLINED: { label: 'Declined', icon: XCircle, cls: 'bg-slate-100 text-slate-700 dark:bg-neutral-900 dark:text-neutral-300' },
  NOT_BUYABLE: { label: 'Not bought', icon: Ban, cls: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300' },
} as const;

export const OutcomeBadge: React.FC<{ outcome: keyof typeof OUTCOME_BADGE }> = ({ outcome }) => {
  const b = OUTCOME_BADGE[outcome];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.cls}`}>
      <b.icon className="h-3 w-3" /> {b.label}
    </span>
  );
};
