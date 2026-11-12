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

export const EXACT_PHONE_BRANDS: Array<{ name: string; slug: string; logoUrl: string }> = [
  { name: 'Apple', slug: 'apple', logoUrl: '/uploads/brands/apple.png' },
  { name: 'Samsung', slug: 'samsung', logoUrl: '/uploads/brands/samsung.png' },
  { name: 'OnePlus', slug: 'oneplus', logoUrl: '/uploads/brands/oneplus.png' },
  { name: 'Google', slug: 'google', logoUrl: '/uploads/brands/google.png' },
  { name: 'Oppo', slug: 'oppo', logoUrl: '/uploads/brands/oppo.png' },
  { name: 'Vivo', slug: 'vivo', logoUrl: '/uploads/brands/vivo.png' },
  { name: 'Xiaomi', slug: 'xiaomi', logoUrl: '/uploads/brands/xiaomi.png' },
  { name: 'Motorola', slug: 'motorola', logoUrl: '/uploads/brands/motorola.png' },
  { name: 'Realme', slug: 'realme', logoUrl: '/uploads/brands/realme.png' },
  { name: 'POCO', slug: 'poco', logoUrl: '/uploads/brands/poco.png' },
  { name: 'iQOO', slug: 'iqoo', logoUrl: '/uploads/brands/iqoo.png' },
  { name: 'Nothing', slug: 'nothing', logoUrl: '/uploads/brands/nothing.png' },
  { name: 'Infinix', slug: 'infinix', logoUrl: '/uploads/brands/infinix.png' },
  { name: 'Tecno', slug: 'tecno', logoUrl: '/uploads/brands/tecno.png' },
  { name: 'Nokia', slug: 'nokia', logoUrl: '/uploads/brands/nokia.png' },
  { name: 'Lava', slug: 'lava', logoUrl: '/uploads/brands/lava.png' },
  { name: 'Honor', slug: 'honor', logoUrl: '/uploads/brands/honor.png' },
  { name: 'Huawei', slug: 'huawei', logoUrl: '/uploads/brands/huawei.png' },
  { name: 'LG', slug: 'lg', logoUrl: '/uploads/brands/lg.png' },
  { name: 'Nubia', slug: 'nubia', logoUrl: '/uploads/brands/nubia.png' },
  { name: 'Asus', slug: 'asus', logoUrl: '/uploads/brands/asus.png' },
  { name: 'CMF', slug: 'cmf', logoUrl: '/uploads/brands/cmf.png' },
];

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

  // Arrange brands exactly according to the 22 priority placements, keeping any extra brands at the end
  const orderedBrands = useMemo(() => {
    if (category !== 'phone') {
      return brands;
    }

    const brandMap = new Map<string, Brand>();
    for (const b of brands) {
      brandMap.set(b.slug.toLowerCase(), b);
    }

    const priorityList: Brand[] = [];
    const usedSlugs = new Set<string>();

    for (const pb of EXACT_PHONE_BRANDS) {
      const existing = brandMap.get(pb.slug.toLowerCase());
      if (existing) {
        priorityList.push(existing);
        usedSlugs.add(existing.slug.toLowerCase());
      } else {
        // Fallback placeholder brand definition if not yet synced in backend
        const fallbackBrand: Brand = {
          _id: pb.slug,
          name: pb.name,
          slug: pb.slug,
          logoUrl: pb.logoUrl,
          isActive: true,
          displayOrder: priorityList.length + 1,
        };
        priorityList.push(fallbackBrand);
        usedSlugs.add(pb.slug.toLowerCase());
      }
    }

    // Append any extra brands at the end without deleting anything
    const extraList: Brand[] = [];
    for (const b of brands) {
      if (!usedSlugs.has(b.slug.toLowerCase())) {
        extraList.push(b);
      }
    }

    return [...priorityList, ...extraList];
  }, [brands, category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? orderedBrands.filter((b) => b.name.toLowerCase().includes(q)) : orderedBrands;
  }, [orderedBrands, query]);

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
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 sm:h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-neutral-900" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-neutral-800 dark:text-neutral-400">
          No brand matches “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((b) => (
            <button
              key={b._id}
              type="button"
              onClick={() => onSelect(b)}
              title={b.name}
              className="group flex h-24 sm:h-28 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <BrandLogo
                name={b.name}
                slug={b.slug}
                logoUrl={b.logoUrl}
                className="h-10 w-auto max-h-12 max-w-[140px] object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
