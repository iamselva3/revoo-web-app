import React from 'react';
import { ArrowRight, BadgeIndianRupee, ShieldCheck, Truck } from 'lucide-react';
import { DeviceVariant, SmartphoneModel } from '../../../types';
import { DeviceImage, formatCapacity, formatINR, fullDeviceName, useAnimatedNumber } from './shared';

interface VariantPickerProps {
  brandName?: string;
  model: SmartphoneModel;
  variants: DeviceVariant[];
  selected: DeviceVariant | null;
  maxPrice: number;
  isLoading: boolean;
  onSelect: (variant: DeviceVariant) => void;
  onContinue: () => void;
}

export const VariantPicker: React.FC<VariantPickerProps> = ({
  brandName,
  model,
  variants,
  selected,
  maxPrice,
  isLoading,
  onSelect,
  onContinue,
}) => {
  const price = selected?.price ?? maxPrice ?? model.basePrice;
  const animated = useAnimatedNumber(price || 0);
  const name = fullDeviceName(brandName, model.name);
  const title = selected ? `${name} (${formatCapacity(selected.capacity)})` : name;

  return (
    <div className="animate-fade-in">
      <div className="surface grid grid-cols-1 gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
        <div className="flex items-center justify-center rounded-3xl bg-[#f6f5fa] p-6 dark:bg-neutral-900 md:p-10">
          <DeviceImage model={model} className="h-48 w-full sm:h-64 md:h-72" />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-semibold leading-snug text-ink dark:text-white sm:text-2xl">{title}</h1>

          <p className="mt-4 text-sm text-slate-500 dark:text-neutral-400">Get up to</p>
          <p className="mt-0.5 text-4xl font-semibold tracking-tight text-ink dark:text-white sm:text-5xl" aria-live="polite">
            {isLoading ? <span className="inline-block h-12 w-56 animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-900" /> : formatINR(animated)}
          </p>

          <div className="mt-7">
            <p className="text-base font-semibold text-ink dark:text-white">Select your variant</p>
            {isLoading ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className="h-12 w-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-neutral-900" />
                ))}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2.5 sm:gap-3" role="radiogroup" aria-label="Variant">
                {variants.map((v) => {
                  const isSelected = selected?._id ? selected._id === v._id : selected?.capacity === v.capacity;
                  return (
                    <button
                      key={v._id || v.capacity}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onSelect(v)}
                      className={`chip min-w-[96px] ${isSelected ? 'chip-selected' : ''}`}
                    >
                      {formatCapacity(v.capacity)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onContinue}
            disabled={isLoading || !selected}
            className="btn-genie mt-8 w-full !text-base sm:w-auto sm:min-w-[260px] sm:self-start"
          >
            Check exact value <ArrowRight className="h-5 w-5" />
          </button>

          <p className="mt-4 text-sm text-slate-500 dark:text-neutral-400">Free pickup · Paid before our agent leaves</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Truck, title: 'Free doorstep pickup', text: 'At a time that suits you' },
          { icon: BadgeIndianRupee, title: 'Instant payment', text: 'UPI, bank transfer or cash' },
          { icon: ShieldCheck, title: 'Safe & secure', text: 'Certified data wipe' },
        ].map(({ icon: Icon, title: t, text }) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
            <Icon className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-ink dark:text-white">{t}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
