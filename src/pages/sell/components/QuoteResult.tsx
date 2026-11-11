import React, { useState } from 'react';
import { ArrowRight, BadgeIndianRupee, ChevronDown, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { DeviceVariant, SmartphoneModel } from '../../../types';
import { DeviceImage, formatCapacity, formatINR, fullDeviceName, useAnimatedNumber } from './shared';

export interface QuoteLine {
  component: string;
  description?: string;
  adjustment: number;
}

interface QuoteResultProps {
  brandName?: string;
  model: SmartphoneModel;
  variant: DeviceVariant;
  quote: number;
  maxPrice: number;
  breakdown: QuoteLine[];
  onBook: () => void;
  onRecheck: () => void;
}

export const QuoteResult: React.FC<QuoteResultProps> = ({
  brandName,
  model,
  variant,
  quote,
  maxPrice,
  breakdown,
  onBook,
  onRecheck,
}) => {
  const animated = useAnimatedNumber(quote, 900);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const lines = breakdown.filter((l) => l.adjustment !== 0 && l.component !== 'Base Price');

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="surface overflow-hidden">
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-8">
          <div className="flex items-center justify-center rounded-3xl bg-[#f6f5fa] p-5 dark:bg-neutral-900">
            <DeviceImage model={model} className="h-36 w-full sm:h-40" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Your exact value</p>
            <h1 className="mt-1 text-lg font-semibold leading-snug text-ink dark:text-white sm:text-xl">
              {fullDeviceName(brandName, model.name)} ({formatCapacity(variant.capacity)})
            </h1>
            <p className="mt-3 text-5xl font-semibold tracking-tight text-ink dark:text-white" aria-live="polite">
              {formatINR(animated)}
            </p>
            {maxPrice > quote && (
              <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
                Based on your answers · up to {formatINR(maxPrice)} in top condition
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onBook} className="btn-genie !text-base sm:min-w-[230px]">
                Sell now · Book free pickup <ArrowRight className="h-5 w-5" />
              </button>
              <button type="button" onClick={onRecheck} className="btn-ghost">
                <RotateCcw className="h-4 w-4" /> Recheck answers
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-neutral-400">Free pickup · Paid before our agent leaves</p>
          </div>
        </div>

        {lines.length > 0 && (
          <div className="border-t border-slate-100 dark:border-neutral-900">
            <button
              type="button"
              onClick={() => setShowBreakdown((s) => !s)}
              className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-ink dark:text-white sm:px-8"
              aria-expanded={showBreakdown}
            >
              How we calculated your price
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
            </button>
            {showBreakdown && (
              <div className="px-6 pb-6 sm:px-8">
                <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-100 text-sm dark:divide-neutral-900 dark:border-neutral-900">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-slate-600 dark:text-neutral-300">Top-condition price</dt>
                    <dd className="font-semibold text-ink dark:text-white">{formatINR(maxPrice)}</dd>
                  </div>
                  {lines.map((l, i) => (
                    <div key={`${l.component}-${i}`} className="flex items-center justify-between gap-4 px-4 py-3">
                      <dt className="min-w-0">
                        <span className="block text-slate-700 dark:text-neutral-200">{l.component}</span>
                        {l.description && (
                          <span className="block truncate text-xs capitalize text-slate-400 dark:text-neutral-500">{l.description}</span>
                        )}
                      </dt>
                      <dd className={`shrink-0 font-semibold ${l.adjustment < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {l.adjustment < 0 ? '−' : '+'}
                        {formatINR(Math.abs(l.adjustment))}
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 bg-[#faf9fd] px-4 py-3 dark:bg-neutral-900">
                    <dt className="font-semibold text-ink dark:text-white">Your price</dt>
                    <dd className="font-bold text-ink dark:text-white">{formatINR(quote)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Truck, title: 'Free doorstep pickup', text: 'Pick a date and time slot' },
          { icon: BadgeIndianRupee, title: 'Paid on the spot', text: 'Before our agent leaves' },
          { icon: ShieldCheck, title: 'Data wiped safely', text: 'Certified erasure' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
            <Icon className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-ink dark:text-white">{title}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400 dark:text-neutral-500">
        Your price is confirmed after a quick 2-minute check at pickup. If everything matches your answers, this is what you get.
      </p>
    </div>
  );
};
