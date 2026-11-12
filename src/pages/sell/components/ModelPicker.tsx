import React, { useEffect, useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import { Brand, SmartphoneModel } from '../../../types';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { DeviceImage, formatINR } from './shared';
import { buildSeries, seriesOf } from '../series';

interface ModelPickerProps {
  brand: Brand;
  models: SmartphoneModel[];
  isLoading: boolean;
  onSelect: (model: SmartphoneModel) => void;
}

const ALL = 'all';

/** Letters and digits only, so "s24ultra", "S24 Ultra" and "iphone16" all match. */
const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Filters survive a trip to a model page and back (per brand, this tab only). */
const storageKey = (brandId: string) => `genie_model_filter_${brandId}`;
const readFilter = (brandId: string): { query: string; series: string } => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey(brandId)) || 'null');
    if (saved && typeof saved.query === 'string' && typeof saved.series === 'string') return saved;
  } catch {
    /* storage unavailable: start fresh */
  }
  return { query: '', series: ALL };
};

export const ModelPicker: React.FC<ModelPickerProps> = ({ brand, models, isLoading, onSelect }) => {
  const [query, setQuery] = useState(() => readFilter(brand._id).query);
  const [series, setSeries] = useState(() => readFilter(brand._id).series);

  // A different brand starts from its own saved (or empty) filters
  useEffect(() => {
    const saved = readFilter(brand._id);
    setQuery(saved.query);
    setSeries(saved.series);
  }, [brand._id]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(brand._id), JSON.stringify({ query, series }));
    } catch {
      /* ignore */
    }
  }, [brand._id, query, series]);

  const seriesList = useMemo(() => buildSeries(models, brand.name), [models, brand.name]);
  const activeSeries = seriesList.some((s) => s.id === series) ? series : ALL;

  const filtered = useMemo(() => {
    const words = query.trim().split(/\s+/).map(compact).filter(Boolean);
    return models.filter((m) => {
      if (activeSeries !== ALL && seriesOf(m.name, brand.name).id !== activeSeries) return false;
      if (!words.length) return true;
      const name = compact(m.name);
      return words.every((w) => name.includes(w));
    });
  }, [models, brand.name, activeSeries, query]);

  const hasFilter = query.trim() !== '' || activeSeries !== ALL;
  const clearFilters = () => {
    setQuery('');
    setSeries(ALL);
  };

  const chipClass = (selected: boolean) =>
    `chip shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] ${selected ? 'chip-selected' : ''}`;

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center gap-4">
        <span className="logo-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 p-2.5 dark:border-neutral-800">
          <BrandLogo name={brand.name} slug={brand.slug} logoUrl={brand.logoUrl} className="h-full w-full" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">Sell your {brand.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-neutral-400">
            Select your {brand.name} model to see its price.
          </p>
        </div>
      </div>

      <div className="relative w-full sm:max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a model"
          aria-label={`Search ${brand.name} models`}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-neutral-500 dark:hover:bg-neutral-900 dark:hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isLoading && seriesList.length > 1 && (
        <div className="mt-5">
          <p className="mb-2.5 text-sm font-semibold text-ink dark:text-white">Choose by series</p>
          <div
            role="group"
            aria-label="Choose by series"
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          >
            <button type="button" aria-pressed={activeSeries === ALL} onClick={() => setSeries(ALL)} className={chipClass(activeSeries === ALL)}>
              All
            </button>
            {seriesList.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={activeSeries === s.id}
                onClick={() => setSeries(s.id)}
                className={chipClass(activeSeries === s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 mt-6 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-neutral-400">
        <span>
          {isLoading
            ? 'Loading models…'
            : hasFilter
              ? `${filtered.length} of ${models.length} models`
              : `${models.length} models · prices for top condition`}
        </span>
        {hasFilter && !isLoading && (
          <button type="button" onClick={clearFilters} className="font-semibold text-ink underline-offset-2 hover:underline dark:text-amber-400">
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[236px] animate-pulse rounded-3xl bg-slate-100 dark:bg-neutral-900" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-neutral-800">
          <SearchX className="h-8 w-8 text-slate-300 dark:text-neutral-600" />
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            {models.length === 0
              ? `No ${brand.name} models are listed yet.`
              : query.trim()
                ? `No model matches “${query.trim()}”${activeSeries !== ALL ? ' in this series' : ''}.`
                : 'No models in this series yet.'}
          </p>
          {hasFilter && (
            <button type="button" onClick={clearFilters} className="btn-ghost px-4 py-2 text-sm">
              Show all {brand.name} models
            </button>
          )}
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
