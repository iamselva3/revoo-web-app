import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeIndianRupee, ChevronRight, ShieldCheck, Star, Truck, MapPin } from 'lucide-react';
import { catalogueApi } from '../../api/catalogue';
import { Brand, CustomerReview } from '../../types';
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
// Device drawing shown with each headline word
const HERO_ART: CategoryArtKind[] = ['phone', 'laptop', 'tablet', 'tv'];

const HERO_POINTS = [
  { icon: BadgeIndianRupee, title: 'Instant price', sub: 'Your quote in 60 seconds', tone: 'from-amber-400 to-orange-500' },
  { icon: Truck, title: 'Free pickup', sub: 'From your door, any day', tone: 'from-pink-500 to-rose-500' },
  { icon: ShieldCheck, title: 'Paid on the spot', sub: 'UPI, bank transfer or cash', tone: 'from-violet-500 to-indigo-500' },
];

/** Glassy info card floating around the hero device. */
const HeroCard: React.FC<{ point: (typeof HERO_POINTS)[number]; className?: string; delay?: string }> = ({ point, className = '', delay = '0s' }) => {
  const Icon = point.icon;
  return (
    <div
      className={`absolute flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-3.5 py-3 shadow-[0_18px_40px_-18px_rgba(76,29,149,0.35)] backdrop-blur-md motion-safe:animate-drift dark:border-neutral-800 dark:bg-neutral-900/80 ${className}`}
      style={{ animationDelay: delay }}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${point.tone} text-white shadow-md`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="pr-1">
        <span className="block text-sm font-bold text-ink dark:text-white">{point.title}</span>
        <span className="block text-xs text-slate-500 dark:text-neutral-400">{point.sub}</span>
      </span>
    </div>
  );
};

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    setIsPageLoading(true);
    Promise.all([catalogueApi.getBrands().catch(() => []), catalogueApi.getReviews('sell')])
      .then(([brandData, reviewData]) => {
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
    const id = setInterval(() => setWordIdx((p) => (p + 1) % HERO_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  if (isLoading) {
    return <PageLoadingSkeleton title="Loading Genie…" subtitle="Fetching the latest prices and offers" type="home" />;
  }

  return (
    <div className="space-y-14 pb-20 sm:space-y-20">
      {/* 1. Hero */}
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
            {/* Phones/tablets: the three promises as a compact row (the art panel is desktop only) */}
            <ul className="mt-7 grid grid-cols-3 gap-2 lg:hidden">
              {HERO_POINTS.map((p) => (
                <li key={p.title} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/70 bg-white/70 px-2 py-3 text-center backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${p.tone} text-white`}>
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-semibold leading-tight text-ink dark:text-white">{p.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop art panel: gradient glow + rings, the device for the current word, floating promises */}
          <div className="relative hidden h-[440px] lg:block" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 via-pink-400 to-violet-500 opacity-25 blur-3xl dark:opacity-30" />
            <div className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300/50 dark:border-amber-400/15" />
            <div className="absolute left-1/2 top-1/2 h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/80 dark:border-violet-400/15" />
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-100 via-pink-100 to-violet-200 shadow-[inset_0_-20px_60px_rgba(139,92,246,0.18)] dark:from-amber-500/15 dark:via-pink-500/10 dark:to-violet-600/25" />
            <span className="absolute left-[18%] top-[16%] h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.18)]" />
            <span className="absolute bottom-[18%] right-[16%] h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_0_6px_rgba(139,92,246,0.18)]" />
            <span className="absolute right-[24%] top-[10%] h-2 w-2 rounded-full bg-pink-500" />

            <div key={wordIdx} className="absolute inset-0 flex animate-fade-in items-center justify-center">
              <CategoryArt kind={HERO_ART[wordIdx]} className="h-64 w-auto drop-shadow-[0_24px_30px_rgba(76,29,149,0.25)]" />
            </div>

            <HeroCard point={HERO_POINTS[0]} className="left-0 top-12" />
            <HeroCard point={HERO_POINTS[1]} className="right-0 top-[42%]" delay="1.2s" />
            <HeroCard point={HERO_POINTS[2]} className="bottom-8 left-10" delay="2.4s" />
          </div>
        </div>
      </section>

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
