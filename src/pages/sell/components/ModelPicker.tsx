import React, { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { Brand, SmartphoneModel } from '../../../types';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { DeviceImage, formatINR } from './shared';

interface ModelPickerProps {
  brand: Brand;
  models: SmartphoneModel[];
  isLoading: boolean;
  onSelect: (model: SmartphoneModel) => void;
}

export const ModelPicker: React.FC<ModelPickerProps> = ({ brand, models, isLoading, onSelect }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? models.filter((m) => m.name.toLowerCase().includes(q)) : models;
  }, [models, query]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="logo-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 p-2.5 dark:border-neutral-800">
            <BrandLogo name={brand.name} slug={brand.slug} logoUrl={brand.logoUrl} className="h-full w-full" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">Sell your {brand.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-neutral-400">
              {isLoading ? 'Loading models…' : `${models.length} models · prices for top condition`}
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${brand.name} model`}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-ink outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[236px] animate-pulse rounded-3xl bg-slate-100 dark:bg-neutral-900" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-neutral-800">
          <SearchX className="h-8 w-8 text-slate-300 dark:text-neutral-600" />
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            {models.length === 0 ? `No ${brand.name} models are listed yet.` : `No model matches “${query}”.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filtered.map((m) => {
            const upTo = m.maxPrice ?? m.basePrice;
            return (
              <button
                key={m._id}
                type="button"
                onClick={() => onSelect(m)}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
              >
                <span className="flex h-36 items-center justify-center bg-[#f6f5fa] p-4 dark:bg-neutral-900 sm:h-40">
                  <DeviceImage model={m} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
                </span>
                <span className="flex flex-1 flex-col justify-between gap-2 p-3.5 sm:p-4">
                  <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink dark:text-white sm:text-sm">
                    {m.name}
                  </span>
                  {upTo > 0 && (
                    <span>
                      <span className="block text-[11px] text-slate-500 dark:text-neutral-400">Get up to</span>
                      <span className="block text-base font-bold tracking-tight text-ink dark:text-white sm:text-lg">
                        {formatINR(upTo)}
                      </span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
