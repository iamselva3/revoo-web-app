import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  History,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { ConditionArt } from '../components/sell/ConditionArt';
import { DeviceImage, OptionCard, formatCapacity, fullDeviceName } from '../pages/sell/components/shared';
import {
  DEVICE_AGE_OPTIONS,
  EvaluationAnswers,
  SCREENING_QUESTIONS,
  accessoriesFor,
  asksWarranty,
  buildConditionPayload,
  buildSummary,
  functionalIssuesFor,
  underWarranty,
  visiblePhysicalSections,
} from '../pages/sell/evaluation';
import { answerDiffs, answersFromCondition, shrinkPhoto } from './answers';
import { formatPickupDate } from '../pages/profile/requestFormat';
import { DoorstepPricing, Outcome, Partner, PartnerRequest, errorMessage, partnerApi } from './partnerApi';
import { Dialog, ErrorNote, OutcomeBadge, PartnerTopBar, Spinner, formatINR, signedINR } from './ui';

type Step = 'booking' | 'check' | 'review' | 'done';

const PAYOUT_LABEL: Record<string, string> = { UPI: 'UPI', BANK_TRANSFER: 'Bank transfer', INSTANT_CASH: 'Cash at pickup' };

const telHref = (phone?: string) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `tel:+91${digits.slice(-10)}` : undefined;
};
const prettyPhone = (phone?: string) => {
  const d = String(phone || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : phone;
};

/** "Customer said: …" next to a question the partner answered differently. */
const CustomerSaid: React.FC<{ text: string }> = ({ text }) => (
  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
    Customer said: {text}
  </span>
);

const Section: React.FC<{ title: string; subtitle?: string; changed?: string | null; children: React.ReactNode }> = ({ title, subtitle, changed, children }) => (
  <section className={`surface p-4 ${changed ? 'ring-2 ring-amber-300 dark:ring-amber-400/50' : ''}`}>
    <h3 className="text-base font-semibold text-ink dark:text-white">{title}</h3>
    {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400">{subtitle}</p>}
    {changed && <CustomerSaid text={changed} />}
    <div className="mt-3">{children}</div>
  </section>
);

const YesNo: React.FC<{ value: boolean | null; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    {[true, false].map((v) => (
      <button key={String(v)} type="button" onClick={() => onChange(v)} aria-pressed={value === v} className={`chip h-11 ${value === v ? 'chip-selected' : ''}`}>
        {v ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <X className="h-4 w-4" strokeWidth={2.6} />}
        {v ? 'Yes' : 'No'}
      </button>
    ))}
  </div>
);

/** Compact on/off row (functional issues, accessories). */
const ToggleRow: React.FC<{ on: boolean; label: string; onToggle: () => void; art?: React.ReactNode; changed?: boolean }> = ({ on, label, onToggle, art, changed }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={on}
    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
      on ? 'border-ink bg-ink/[0.03] dark:border-amber-400 dark:bg-amber-400/10' : 'border-slate-200 dark:border-neutral-800'
    } ${changed ? 'ring-2 ring-amber-300 dark:ring-amber-400/50' : ''}`}
  >
    {art && <span className="flex h-10 w-10 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-[#f4f4f6] dark:bg-neutral-900">{art}</span>}
    <span className="min-w-0 flex-1 text-sm font-medium text-slate-800 dark:text-neutral-100">{label}</span>
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
        on ? 'border-ink bg-ink text-white dark:border-amber-400 dark:bg-amber-400 dark:text-black' : 'border-slate-300 text-transparent dark:border-neutral-700'
      }`}
      aria-hidden="true"
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  </button>
);

/** Worst → best price of this device, with the quote and the partner's price on it. */
const PriceRange: React.FC<{ pricing: DoorstepPricing }> = ({ pricing }) => {
  const span = Math.max(1, pricing.bestAmount - pricing.worstAmount);
  const at = (v: number) => `${Math.min(100, Math.max(0, ((v - pricing.worstAmount) / span) * 100))}%`;
  return (
    <div>
      <div className="relative mt-6 h-2 rounded-full bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-400">
        <span className="absolute -top-6 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-slate-500 dark:text-neutral-400" style={{ left: at(pricing.quotedAmount) }}>
          Quote
        </span>
        <span className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500" style={{ left: at(pricing.quotedAmount) }} />
        {pricing.finalAmount !== pricing.quotedAmount && (
          <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-ink shadow dark:border-black dark:bg-amber-400" style={{ left: at(pricing.finalAmount) }} />
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <span className="text-slate-500 dark:text-neutral-400">
          Worst <b className="text-ink dark:text-white">{formatINR(pricing.worstAmount)}</b>
        </span>
        <span className="text-slate-500 dark:text-neutral-400">
          Best <b className="text-ink dark:text-white">{formatINR(pricing.bestAmount)}</b>
        </span>
      </div>
    </div>
  );
};

export const CheckPage: React.FC<{ partner: Partner }> = () => {
  const { ref = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const booking = useQuery({ queryKey: ['partner-request', ref], queryFn: () => partnerApi.getRequest(ref), retry: false, staleTime: 0 });

  const [step, setStep] = useState<Step>('booking');
  const [answers, setAnswers] = useState<EvaluationAnswers | null>(null);
  const [variantId, setVariantId] = useState<string | undefined>();
  const [pricing, setPricing] = useState<DoorstepPricing | null>(null);
  const [pricingBusy, setPricingBusy] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [imei, setImei] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Outcome | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ outcome: Outcome; finalAmount: number; difference: number } | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  const req: PartnerRequest | undefined = booking.data;
  const customerAnswers = useMemo(() => (req ? answersFromCondition(req.customerCondition) : null), [req]);

  // Start from exactly what the customer said
  useEffect(() => {
    if (!req || answers) return;
    setAnswers(answersFromCondition(req.customerCondition));
    setVariantId(req.device.variantId);
    setPricing(req.pricing);
  }, [req, answers]);

  // Live price for the partner's answers (the server prices it with the admin's settings)
  useEffect(() => {
    if (!req || !answers || step === 'booking' || step === 'done') return;
    const controller = new AbortController();
    setPricingBusy(true);
    setPricingError(null);
    const timer = window.setTimeout(async () => {
      try {
        const next = await partnerApi.price(req.requestNumber, { variantId, condition: buildConditionPayload(answers) }, controller.signal);
        setPricing(next);
        setPricingBusy(false);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || controller.signal.aborted) return;
        setPricingError(errorMessage(err, 'Couldn’t update the price.'));
        setPricingBusy(false);
      }
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [req, answers, variantId, step, retryKey]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  if (booking.isLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 dark:bg-black">
        <PartnerTopBar backTo="/partner" title={ref} />
        <div className="flex justify-center py-20 text-slate-400"><Spinner className="h-7 w-7" /></div>
      </div>
    );
  }
  if (booking.isError || !req || !answers || !customerAnswers) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 dark:bg-black">
        <PartnerTopBar backTo="/partner" title={ref} />
        <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
          <ErrorNote>{booking.isError ? errorMessage(booking.error) : 'Loading…'}</ErrorNote>
          <Link to="/partner" className="btn-ghost w-full">Scan or type another number</Link>
        </main>
      </div>
    );
  }

  const modelName = req.device.modelName;
  const deviceName = fullDeviceName(req.device.brandName, modelName);
  const diffs = answerDiffs(customerAnswers, answers, modelName);
  const storageOf = (id?: string) => req.variants.find((v) => v.id === id)?.capacity ?? req.device.storage ?? '';
  const storageChanged = Boolean(variantId && req.device.variantId && variantId !== req.device.variantId);
  const needsAge = underWarranty(answers) && !answers.deviceAge;
  const priceReady = Boolean(pricing) && !pricingBusy && !pricingError;
  const address = [req.pickupAddress.street, req.pickupAddress.area, req.pickupAddress.landmark ? `Landmark: ${req.pickupAddress.landmark}` : '', [req.pickupAddress.city, req.pickupAddress.pincode].filter(Boolean).join(' - ')]
    .filter(Boolean)
    .join(', ');

  const set = <K extends keyof EvaluationAnswers>(key: K, value: EvaluationAnswers[K]) => setAnswers((a) => (a ? { ...a, [key]: value } : a));

  /** Screening answers, with the questions that appear next filled from the customer's answers. */
  const setScreening = (key: (typeof SCREENING_QUESTIONS)[number]['key'], value: boolean) =>
    setAnswers((a) => {
      if (!a) return a;
      const next = { ...a, [key]: value };
      if (next.isPhoneWorking && next.isTouchscreenWorking === null) next.isTouchscreenWorking = customerAnswers.isTouchscreenWorking ?? true;
      if (next.isPhoneWorking && next.isTouchscreenWorking && next.isDisplayOriginal === null) next.isDisplayOriginal = customerAnswers.isDisplayOriginal ?? true;
      if (asksWarranty(next) && next.hasValidWarranty === null) next.hasValidWarranty = customerAnswers.hasValidWarranty ?? false;
      if (next.isPhoneWorking) {
        next.screenDisplayCondition ??= customerAnswers.screenDisplayCondition ?? 'NO_SPOT';
        next.touchGlassCondition ??= customerAnswers.touchGlassCondition ?? 'NO_SCRATCH';
        next.backPanelCondition ??= customerAnswers.backPanelCondition ?? 'NO_DEFECTS';
        next.sidePanelCondition ??= customerAnswers.sidePanelCondition ?? 'NO_DEFECTS';
      }
      return next;
    });

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoError(null);
    const list = Array.from(files).slice(0, Math.max(0, 6 - photos.length));
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const url = await partnerApi.uploadPhoto(await shrinkPhoto(file));
        setPhotos((p) => [...p, url]);
      } catch (err) {
        setPhotoError(errorMessage(err, 'A photo didn’t upload. Try again.'));
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const save = async (outcome: Outcome) => {
    setSaving(true);
    setSaveError(null);
    try {
      const check = await partnerApi.submitCheck(req.requestNumber, {
        variantId,
        condition: buildConditionPayload(answers),
        outcome,
        notBuyableReason: outcome === 'NOT_BUYABLE' ? reason : undefined,
        imei: imei.trim() || undefined,
        photoUrls: photos,
        notes: notes.trim() || undefined,
      });
      setSaved({ outcome, finalAmount: check.finalAmount, difference: check.difference });
      setDialog(null);
      setStep('done');
      queryClient.invalidateQueries({ queryKey: ['partner-checks'] });
      queryClient.invalidateQueries({ queryKey: ['partner-request', ref] });
    } catch (err) {
      setSaveError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    if (step === 'check') setStep('booking');
    else if (step === 'review') setStep('check');
    else navigate('/partner');
  };

  const PriceBar = (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-neutral-900 dark:bg-black/90">
      <div className="mx-auto flex max-w-xl items-center gap-3 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Final price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-ink dark:text-white">{pricing ? formatINR(pricing.finalAmount) : '—'}</span>
            {pricingBusy ? (
              <Spinner className="h-4 w-4 text-slate-400" />
            ) : pricing && pricing.difference !== 0 ? (
              <span className={`text-sm font-semibold ${pricing.difference < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
                {signedINR(pricing.difference)}
              </span>
            ) : (
              pricing && <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">Same as quote</span>
            )}
          </div>
          {pricingError && (
            <button type="button" onClick={() => setRetryKey((k) => k + 1)} className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
              <RefreshCw className="h-3 w-3" /> {pricingError} Tap to retry
            </button>
          )}
        </div>
        {step === 'check' && (
          <button type="button" disabled={!priceReady || needsAge} onClick={() => setStep('review')} className="btn-genie shrink-0">
            Review <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-[100dvh] bg-slate-50 dark:bg-black ${step === 'check' ? 'pb-32' : 'pb-10'}`}>
      <PartnerTopBar onBack={back} title={step === 'done' ? 'Saved' : `${req.requestNumber} · ${step === 'booking' ? 'Booking' : step === 'check' ? 'Check device' : 'Finish with customer'}`} />

      <main className="mx-auto max-w-xl space-y-4 px-4 py-4">
        {step === 'booking' && (
          <>
            {req.closed && (
              <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <ShieldAlert className="h-5 w-5 shrink-0 text-slate-500" />
                <p className="text-sm text-slate-700 dark:text-neutral-200">This booking is closed ({req.status.replace(/_/g, ' ').toLowerCase()}). It can’t be checked again.</p>
              </div>
            )}
            {req.checks.length > 0 && (
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
                <History className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
                <div className="min-w-0 text-sm text-amber-900 dark:text-amber-200">
                  <p className="font-semibold">Already checked {req.checks.length === 1 ? 'once' : `${req.checks.length} times`}</p>
                  <ul className="mt-1 space-y-1">
                    {req.checks.slice(0, 3).map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span>
                          {c.partnerName} · {new Date(c.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {formatINR(c.finalAmount)}
                        </span>
                        <OutcomeBadge outcome={c.outcome} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <section className="surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Customer</p>
              <p className="mt-1 text-lg font-bold text-ink dark:text-white">{req.customer.fullName || 'Customer'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {req.customer.phone && (
                  <a href={telHref(req.customer.phone)} className="btn-ghost !px-3.5 !py-2.5">
                    <Phone className="h-4 w-4" /> {prettyPhone(req.customer.phone)}
                  </a>
                )}
                {req.customer.alternatePhone && (
                  <a href={telHref(req.customer.alternatePhone)} className="btn-ghost !px-3.5 !py-2.5">
                    <Phone className="h-4 w-4" /> {prettyPhone(req.customer.alternatePhone)}
                  </a>
                )}
              </div>
              {address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 hover:bg-slate-100 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{address}</span>
                </a>
              )}
              {(req.scheduledPickupDate || req.preferredTimeWindow) && (
                <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">
                  Pickup: {[req.scheduledPickupDate ? formatPickupDate(req.scheduledPickupDate) : '', req.preferredTimeWindow].filter(Boolean).filter((v, i, all) => all.indexOf(v) === i).join(' · ')}
                </p>
              )}
            </section>

            <section className="surface p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-16 shrink-0 items-center justify-center">
                  <DeviceImage model={{ imageUrl: req.device.imageUrl, name: deviceName, slug: '' }} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-ink dark:text-white">{deviceName}</p>
                  <p className="text-sm text-slate-500 dark:text-neutral-400">{formatCapacity(req.device.storage || '')}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-neutral-900">
                <p className="text-xs text-slate-500 dark:text-neutral-400">Customer’s quote</p>
                <p className="text-3xl font-bold tracking-tight text-ink dark:text-white">{formatINR(req.quotedAmount)}</p>
                {req.pricing && <PriceRange pricing={req.pricing} />}
              </div>
            </section>

            <section className="surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">What the customer said</p>
              <div className="mt-2 space-y-2.5">
                {buildSummary(customerAnswers, modelName).map((g) => (
                  <div key={g.title}>
                    <p className="text-xs font-semibold text-ink dark:text-white">{g.title}</p>
                    <ul className="mt-0.5 space-y-0.5">
                      {g.items.map((item) => (
                        <li key={item} className="text-sm text-slate-600 dark:text-neutral-300">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {req.payout && (
              <section className="surface flex gap-3 p-4">
                <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <div className="text-sm text-slate-700 dark:text-neutral-200">
                  <p className="font-semibold">Payout: {PAYOUT_LABEL[req.payout.method] ?? req.payout.method}</p>
                  {req.payout.upiId && <p>UPI ID: {req.payout.upiId}</p>}
                  {req.payout.accountNumber && <p>{[req.payout.bankName, req.payout.accountNumber, req.payout.ifscCode].filter(Boolean).join(' · ')}</p>}
                </div>
              </section>
            )}

            {!req.closed && (
              <>
                <button type="button" onClick={() => setStep('check')} className="btn-genie w-full !py-4 !text-base">
                  <ClipboardCheck className="h-5 w-5" /> Start the check
                </button>
                <button
                  type="button"
                  onClick={() => { setSaveError(null); setReason(''); setDialog('NOT_BUYABLE'); }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/10"
                >
                  <Ban className="h-4 w-4" /> Can’t do this pickup
                </button>
              </>
            )}
          </>
        )}

        {step === 'check' && (
          <>
            <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-sm text-slate-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
              <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p>The customer’s answers are filled in. Check the phone and change only what’s different: the price updates with every change.</p>
            </div>

            {req.variants.length > 1 && (
              <Section title="Storage" subtitle="Check Settings → About phone." changed={storageChanged ? formatCapacity(req.device.storage || '') : null}>
                <div className="flex flex-wrap gap-2">
                  {req.variants.map((v) => (
                    <button key={v.id} type="button" onClick={() => setVariantId(v.id)} aria-pressed={variantId === v.id} className={`chip !px-4 !py-2.5 ${variantId === v.id ? 'chip-selected' : ''}`}>
                      {formatCapacity(v.capacity)}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {SCREENING_QUESTIONS.filter((q) => {
              if (q.key === 'isPhoneWorking') return true;
              if (answers.isPhoneWorking !== true) return false;
              if (q.key === 'isTouchscreenWorking') return true;
              if (answers.isTouchscreenWorking !== true) return false;
              if (q.key === 'isDisplayOriginal') return true;
              return answers.isDisplayOriginal === true;
            }).map((q) => (
              <Section
                key={q.key}
                title={q.question}
                subtitle={q.helper}
                changed={customerAnswers[q.key] !== answers[q.key] ? (customerAnswers[q.key] === null ? 'Not asked' : customerAnswers[q.key] ? 'Yes' : 'No') : null}
              >
                <YesNo value={answers[q.key]} onChange={(v) => setScreening(q.key, v)} />
              </Section>
            ))}

            {answers.isPhoneWorking !== false && (
              <>
                {visiblePhysicalSections(answers).map((s) => {
                  const said = customerAnswers[s.key];
                  const changed = said !== answers[s.key] ? s.options.find((o) => o.id === said)?.label ?? 'Not asked' : null;
                  return (
                    <Section key={s.key} title={s.title} subtitle={s.subtitle} changed={changed}>
                      <div className="grid grid-cols-2 gap-2.5">
                        {s.options.map((o) => (
                          <OptionCard
                            key={o.id}
                            selected={answers[s.key] === o.id}
                            onClick={() => set(s.key, o.id)}
                            art={<ConditionArt kind={o.art} className="h-full w-auto" />}
                            label={o.label}
                            hint={o.hint}
                          />
                        ))}
                      </div>
                    </Section>
                  );
                })}

                <Section title="Functional issues" subtitle="Tap every problem you find. Leave all off if the phone works fine.">
                  <div className="space-y-2">
                    {functionalIssuesFor(modelName).map((f) => (
                      <ToggleRow
                        key={f.key}
                        on={Boolean(answers.hardwareFaults[f.key])}
                        label={f.label}
                        art={<ConditionArt kind={f.art} className="h-full w-auto" />}
                        changed={Boolean(customerAnswers.hardwareFaults[f.key]) !== Boolean(answers.hardwareFaults[f.key])}
                        onToggle={() => set('hardwareFaults', { ...answers.hardwareFaults, [f.key]: !answers.hardwareFaults[f.key] })}
                      />
                    ))}
                  </div>
                </Section>

                <Section title="Accessories handed over" subtitle="Only what the customer gives you now.">
                  <div className="space-y-2">
                    {accessoriesFor(answers).map((acc) => (
                      <ToggleRow
                        key={acc.key}
                        on={Boolean(answers[acc.key])}
                        label={acc.label}
                        art={<ConditionArt kind={acc.art} className="h-full w-auto" />}
                        changed={Boolean(customerAnswers[acc.key]) !== Boolean(answers[acc.key])}
                        onToggle={() => set(acc.key, !answers[acc.key])}
                      />
                    ))}
                  </div>
                </Section>

                {underWarranty(answers) && (
                  <Section
                    title="Device age (from the bill)"
                    subtitle="Below 11 months needs the bill with the same IMEI."
                    changed={customerAnswers.deviceAge !== answers.deviceAge ? DEVICE_AGE_OPTIONS.find((o) => o.id === customerAnswers.deviceAge)?.label ?? 'Not asked' : null}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {DEVICE_AGE_OPTIONS.map((o) => (
                        <button key={o.id} type="button" onClick={() => set('deviceAge', o.id)} aria-pressed={answers.deviceAge === o.id} className={`chip !px-3 !py-2.5 ${answers.deviceAge === o.id ? 'chip-selected' : ''}`}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                    {needsAge && <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">Choose the device age to continue.</p>}
                  </Section>
                )}
              </>
            )}
            {PriceBar}
          </>
        )}

        {step === 'review' && pricing && (
          <>
            <section className="surface p-5 text-center">
              <p className="text-sm text-slate-500 dark:text-neutral-400">Show this to the customer</p>
              <p className="mt-1 text-sm font-semibold text-ink dark:text-white">{deviceName} · {formatCapacity(storageOf(variantId))}</p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-ink dark:text-white">{formatINR(pricing.finalAmount)}</p>
              {pricing.difference !== 0 ? (
                <p className="mt-1 text-sm">
                  <span className="text-slate-400 line-through">{formatINR(pricing.quotedAmount)}</span>{' '}
                  <span className={`font-semibold ${pricing.difference < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>{signedINR(pricing.difference)}</span>
                </p>
              ) : (
                <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">Same as the quote</p>
              )}
            </section>

            {(diffs.length > 0 || storageChanged) && (
              <section className="surface p-4">
                <h3 className="text-base font-semibold text-ink dark:text-white">What’s different from the booking</h3>
                <ul className="mt-3 space-y-2.5">
                  {storageChanged && (
                    <li className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-neutral-900">
                      <p className="font-semibold text-ink dark:text-white">Storage</p>
                      <p className="mt-0.5 text-slate-600 dark:text-neutral-300">
                        Customer said <b>{formatCapacity(req.device.storage || '')}</b> · found <b>{formatCapacity(storageOf(variantId))}</b>
                      </p>
                    </li>
                  )}
                  {diffs.map((d) => (
                    <li key={d.question} className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-neutral-900">
                      <p className="font-semibold text-ink dark:text-white">{d.question}</p>
                      <p className="mt-0.5 text-slate-600 dark:text-neutral-300">
                        Customer said <b>{d.customer}</b> · found <b>{d.partner}</b>
                      </p>
                    </li>
                  ))}
                </ul>
                {pricing.changes.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3 dark:border-neutral-900">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Price effect</p>
                    <ul className="mt-2 space-y-1">
                      {pricing.changes.map((c) => (
                        <li key={c.component} className="flex justify-between gap-3 text-sm">
                          <span className="text-slate-600 dark:text-neutral-300">{c.component}</span>
                          <span className={`shrink-0 font-semibold ${c.difference < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>{signedINR(c.difference)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <section className="surface space-y-4 p-4">
              <label className="block">
                <span className="text-sm font-semibold text-ink dark:text-white">IMEI or serial number <span className="font-normal text-slate-400">(optional)</span></span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-neutral-400">Dial *#06# on the phone.</span>
                <input
                  value={imei}
                  onChange={(e) => setImei(e.target.value.toUpperCase().slice(0, 24))}
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-1.5 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-base outline-none focus:border-ink focus:ring-4 focus:ring-slate-200/60 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-amber-400 dark:focus:ring-amber-400/20"
                />
              </label>

              <div>
                <span className="text-sm font-semibold text-ink dark:text-white">Photos <span className="font-normal text-slate-400">(optional, up to 6)</span></span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-neutral-400">Front, back, and any damage you found.</span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {photos.map((url) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-neutral-900">
                      <img src={url} alt="Device photo" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: uploading }).map((_, i) => (
                    <div key={`up-${i}`} className="flex aspect-square items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-neutral-900">
                      <Spinner />
                    </div>
                  ))}
                  {photos.length + uploading < 6 && (
                    <button
                      type="button"
                      onClick={() => photoInput.current?.click()}
                      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-slate-400 dark:border-neutral-700 dark:text-neutral-400"
                    >
                      <Camera className="h-5 w-5" /> Add
                    </button>
                  )}
                </div>
                <input ref={photoInput} type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} />
                {photoError && <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{photoError}</p>}
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-ink dark:text-white">Notes for the Genie team <span className="font-normal text-slate-400">(optional)</span></span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  rows={3}
                  placeholder="e.g. Crack on the top left corner of the screen"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-ink focus:ring-4 focus:ring-slate-200/60 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-amber-400 dark:focus:ring-amber-400/20"
                />
              </label>
            </section>

            <section className="space-y-2.5">
              <button type="button" disabled={!priceReady || uploading > 0} onClick={() => { setSaveError(null); setDialog('AGREED'); }} className="btn-genie w-full !py-4 !text-base">
                <CheckCircle2 className="h-5 w-5" /> Customer agrees · {formatINR(pricing.finalAmount)}
              </button>
              <button type="button" disabled={!priceReady || uploading > 0} onClick={() => { setSaveError(null); setDialog('DECLINED'); }} className="btn-ghost w-full">
                <X className="h-4 w-4" /> Customer declines this price
              </button>
              <button type="button" disabled={uploading > 0} onClick={() => { setSaveError(null); setReason(''); setDialog('NOT_BUYABLE'); }} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/10">
                <Ban className="h-4 w-4" /> Can’t buy this device
              </button>
              {uploading > 0 && <p className="text-center text-xs text-slate-500">Waiting for photos to upload…</p>}
            </section>
          </>
        )}

        {step === 'done' && saved && (
          <section className="surface p-6 text-center">
            <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${saved.outcome === 'AGREED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-neutral-900 dark:text-neutral-300'}`}>
              {saved.outcome === 'AGREED' ? <CheckCircle2 className="h-8 w-8" /> : saved.outcome === 'DECLINED' ? <X className="h-8 w-8" /> : <Ban className="h-8 w-8" />}
            </span>
            <h2 className="mt-4 text-xl font-bold text-ink dark:text-white">
              {saved.outcome === 'AGREED' ? `Bought for ${formatINR(saved.finalAmount)}` : saved.outcome === 'DECLINED' ? 'Customer declined' : 'Not bought'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
              Saved to {req.requestNumber}. The Genie team can see it now{saved.difference < 0 ? ', including the lower price and why' : ''}.
            </p>
            {saved.outcome === 'AGREED' && req.payout && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-700 dark:bg-neutral-900 dark:text-neutral-200">
                <p className="font-semibold">Pay the customer: {PAYOUT_LABEL[req.payout.method] ?? req.payout.method}</p>
                {req.payout.upiId && <p>UPI ID: {req.payout.upiId}</p>}
                {req.payout.accountNumber && <p>{[req.payout.bankName, req.payout.accountNumber, req.payout.ifscCode].filter(Boolean).join(' · ')}</p>}
              </div>
            )}
            <Link to="/partner" className="btn-genie mt-6 w-full">Check another device</Link>
          </section>
        )}
      </main>

      <Dialog open={dialog === 'AGREED'} title="Customer agrees to sell?" onClose={() => setDialog(null)}>
        <p className="text-sm text-slate-600 dark:text-neutral-300">
          The customer agrees to sell the {deviceName} for <b className="text-ink dark:text-white">{pricing ? formatINR(pricing.finalAmount) : ''}</b>
          {pricing && pricing.difference !== 0 ? ` (quote was ${formatINR(pricing.quotedAmount)})` : ''}.
        </p>
        {saveError && <div className="mt-3"><ErrorNote>{saveError}</ErrorNote></div>}
        <button type="button" disabled={saving} onClick={() => save('AGREED')} className="btn-genie mt-5 w-full !py-4">
          {saving ? <Spinner /> : 'Yes, save'}
        </button>
      </Dialog>

      <Dialog open={dialog === 'DECLINED'} title="Customer declines the price?" onClose={() => setDialog(null)}>
        <p className="text-sm text-slate-600 dark:text-neutral-300">The device stays with the customer. Your check is saved so the Genie team can follow up.</p>
        {saveError && <div className="mt-3"><ErrorNote>{saveError}</ErrorNote></div>}
        <button type="button" disabled={saving} onClick={() => save('DECLINED')} className="btn-genie mt-5 w-full !py-4">
          {saving ? <Spinner /> : 'Save: customer declined'}
        </button>
      </Dialog>

      <Dialog open={dialog === 'NOT_BUYABLE'} title="Why can’t it be bought?" onClose={() => setDialog(null)}>
        <div className="space-y-2">
          {req.notBuyableReasons.map((r) => (
            <button key={r} type="button" onClick={() => setReason(r)} aria-pressed={reason === r} className={`chip w-full !justify-start !text-left ${reason === r ? 'chip-selected' : ''}`}>
              {r}
            </button>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink dark:text-white">
            What happened {reason === 'Other' ? '' : <span className="font-normal text-slate-400">(optional)</span>}
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            rows={2}
            className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-ink focus:ring-4 focus:ring-slate-200/60 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-amber-400 dark:focus:ring-amber-400/20"
          />
        </label>
        {reason === 'Other' && !notes.trim() && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" /> Write what happened to save.
          </p>
        )}
        {saveError && <div className="mt-3"><ErrorNote>{saveError}</ErrorNote></div>}
        <button type="button" disabled={saving || !reason || (reason === 'Other' && !notes.trim())} onClick={() => save('NOT_BUYABLE')} className="btn-genie mt-5 w-full !py-4">
          {saving ? <Spinner /> : 'Save'}
        </button>
      </Dialog>
    </div>
  );
};

export default CheckPage;
