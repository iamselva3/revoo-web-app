import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeIndianRupee, ChevronRight, ShieldCheck, Star, Truck, MapPin } from 'lucide-react';
import { catalogueApi } from '../../api/catalogue';
import { resolveImageUrl } from '../../api/client';
import { Brand, Banner, CustomerReview } from '../../types';
import { usePageLoading } from '../../context/PageLoadingContext';
import { PageLoadingSkeleton } from '../../components/common/PageLoadingSkeleton';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { CategoryArt, CategoryArtKind } from '../../components/sell/CategoryArt';

const CATEGORIES: Array<{
  id: CategoryArtKind;
  tagline: string;
  title: string;
  sub: string;
  tint: string;
}> = [
  { id: 'phone', tagline: 'Cash calling', title: 'Sell Mobile', sub: 'Free doorstep pickup', tint: 'from-amber-100 via-orange-50 to-rose-100 dark:from-amber-500/15 dark:via-neutral-900 dark:to-rose-500/10' },
  { id: 'laptop', tagline: 'Upgrade ready', title: 'Sell Laptop', sub: 'The quote is the price', tint: 'from-violet-100 via-indigo-50 to-sky-100 dark:from-violet-500/15 dark:via-neutral-900 dark:to-sky-500/10' },
  { id: 'tablet', tagline: 'Hidden worth', title: 'Sell Tablet', sub: 'Paid by UPI at your door', tint: 'from-sky-100 via-cyan-50 to-emerald-100 dark:from-sky-500/15 dark:via-neutral-900 dark:to-emerald-500/10' },
  { id: 'tv', tagline: 'Big screen, big cash', title: 'Sell Smart TV', sub: 'Paid before we leave', tint: 'from-rose-100 via-pink-50 to-fuchsia-100 dark:from-rose-500/15 dark:via-neutral-900 dark:to-fuchsia-500/10' },
];

const HERO_WORDS = ['phone', 'laptop', 'tablet', 'smart TV'];

const WHY = [
  { icon: Truck, title: 'Collected from your door', text: 'Pick a slot. A verified Genie agent comes to your home or office anywhere in Tamil Nadu.' },
  { icon: ShieldCheck, title: 'The quote is the price', text: "Answer honestly and the price you see online is the price you're paid. No haggling at the door." },
  { icon: BadgeIndianRupee, title: 'Paid before we leave', text: 'UPI, bank transfer or cash, done on the spot after a quick 2-minute check.' },
];

const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
    <div>
      <h2 className="text-xl font-bold tracking-tight text-ink dark:text-white sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setIsPageLoading } = usePageLoading();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    setIsPageLoading(true);
    Promise.all([catalogueApi.getBanners(), catalogueApi.getBrands().catch(() => []), catalogueApi.getReviews('sell')])
      .then(([bannerData, brandData, reviewData]) => {
        setBanners(bannerData);
        setBrands(brandData);
        setReviews(reviewData);
      })
      .catch((err) => console.error('Error loading home data:', err))
      .finally(() => {
        setIsLoading(false);
        setIsPageLoading(false);
      });
    return () => setIsPageLoading(false);
  }, [setIsPageLoading]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setActiveBannerIdx((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  useEffect(() => {
    const id = setInterval(() => setWordIdx((p) => (p + 1) % HERO_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  if (isLoading) {
    return <PageLoadingSkeleton title="Loading Genie…" subtitle="Fetching the latest prices and offers" type="home" />;
  }

  return (
    <div className="space-y-14 pb-20 sm:space-y-20">
      {/* 1. Hero */}
      {banners.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <div className="relative h-[260px] overflow-hidden rounded-3xl bg-ink sm:h-[360px] lg:h-[420px]">
            {banners.map((b, idx) => (
              <div
                key={b._id || `banner-${idx}`}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === activeBannerIdx ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'}`}
                aria-hidden={idx !== activeBannerIdx}
              >
                <img
                  src={resolveImageUrl(b.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/30 to-transparent sm:items-center sm:bg-gradient-to-r">
                  <div className="max-w-xl space-y-3 p-6 sm:p-12">
                    <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{b.title}</h1>
                    {b.subtitle && <p className="line-clamp-2 text-sm text-white/80">{b.subtitle}</p>}
                    <Link to={b.ctaLink || '/sell'} className="btn-genie !inline-flex">
                      {b.ctaText || 'Get your price'} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {banners.length > 1 && (
              <div className="absolute bottom-4 right-5 z-20 flex gap-1.5">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveBannerIdx(idx)}
                    aria-label={`Show slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${idx === activeBannerIdx ? 'w-7 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="border-b border-slate-100 bg-gradient-to-br from-amber-50 via-white to-violet-50 dark:border-neutral-900 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-neutral-900 dark:text-amber-300">
                <MapPin className="h-3.5 w-3.5" /> Free doorstep pickup across Tamil Nadu
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-ink dark:text-white sm:text-5xl">
                Sell your old{' '}
                <span key={wordIdx} className="inline-block animate-slide-up bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                  {HERO_WORDS[wordIdx]}
                </span>
                <br />
                for cash.
              </h1>
              <p className="mt-4 max-w-md text-base text-slate-600 dark:text-neutral-300">
                Get your exact price in 60 seconds, a free pickup from your door, and payment before our agent leaves.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/sell" className="btn-genie !text-base">
                  Get your price <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/track" className="btn-ghost">
                  Track a pickup
                </Link>
              </div>
            </div>
            <div className="hidden justify-center lg:flex">
              <CategoryArt kind="phone" className="h-80 w-auto" />
            </div>
          </div>
        </section>
      )}

      {/* 2. Sell your gadgets (category cards) */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Choose a category to sell"
          subtitle="Phones, laptops, tablets and TVs, all picked up free from your door."
          action={
            <Link to="/sell" className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-ink hover:text-amber-600 dark:text-white dark:hover:text-amber-300">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/sell?category=${c.id}`)}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <span className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${c.tint} p-3 sm:p-5`}>
                <CategoryArt kind={c.id} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
              </span>
              <span className="flex flex-1 flex-col p-3.5 sm:p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300">{c.tagline}</span>
                <span className="mt-1 flex items-center justify-between gap-2 text-base font-bold text-ink dark:text-white sm:text-lg">
                  {c.title}
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ink dark:text-neutral-500 dark:group-hover:text-white" />
                </span>
                <span className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400 sm:text-sm">{c.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Top brands */}
      {brands.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Top brands"
            subtitle="Every brand worth naming, priced to the model."
            action={
              <Link to="/sell" className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-ink hover:text-amber-600 dark:text-white dark:hover:text-amber-300">
                All brands <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 lg:grid-cols-8">
            {brands.slice(0, 16).map((b) => (
              <button
                key={b._id}
                type="button"
                onClick={() => navigate(`/sell?brand=${b.slug}`)}
                title={`Sell old ${b.name} phone`}
                className="logo-tile group flex h-16 items-center justify-center rounded-2xl border border-slate-200 px-3 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:border-neutral-800 sm:h-20 sm:px-4"
              >
                <BrandLogo name={b.name} slug={b.slug} logoUrl={b.logoUrl} className="h-7 w-full max-w-[90px] sm:h-8" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. Why Genie */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Why Genie" subtitle="Built so nothing changes at the door." />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WHY.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="surface p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-4xl font-bold text-slate-100 dark:text-neutral-900">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink dark:text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-neutral-400">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/sell" className="btn-genie !text-base">
            Check your phone's price <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* 5. Reviews */}
      {reviews.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Loved by sellers across Tamil Nadu" subtitle="Real feedback from Genie customers." />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r, idx) => {
              const name = r.customerName || 'Verified customer';
              const amount = (r as any).amount;
              return (
                <figure key={r._id || `review-${idx}`} className="surface flex flex-col justify-between gap-4 p-5">
                  <div>
                    <div className="flex gap-0.5" aria-label={`${r.rating || 5} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < (r.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-neutral-800'}`} />
                      ))}
                    </div>
                    <blockquote className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-neutral-300">“{r.comment}”</blockquote>
                  </div>
                  <figcaption className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs dark:border-neutral-900">
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-xs font-bold text-white">
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <span className="block font-semibold text-ink dark:text-white">{name}</span>
                        <span className="block text-slate-500 dark:text-neutral-500">{r.city || 'Tamil Nadu'}</span>
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-medium text-slate-700 dark:text-neutral-300">{r.deviceModel}</span>
                      {amount && <span className="block font-semibold text-emerald-600 dark:text-emerald-400">₹{Number(amount).toLocaleString('en-IN')} paid</span>}
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
