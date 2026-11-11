import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { resolveImageUrl } from '../../../api/client';
import { ConditionArt } from '../../../components/sell/ConditionArt';
import { SmartphoneModel } from '../../../types';

export const formatINR = (value: number | undefined | null) =>
  `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

/** "256GB" → "256 GB", "8GB / 128GB" → "8 GB / 128 GB" */
export const formatCapacity = (capacity: string) =>
  capacity.replace(/(\d)\s*(GB|TB)\b/gi, (_m, d, unit) => `${d} ${unit.toUpperCase()}`).trim();

/** Avoids "Apple Apple iPhone 16" when the model name already carries the brand. */
export const fullDeviceName = (brandName: string | undefined, modelName: string) => {
  if (!brandName) return modelName;
  return modelName.toLowerCase().startsWith(brandName.toLowerCase()) ? modelName : `${brandName} ${modelName}`;
};

/** Smoothly animates a number towards its target (used for the "Get up to" price). */
export const useAnimatedNumber = (target: number, durationMs = 450) => {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    if (prefersReduced || from === target) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = target;
    };
  }, [target, durationMs]);

  return value;
};

export const DeviceImage: React.FC<{ model: Pick<SmartphoneModel, 'imageUrl' | 'slug' | 'name'>; className?: string }> = ({
  model,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [model.imageUrl, model.slug]);

  // No image and no slug: show the neutral illustration rather than an unrelated stock phone
  if (failed || (!model.imageUrl && !model.slug)) {
    return <ConditionArt kind="back-clean" className={className} />;
  }
  return (
    <img
      src={resolveImageUrl(model.imageUrl, model.slug)}
      alt={model.name}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
};

/** Illustrated option card (turncash-style: picture on a soft panel, label underneath). */
export const OptionCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  art: React.ReactNode;
  label: string;
  hint?: string;
  multi?: boolean;
}> = ({ selected, onClick, art, label, hint, multi }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`group relative flex flex-col overflow-hidden rounded-3xl border text-left transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 ${
      selected
        ? 'border-ink shadow-soft ring-1 ring-ink dark:border-amber-400 dark:ring-amber-400'
        : 'border-slate-200 hover:border-slate-300 hover:shadow-soft dark:border-neutral-800 dark:hover:border-neutral-700'
    } bg-white dark:bg-neutral-950`}
  >
    <div className="flex h-28 items-end justify-center overflow-hidden bg-[#f4f4f6] dark:bg-neutral-900 sm:h-32">
      {art}
    </div>
    <div className="flex flex-1 items-start gap-2 px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-semibold leading-snug sm:text-sm ${selected ? 'text-ink dark:text-white' : 'text-slate-800 dark:text-neutral-100'}`}>
          {label}
        </p>
        {hint && <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-neutral-400">{hint}</p>}
      </div>
    </div>
    <span
      className={`absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border transition ${
        selected
          ? 'border-ink bg-ink text-white dark:border-amber-400 dark:bg-amber-400 dark:text-black'
          : `border-slate-300 bg-white/90 text-transparent dark:border-neutral-700 dark:bg-neutral-900 ${multi ? 'rounded-md' : ''}`
      }`}
      aria-hidden="true"
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  </button>
);
