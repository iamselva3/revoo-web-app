import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Brand } from '../../../types';
import { BrandLogo } from '../../../components/brand/BrandLogo';

export const SELL_CATEGORIES = [
  { id: 'phone', label: 'Phone' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'tv', label: 'Smart TV' },
] as const;

export const CATEGORY_NOUN: Record<string, string> = {
  phone: 'phone',
  laptop: 'laptop',
  tablet: 'tablet',
  tv: 'TV',
};

interface BrandPickerProps {
  brands: Brand[];
  isLoading: boolean;
  category: string;
  onCategoryChange: (category: string) => void;
  onSelect: (brand: Brand) => void;
}

export const BrandPicker: React.FC<BrandPickerProps> = ({ brands, isLoading, category, onCategoryChange, onSelect }) => {
  const [query, setQuery] = useState('');
  const noun = CATEGORY_NOUN[category] || 'device';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? brands.filter((b) => b.name.toLowerCase().includes(q)) : brands;
  }, [brands, query]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-3xl">
            Sell your old {noun}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">Select the brand to see your model and its price.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand"
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-ink outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          />
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {SELL_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onCategoryChange(c.id)}
            className={`chip shrink-0 !rounded-full !px-4 !py-2 ${category === c.id ? 'chip-selected' : ''}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[108px] animate-pulse rounded-3xl bg-slate-100 dark:bg-neutral-900" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-neutral-800 dark:text-neutral-400">
          No brand matches “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {filtered.map((b) => (
            <button
              key={b._id}
              type="button"
              onClick={() => onSelect(b)}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-center transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
            >
              <span className="logo-tile flex h-[72px] items-center justify-center px-4 sm:h-20">
                <BrandLogo name={b.name} slug={b.slug} logoUrl={b.logoUrl} className="h-8 w-full max-w-[96px] sm:h-9" />
              </span>
              <span className="border-t border-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 dark:border-neutral-900 dark:text-neutral-200">
                {b.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
