import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flame, LucideIcon, ShieldCheck, Sparkles, Wallet, Zap } from 'lucide-react';
import { Banner } from '../../types';
import { resolveImageUrl } from '../../api/client';

/** Banners the home page can show: active, not the launch popup, with a photo or a title. */
export const showableBanners = (list: Banner[]): Banner[] =>
  list
    .filter((b) => b && b.isActive !== false && !b.isPopupModal && (b.imageUrl?.trim() || b.title?.trim()))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

const WEB_PAGES = ['/sell', '/pickup', '/buy', '/track', '/profile', '/terms', '/privacy'];

/**
 * Banner links are set for the app (/catalogue/brands, /buy, /orders…). On the website they open the
 * matching page; a full web address opens in a new tab.
 */
export const bannerLink = (link?: string): { to?: string; href?: string } => {
  const l = (link || '').trim();
  if (/^https?:\/\//i.test(l)) return { href: l };
  if (!l.startsWith('/')) return { to: '/sell' };
  const path = l.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/home' || path === '/support' || path === '/login') return {};
  if (WEB_PAGES.some((p) => path === p || path.startsWith(`${p}/`))) return { to: l };
  if (path === '/orders' || path.startsWith('/requests')) return { to: '/track' };
  return { to: '/sell' }; // the app's selling screens: brands, models, evaluation, cart, pickup
};

const ICONS: Record<string, LucideIcon> = {
  flash_on: Zap,
  bolt: Zap,
  account_balance_wallet: Wallet,
  shield: ShieldCheck,
  shield_outlined: ShieldCheck,
  verified_user: ShieldCheck,
  local_fire_department: Flame,
};
const color = (c: string | undefined, fallback: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c.trim()) ? c.trim() : fallback);

/** A banner without a photo: the admin's colours and text, like the app draws it. */
const TextBanner: React.FC<{ banner: Banner }> = ({ banner: b }) => {
  const Icon = ICONS[b.icon || ''] || Sparkles;
  return (
    <span
      className="flex h-full w-full items-center gap-3 p-4 text-left text-white sm:gap-5 sm:p-6 lg:gap-8 lg:p-10"
      style={{ background: `linear-gradient(135deg, ${color(b.color1, '#4c1d95')}, ${color(b.color2, '#1a1033')})` }}
    >
      <span className="min-w-0 flex-1">
        {(b.tag || b.badge) && (
          <span className="flex flex-wrap items-center gap-1.5">
            {b.tag && (
              <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#1a1033] sm:text-[11px]">
                {b.tag}
              </span>
            )}
            {b.badge && (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]">{b.badge}</span>
            )}
          </span>
        )}
        {b.title && <span className="mt-2 line-clamp-2 block text-lg font-extrabold leading-tight sm:text-3xl lg:mt-3 lg:text-4xl">{b.title}</span>}
        {b.subtitle && <span className="mt-1 line-clamp-2 block text-xs text-white/80 sm:text-sm lg:mt-2 lg:text-base">{b.subtitle}</span>}
      </span>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber-300 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
        <Icon className="h-6 w-6 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
      </span>
    </span>
  );
};

const Slide: React.FC<{ banner: Banner; eager: boolean }> = ({ banner: b, eager }) => {
  const [broken, setBroken] = useState(false);
  const label = b.title?.trim() || b.tag?.trim() || 'Genie offer';
  // A photo banner is shown as it is, like in the app: the poster carries its own text. The banner
  // is the photo's own shape (7 : 3, the admin's "Adjust" frame) on every screen, so the photo
  // fills it edge to edge with nothing cut off.
  const body =
    b.imageUrl && !broken ? (
      <img
        src={resolveImageUrl(b.imageUrl)}
        alt={label}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={() => setBroken(true)}
        className="h-full w-full object-cover"
      />
    ) : (
      <TextBanner banner={b} />
    );
  const frame =
    'block aspect-[7/3] w-full overflow-hidden bg-slate-100 dark:bg-neutral-900 sm:rounded-3xl sm:ring-1 sm:ring-black/5 sm:dark:ring-white/10';
  const clickable = `${frame} transition-shadow hover:shadow-card-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60`;
  const link = bannerLink(b.linkUrl);
  if (link.href) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" draggable={false} className={clickable} aria-label={label}>
        {body}
      </a>
    );
  }
  if (link.to) {
    return (
      <Link to={link.to} draggable={false} className={clickable} aria-label={label}>
        {body}
      </Link>
    );
  }
  return <div className={frame}>{body}</div>;
};

const AUTO_MS = 5000;

/**
 * The admin's banners as a strip under the menu bar, one banner per page on every screen (swipe on
 * phones, arrows on computers). Phones: edge to edge with square corners (the client's layout);
 * larger screens: a rounded card the full width of the page. Always the photo's own 7 : 3 shape
 * (the frame the admin sets with "Adjust"), so it fits exactly. Moves on its own every 5 s, but
 * not while hovered, touched or focused.
 */
export const HomeBanners: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const pageRef = useRef(0);
  const pausedUntil = useRef(0);
  const hovered = useRef(false);
  const count = banners.length;

  const slideLeft = (i: number) => {
    const el = trackRef.current;
    const kids = el?.children;
    if (!el || !kids?.length) return 0;
    return (kids[Math.min(i, kids.length - 1)] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
  };

  // Where the strip is: pages = the positions it can stop at (fewer when two banners fit at once)
  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.children.length) return;
    const kids = el.children;
    const width = (kids[0] as HTMLElement).offsetWidth;
    const step = kids.length > 1 ? (kids[1] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft : width;
    const perView = Math.max(1, Math.round((el.clientWidth + step - width) / Math.max(step, 1)));
    const total = Math.max(1, kids.length - perView + 1);
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
    const current = atEnd ? total - 1 : Math.min(total - 1, Math.round(el.scrollLeft / Math.max(step, 1)));
    pageRef.current = current;
    setPages(total);
    setPage(current);
  }, []);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: slideLeft(i), behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
      ro?.disconnect();
    };
  }, [measure, count]);

  useEffect(() => {
    if (pages <= 1 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (hovered.current || document.hidden || Date.now() < pausedUntil.current) return;
      goTo((pageRef.current + 1) % pages);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [pages, goTo]);

  if (!count) return null;
  const hold = () => {
    pausedUntil.current = Date.now() + 8000;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers"
      className="mx-auto w-full max-w-7xl pb-3 sm:px-6 sm:pb-5 sm:pt-5 lg:px-8"
    >
      <div
        className="relative"
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') hovered.current = true;
        }}
        onPointerLeave={() => {
          hovered.current = false;
        }}
        onTouchStart={hold}
        onFocus={hold}
      >
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:gap-4"
        >
          {banners.map((b, i) => (
            <div
              key={b._id || i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="w-full shrink-0 snap-start"
            >
              <Slide banner={b} eager={i < 2} />
            </div>
          ))}
        </div>

        {pages > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                hold();
                goTo((page - 1 + pages) % pages);
              }}
              aria-label="Previous offer"
              className="absolute -left-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-ink shadow-md transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                hold();
                goTo((page + 1) % pages);
              }}
              aria-label="Next offer"
              className="absolute -right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-ink shadow-md transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white lg:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-2 flex justify-center">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                hold();
                goTo(i);
              }}
              aria-label={`Show offer ${i + 1}`}
              aria-current={i === page}
              className="p-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  i === page ? 'w-5 bg-amber-500' : 'w-1.5 bg-slate-300 dark:bg-neutral-700'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
