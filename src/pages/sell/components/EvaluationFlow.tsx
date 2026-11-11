import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Loader2, X } from 'lucide-react';
import { ConditionArt } from '../../../components/sell/ConditionArt';
import { DeviceVariant, SmartphoneModel } from '../../../types';
import {
  ACCESSORIES,
  DEVICE_AGE_OPTIONS,
  EVAL_TABS,
  EvalTabId,
  EvaluationAnswers,
  FUNCTIONAL_ISSUES,
  SCREENING_QUESTIONS,
  applicableTabs,
  buildSummary,
  isTabComplete,
  visiblePhysicalSections,
} from '../evaluation';
import { DeviceImage, OptionCard, formatCapacity, formatINR, fullDeviceName } from './shared';

interface EvaluationFlowProps {
  brandName?: string;
  model: SmartphoneModel;
  variant: DeviceVariant;
  answers: EvaluationAnswers;
  onChange: (next: EvaluationAnswers) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

const YesNo: React.FC<{ value: boolean | null; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div className="grid grid-cols-2 gap-3">
    {[true, false].map((v) => (
      <button
        key={String(v)}
        type="button"
        onClick={() => onChange(v)}
        aria-pressed={value === v}
        className={`chip h-12 ${value === v ? 'chip-selected' : ''}`}
      >
        {v ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <X className="h-4 w-4" strokeWidth={2.6} />}
        {v ? 'Yes' : 'No'}
      </button>
    ))}
  </div>
);

const Notice: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 animate-fade-in dark:border-amber-400/20 dark:bg-amber-400/10">
    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
    <div>
      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">{children}</p>
    </div>
  </div>
);

const SectionHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-ink dark:text-white sm:text-xl">{title}</h2>
    {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-neutral-400">{subtitle}</p>}
  </div>
);

export const EvaluationSummary: React.FC<{
  brandName?: string;
  model: SmartphoneModel;
  variant: DeviceVariant;
  answers: EvaluationAnswers;
}> = ({ brandName, model, variant, answers }) => {
  const groups = buildSummary(answers);
  return (
    <div>
      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Device evaluation</p>
      <h3 className="mt-1 text-xl font-semibold text-ink dark:text-white">Summary</h3>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f6f5fa] p-3 dark:bg-neutral-900">
        <span className="flex h-14 w-12 shrink-0 items-center justify-center">
          <DeviceImage model={model} className="h-full w-full" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink dark:text-white">{fullDeviceName(brandName, model.name)}</p>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            {formatCapacity(variant.capacity)} · Up to {formatINR(variant.price ?? model.basePrice)}
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="mt-5 text-sm text-slate-400 dark:text-neutral-500">Your answers will appear here.</p>
      ) : (
        <div className="mt-5 space-y-5">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-200">{g.title} :</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600 marker:text-slate-400 dark:text-neutral-400">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EvaluationFlow: React.FC<EvaluationFlowProps> = ({
  brandName,
  model,
  variant,
  answers,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const tabs = applicableTabs(answers);
  const [active, setActive] = useState<EvalTabId>('overall');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // If the gatekeeper answer removes the active tab, fall back to the first one
  useEffect(() => {
    if (!tabs.includes(active)) setActive('overall');
  }, [tabs.join(','), active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the active tab visible in the horizontally scrolling tab bar on phones
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => {
    tabRefs.current[active]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  const activeIndex = tabs.indexOf(active);
  const isLast = activeIndex === tabs.length - 1;
  const canContinue = isTabComplete(active, answers);
  const progress = useMemo(() => {
    const done = tabs.filter((t) => isTabComplete(t, answers)).length;
    return Math.round(((done + (canContinue ? 0 : 0.35)) / tabs.length) * 100);
  }, [tabs, answers, canContinue]);

  const set = <K extends keyof EvaluationAnswers>(key: K, value: EvaluationAnswers[K]) =>
    onChange({ ...answers, [key]: value });

  const goTo = (tab: EvalTabId) => {
    setActive(tab);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const next = () => {
    if (!canContinue) return;
    if (isLast) onSubmit();
    else goTo(tabs[activeIndex + 1]);
  };

  const prev = () => {
    if (activeIndex <= 0) onBack();
    else goTo(tabs[activeIndex - 1]);
  };

  const pickPhysical = (key: keyof EvaluationAnswers, value: string) => {
    const nextAnswers = { ...answers, [key]: value };
    onChange(nextAnswers);
    // Glide to the next unanswered section
    const sections = visiblePhysicalSections(nextAnswers);
    const nextSection = sections.find((s) => nextAnswers[s.key] === null);
    if (nextSection) {
      setTimeout(() => sectionRefs.current[nextSection.key]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    }
  };

  const setScreening = (key: (typeof SCREENING_QUESTIONS)[number]['key'], value: boolean) => {
    const nextAnswers = { ...answers, [key]: value };
    // Changing a gatekeeper answer resets the questions that depend on it
    if (key === 'isPhoneWorking') {
      nextAnswers.isTouchscreenWorking = null;
      nextAnswers.isDisplayOriginal = null;
      nextAnswers.hasValidWarranty = null;
    }
    if (key === 'isTouchscreenWorking') {
      nextAnswers.isDisplayOriginal = null;
      nextAnswers.hasValidWarranty = null;
      if (value === false) {
        nextAnswers.screenDisplayCondition = null;
        nextAnswers.touchGlassCondition = null;
      }
    }
    if (key === 'hasValidWarranty' && value === false) nextAnswers.deviceAge = null;
    onChange(nextAnswers);
  };

  const visibleScreening = SCREENING_QUESTIONS.filter((q) => {
    if (q.key === 'isPhoneWorking') return true;
    if (q.key === 'isTouchscreenWorking') return answers.isPhoneWorking === true;
    return answers.isPhoneWorking === true && answers.isTouchscreenWorking === true;
  });

  const continueLabel = isLast
    ? 'Get exact value'
    : active === 'functional' && !Object.values(answers.hardwareFaults).some(Boolean)
      ? 'No issues, continue'
      : 'Continue';

  return (
    <div ref={topRef} className="scroll-mt-28 animate-fade-in">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="min-w-0">
          {/* Tabs */}
          <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <nav className="flex min-w-max items-center gap-1 border-b border-slate-200 dark:border-neutral-800" aria-label="Evaluation steps">
              {tabs.map((t, i) => {
                const meta = EVAL_TABS.find((x) => x.id === t)!;
                const isActive = t === active;
                const reachable = i <= activeIndex || tabs.slice(0, i).every((p) => isTabComplete(p, answers));
                return (
                  <React.Fragment key={t}>
                    {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-neutral-700" aria-hidden="true" />}
                    <button
                      ref={(el) => (tabRefs.current[t] = el)}
                      type="button"
                      disabled={!reachable}
                      onClick={() => goTo(t)}
                      aria-current={isActive ? 'step' : undefined}
                      className={`relative whitespace-nowrap px-2 py-3.5 text-[15px] transition-colors sm:px-3 sm:text-base ${
                        isActive
                          ? 'font-semibold text-ink dark:text-white'
                          : reachable
                            ? 'text-slate-500 hover:text-ink dark:text-neutral-400 dark:hover:text-white'
                            : 'cursor-not-allowed text-slate-400 dark:text-neutral-600'
                      }`}
                    >
                      {meta.label}
                      {isActive && <span className="absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-amber-400" />}
                    </button>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-900" aria-hidden="true">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500" style={{ width: `${Math.max(6, progress)}%` }} />
          </div>

          <div className="mt-6 space-y-8 pb-28 lg:pb-0">
            {/* ---------- Overall condition ---------- */}
            {active === 'overall' && (
              <div className="space-y-4">
                <SectionHeading title="Tell us about your phone" subtitle="Answer a few quick questions about its overall condition." />
                {visibleScreening.map((q, idx) => (
                  <div key={q.key} className="surface p-5 animate-fade-in sm:p-6">
                    <p className="text-[15px] font-semibold text-ink dark:text-white">
                      {idx + 1}. {q.question}
                    </p>
                    <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-neutral-400">{q.helper}</p>
                    <YesNo value={answers[q.key]} onChange={(v) => setScreening(q.key, v)} />
                  </div>
                ))}
                {answers.isPhoneWorking === false && (
                  <Notice title="Phone doesn't switch on">
                    No problem, we still buy it. Its value is based on parts, plus a bonus for any original accessories you include.
                  </Notice>
                )}
                {answers.isPhoneWorking === true && answers.isTouchscreenWorking === false && (
                  <Notice title="Touchscreen not working">
                    We'll price it for a display replacement. Next, tell us about the body condition.
                  </Notice>
                )}
              </div>
            )}

            {/* ---------- Physical condition ---------- */}
            {active === 'physical' &&
              visiblePhysicalSections(answers).map((section) => (
                <div key={section.key} ref={(el) => (sectionRefs.current[section.key] = el)} className="scroll-mt-32">
                  <SectionHeading title={section.title} subtitle={section.subtitle} />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    {section.options.map((opt) => (
                      <OptionCard
                        key={opt.id}
                        selected={answers[section.key] === opt.id}
                        onClick={() => pickPhysical(section.key, opt.id)}
                        art={<ConditionArt kind={opt.art} className="h-full w-auto" />}
                        label={opt.label}
                        hint={opt.hint}
                      />
                    ))}
                  </div>
                </div>
              ))}

            {/* ---------- Functional & accessories ---------- */}
            {active === 'functional' && (
              <>
                {answers.isPhoneWorking !== false && (
                  <div>
                    <SectionHeading title="Select all issues identified in your phone" subtitle="Skip this if everything works fine." />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                      {FUNCTIONAL_ISSUES.map((issue) => (
                        <OptionCard
                          key={issue.key}
                          multi
                          selected={Boolean(answers.hardwareFaults[issue.key])}
                          onClick={() =>
                            set('hardwareFaults', { ...answers.hardwareFaults, [issue.key]: !answers.hardwareFaults[issue.key] })
                          }
                          art={<ConditionArt kind={issue.art} className="h-full w-auto" />}
                          label={issue.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <SectionHeading title="Original accessories you have" subtitle="Each one adds a little to your price." />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    {ACCESSORIES.map((acc) => (
                      <OptionCard
                        key={acc.key}
                        multi
                        selected={answers[acc.key]}
                        onClick={() => set(acc.key, !answers[acc.key])}
                        art={<ConditionArt kind={acc.art} className="h-full w-auto" />}
                        label={acc.label}
                        hint={acc.hint}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ---------- Warranty condition ---------- */}
            {active === 'warranty' && (
              <>
                <div className="surface p-5 sm:p-6">
                  <div className="flex gap-4">
                    <span className="hidden h-24 w-28 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-[#f4f4f6] dark:bg-neutral-900 sm:flex">
                      <ConditionArt kind="bill" className="h-full w-auto" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-ink dark:text-white">
                        Do you have the original bill with the same IMEI?
                      </p>
                      <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-neutral-400">
                        A valid purchase invoice gets you a noticeably better price.
                      </p>
                      <YesNo value={answers.hasValidBill} onChange={(v) => set('hasValidBill', v)} />
                    </div>
                  </div>
                </div>

                {answers.hasValidWarranty === true && (
                  <div className="surface p-5 animate-fade-in sm:p-6">
                    <p className="text-[15px] font-semibold text-ink dark:text-white">How old is your phone?</p>
                    <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-neutral-400">Count from the purchase date on your bill.</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {DEVICE_AGE_OPTIONS.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => set('deviceAge', o.id)}
                          aria-pressed={answers.deviceAge === o.id}
                          className={`chip h-12 !px-3 ${answers.deviceAge === o.id ? 'chip-selected' : ''}`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {submitError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" role="alert">
                    {submitError}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Actions — inline on desktop, sticky bar on phones */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur-md safe-area-bottom dark:border-neutral-900 dark:bg-black/90 lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none dark:lg:bg-transparent">
            {/* Mobile summary drawer */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setSummaryOpen((o) => !o)}
                className="mb-2 flex w-full items-center justify-between text-xs font-semibold text-slate-600 dark:text-neutral-300"
                aria-expanded={summaryOpen}
              >
                <span>
                  {fullDeviceName(brandName, model.name)} · {formatCapacity(variant.capacity)}
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  Summary <ChevronDown className={`h-4 w-4 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>
              {summaryOpen && (
                <div className="mb-3 max-h-[45vh] overflow-y-auto rounded-2xl border border-slate-200 p-4 dark:border-neutral-800">
                  <EvaluationSummary brandName={brandName} model={model} variant={variant} answers={answers} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pb-1">
              <button type="button" onClick={prev} className="btn-ghost !px-4 sm:!px-5" aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button type="button" onClick={next} disabled={!canContinue || isSubmitting} className="btn-genie flex-1 lg:flex-none lg:min-w-[240px]">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{continueLabel} <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop summary */}
        <aside className="hidden lg:block">
          <div className="surface sticky top-28 p-6">
            <EvaluationSummary brandName={brandName} model={model} variant={variant} answers={answers} />
          </div>
        </aside>
      </div>
    </div>
  );
};
