import React, { useEffect, useState } from 'react';
import {
  CalendarClock,
  Check,
  CircleAlert,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { requestApi } from '../../api/requests';
import { BuybackRequest } from '../../types';
import { DeviceImage } from '../sell/components/shared';
import {
  PROGRESS_STEPS,
  TONE_CLASSES,
  addressLines,
  deviceTitle,
  formatDateTime,
  formatINR,
  formatPhone,
  formatPickupDate,
  isStopped,
  payoutLabel,
  progressIndex,
  statusMeta,
} from './requestFormat';

const Row: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3 py-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">{label}</p>
      <div className="mt-0.5 break-words text-sm font-semibold text-ink dark:text-white">{children}</div>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-3xl border border-slate-200 p-4 dark:border-neutral-800 sm:p-5">
    <h3 className="text-sm font-bold text-ink dark:text-white">{title}</h3>
    <div className="mt-1 divide-y divide-slate-100 dark:divide-neutral-900">{children}</div>
  </section>
);

interface RequestDetailsPanelProps {
  request: BuybackRequest | null;
  onClose: () => void;
}

/** Slide-over (desktop) / full-screen sheet (phone) with everything about one pickup. */
export const RequestDetailsPanel: React.FC<RequestDetailsPanelProps> = ({ request, onClose }) => {
  const [details, setDetails] = useState<BuybackRequest | null>(request);

  useEffect(() => {
    setDetails(request);
    if (!request) return;
    let cancelled = false;
    requestApi.getRequestById(request._id).then((full) => {
      if (!cancelled && full) setDetails({ ...request, ...full });
    });
    return () => {
      cancelled = true;
    };
  }, [request]);

  useEffect(() => {
    if (!request) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [request, onClose]);

  if (!request || !details) return null;

  const r = details;
  const meta = statusMeta(r.status);
  const stepIndex = progressIndex(r.status);
  const stopped = isStopped(r.status);
  const payout = payoutLabel(r.payoutDetails);
  const lines = addressLines(r.pickupAddress);
  const slotDiffers = r.preferredTimeWindow && r.preferredTimeWindow !== r.scheduledPickupDate;
  const summary = r.declaredCondition?.summary || [];
  const timeline = [...(r.timeline || [])].reverse();

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-[2px] animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-details-title"
    >
      <div className="flex h-full w-full flex-col bg-white shadow-2xl animate-slide-up dark:bg-neutral-950 sm:max-w-xl sm:animate-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-neutral-900 sm:px-6">
          <div className="min-w-0">
            <p className="font-mono text-xs text-slate-500 dark:text-neutral-400">{r.requestNumber}</p>
            <h2 id="request-details-title" className="mt-0.5 truncate text-lg font-bold text-ink dark:text-white">
              Pickup details
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${TONE_CLASSES[meta.tone]}`}>{meta.label}</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          {/* Device + price */}
          <div className="flex items-center gap-4 rounded-3xl bg-[#f6f5fa] p-4 dark:bg-neutral-900">
            <span className="flex h-20 w-16 shrink-0 items-center justify-center">
              <DeviceImage model={{ imageUrl: r.device?.imageUrl, slug: r.device?.slug || '', name: r.device?.modelName }} className="h-full w-full" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-ink dark:text-white">{deviceTitle(r)}</p>
              <p className="text-sm text-slate-500 dark:text-neutral-400">{r.device?.variant || 'Standard'}</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span>
                  <span className="text-xs text-slate-500 dark:text-neutral-400">Quoted </span>
                  <span className="text-lg font-bold text-ink dark:text-white">{formatINR(r.indicativeValuation)}</span>
                </span>
                {typeof r.finalOfferAmount === 'number' && (
                  <span>
                    <span className="text-xs text-slate-500 dark:text-neutral-400">Final offer </span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatINR(r.finalOfferAmount)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          {stopped ? (
            <div className={`flex items-start gap-3 rounded-3xl p-4 ring-1 ring-inset ${TONE_CLASSES[meta.tone]}`}>
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">This pickup is {meta.label.toLowerCase()}. Contact support if you have questions.</p>
            </div>
          ) : (
            <ol className="grid grid-cols-5 gap-1" aria-label="Pickup progress">
              {PROGRESS_STEPS.map((label, i) => {
                const done = i <= stepIndex;
                return (
                  <li key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="relative flex w-full items-center">
                      <span className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : done ? 'bg-amber-400' : 'bg-slate-200 dark:bg-neutral-800'}`} />
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done ? 'bg-amber-400 text-[#1a1033]' : 'bg-slate-100 text-slate-400 dark:bg-neutral-900 dark:text-neutral-600'
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                      </span>
                      <span
                        className={`h-0.5 flex-1 ${i === PROGRESS_STEPS.length - 1 ? 'opacity-0' : i < stepIndex ? 'bg-amber-400' : 'bg-slate-200 dark:bg-neutral-800'}`}
                      />
                    </span>
                    <span className={`text-[11px] leading-tight ${done ? 'font-semibold text-ink dark:text-white' : 'text-slate-400 dark:text-neutral-500'}`}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <Section title="Pickup">
            <Row icon={CalendarClock} label="Date & time slot">
              {formatPickupDate(r.scheduledPickupDate)}
              {slotDiffers && <span className="block font-medium text-slate-600 dark:text-neutral-300">{r.preferredTimeWindow}</span>}
            </Row>
            <Row icon={MapPin} label="Pickup address">
              {lines.length ? lines.map((l) => <span key={l} className="block">{l}</span>) : 'Not provided'}
            </Row>
            {r.assignedCollector?.staffName && (
              <Row icon={ShieldCheck} label="Pickup agent">
                {r.assignedCollector.staffName}
                {r.assignedCollector.timeSlot && (
                  <span className="block font-medium text-slate-600 dark:text-neutral-300">{r.assignedCollector.timeSlot}</span>
                )}
              </Row>
            )}
          </Section>

          <Section title="Contact you gave">
            <Row icon={User} label="Name">{r.customer?.fullName || 'Not provided'}</Row>
            <Row icon={Phone} label="Mobile number (our agent calls this number)">{formatPhone(r.customer?.phone)}</Row>
            {r.customer?.email && <Row icon={Mail} label="Email">{r.customer.email}</Row>}
          </Section>

          <Section title="Payment">
            <Row icon={Wallet} label="Payout method">
              {payout.title}
              {payout.detail && <span className="block font-mono text-[13px] font-medium text-slate-600 dark:text-neutral-300">{payout.detail}</span>}
            </Row>
            <Row icon={IndianRupee} label="Quoted price">
              {formatINR(r.indicativeValuation)}
              <span className="block text-xs font-medium text-slate-500 dark:text-neutral-400">Confirmed after a quick check at pickup</span>
            </Row>
          </Section>

          {summary.length > 0 && (
            <Section title="Device condition you declared">
              <div className="space-y-3 py-3">
                {summary.map((g) => (
                  <div key={g.title}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">{g.title}</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700 marker:text-slate-300 dark:text-neutral-300">
                      {g.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {timeline.length > 0 && (
            <Section title="Activity">
              <ol className="space-y-3 py-3">
                {timeline.map((t, i) => (
                  <li key={`${t.status}-${t.timestamp}-${i}`} className="flex gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-slate-300 dark:bg-neutral-700'}`} />
                    <div>
                      <p className="text-sm font-semibold text-ink dark:text-white">{statusMeta(t.status).label}</p>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        {formatDateTime(t.timestamp)}
                        {t.note ? ` · ${t.note}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          <div className="rounded-3xl bg-[#faf9fd] p-4 text-sm text-slate-600 dark:bg-neutral-900 dark:text-neutral-300">
            Need to reschedule, cancel or change your number?{' '}
            <a href="tel:+919442054321" className="font-semibold text-ink underline-offset-2 hover:underline dark:text-white">
              Call +91 94420 54321
            </a>{' '}
            or{' '}
            <a href={`mailto:support@genie.in?subject=${encodeURIComponent(`Pickup ${r.requestNumber}`)}`} className="font-semibold text-ink underline-offset-2 hover:underline dark:text-white">
              email support
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};
