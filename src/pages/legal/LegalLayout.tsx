import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock,
  Info,
  ListOrdered,
  Mail,
  Phone,
  type LucideIcon,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Shared constants                                                          */
/* -------------------------------------------------------------------------- */

export const LEGAL_LAST_UPDATED = '11 November 2026';
const LEGAL_LAST_UPDATED_ISO = '2026-11-11';

export const SUPPORT_EMAIL = 'genietnsupport@gmail.com';
export const SUPPORT_PHONE_DISPLAY = '+91 93638 59553';
const SUPPORT_PHONE_TEL = '+919363859553';
export const SUPPORT_HOURS = '9 AM – 9 PM IST';

/** Distance (px) below the viewport top at which a section counts as "current". */
const SCROLL_SPY_OFFSET = 120;

/* -------------------------------------------------------------------------- */
/*  Scrolling helpers                                                         */
/* -------------------------------------------------------------------------- */

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Smoothly scrolls to a section (its `scroll-mt-24` keeps it clear of the sticky
 * navbar), moves keyboard focus to its heading and updates the URL hash without
 * triggering a router navigation (which would otherwise reset the scroll position).
 */
export const jumpToSection = (id: string): boolean => {
  const section = document.getElementById(id);
  if (!section) return false;

  section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });

  const heading = document.getElementById(`${id}-heading`);
  heading?.focus({ preventScroll: true });

  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(window.history.state, '', `#${id}`);
  }
  return true;
};

const isModifiedClick = (e: React.MouseEvent) =>
  e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

/* -------------------------------------------------------------------------- */
/*  Content building blocks (used by the Terms and Privacy pages)             */
/* -------------------------------------------------------------------------- */

interface ChildrenProps {
  children: React.ReactNode;
}

/** Bulleted list with amber markers. */
export const LegalList: React.FC<ChildrenProps> = ({ children }) => (
  <ul className="list-disc space-y-2 pl-5 marker:text-amber-500">{children}</ul>
);

/** Numbered list with amber markers. */
export const LegalOrderedList: React.FC<ChildrenProps> = ({ children }) => (
  <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-amber-600 dark:marker:text-amber-400">
    {children}
  </ol>
);

export const LegalSubheading: React.FC<ChildrenProps> = ({ children }) => (
  <h3 className="pt-2 text-[15px] font-semibold text-slate-900 dark:text-white">{children}</h3>
);

/** Emphasised inline text that stays readable in both themes. */
export const Em: React.FC<ChildrenProps> = ({ children }) => (
  <strong className="font-semibold text-slate-800 dark:text-neutral-100">{children}</strong>
);

/** Highlighted note used for the most important points in a section. */
export const LegalCallout: React.FC<ChildrenProps & { title?: string }> = ({ title, children }) => (
  <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
    <div className="min-w-0 space-y-1 break-words">
      {title && <p className="font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  </div>
);

const linkClass =
  'font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 transition-colors hover:text-amber-800 hover:decoration-amber-500 dark:text-amber-400 dark:decoration-amber-500/40 dark:hover:text-amber-300 break-words';

/** Link to another route of the app (e.g. "/privacy", "/track"). */
export const InlineLink: React.FC<ChildrenProps & { to: string }> = ({ to, children }) => (
  <Link to={to} className={linkClass}>
    {children}
  </Link>
);

/** Link to another section on the same page. */
export const SectionLink: React.FC<ChildrenProps & { id: string }> = ({ id, children }) => (
  <a
    href={`#${id}`}
    className={linkClass}
    onClick={(e) => {
      if (isModifiedClick(e)) return;
      if (jumpToSection(id)) e.preventDefault();
    }}
  >
    {children}
  </a>
);

/** External / protocol link (mailto:, tel:, https:). */
export const ExternalLink: React.FC<ChildrenProps & { href: string }> = ({ href, children }) => {
  const isWeb = href.startsWith('http');
  return (
    <a
      href={href}
      className={linkClass}
      {...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
};

/** Email / phone / hours block shown in the contact & grievance sections. */
export const LegalContactCard: React.FC = () => {
  const itemClass =
    'flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-amber-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-amber-500/40';
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400';
  const valueClass = 'mt-0.5 block break-words font-semibold text-slate-900 dark:text-white';

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a href={`mailto:${SUPPORT_EMAIL}`} className={itemClass}>
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span className="min-w-0">
          <span className={labelClass}>Email</span>
          <span className={valueClass}>{SUPPORT_EMAIL}</span>
        </span>
      </a>
      <a href={`tel:${SUPPORT_PHONE_TEL}`} className={itemClass}>
        <Phone className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span className="min-w-0">
          <span className={labelClass}>Phone</span>
          <span className={valueClass}>{SUPPORT_PHONE_DISPLAY}</span>
          <span className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-neutral-400">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {SUPPORT_HOURS}
          </span>
        </span>
      </a>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Page layout                                                               */
/* -------------------------------------------------------------------------- */

export interface LegalSection {
  /** Anchor id (used in the URL hash and table of contents). */
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalLayoutProps {
  icon: LucideIcon;
  title: string;
  summary: React.ReactNode;
  sections: LegalSection[];
  crossLink: {
    to: string;
    title: string;
    description: string;
  };
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ icon: Icon, title, summary, sections, crossLink }) => {
  const { hash } = useLocation();
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  const mobileTocRef = useRef<HTMLDetailsElement>(null);
  const sectionKey = sections.map((s) => s.id).join('|');

  // Scroll-spy: highlight the last section whose top has passed below the navbar.
  useEffect(() => {
    const ids = sectionKey ? sectionKey.split('|') : [];
    if (ids.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - SCROLL_SPY_OFFSET <= 0) current = id;
        else break;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sectionKey]);

  // Deep links such as /terms#cancellation: scroll once the page has rendered
  // (runs after the global ScrollToTop reset on route change).
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      setActiveId(id);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [hash]);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (isModifiedClick(e)) return;
    e.preventDefault();
    setActiveId(id);
    const details = mobileTocRef.current;
    if (details?.open) {
      // Collapse first so the scroll target is measured against the final layout.
      details.open = false;
      window.requestAnimationFrame(() => jumpToSection(id));
    } else {
      jumpToSection(id);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* ---------------------------------------------------------------- Header */}
        <header className="mb-8 max-w-3xl sm:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            Legal
          </span>
          <h1 className="mt-4 break-words text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-neutral-400">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Last updated: <time dateTime={LEGAL_LAST_UPDATED_ISO}>{LEGAL_LAST_UPDATED}</time>
            </span>
          </p>
          <p className="mt-4 break-words text-sm leading-relaxed text-slate-600 dark:text-neutral-300 sm:text-base">
            {summary}
          </p>
        </header>

        {/* ------------------------------------------------- Mobile table of contents */}
        <details
          ref={mobileTocRef}
          className="group mb-6 rounded-2xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 lg:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 items-center gap-2">
              <ListOrdered className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span className="truncate">On this page</span>
              <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-neutral-400">
                · {sections.length} sections
              </span>
            </span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 dark:text-neutral-400"
              aria-hidden="true"
            />
          </summary>
          <nav aria-label="Table of contents" className="border-t border-slate-200 px-2 py-2 dark:border-neutral-800">
            <ol className="max-h-[60vh] space-y-0.5 overflow-y-auto">
              {sections.map((section, index) => {
                const isActive = section.id === activeId;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => handleTocClick(e, section.id)}
                      aria-current={isActive ? 'location' : undefined}
                      className={`flex gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-amber-50 font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-neutral-300 dark:hover:bg-neutral-900'
                      }`}
                    >
                      <span className="w-5 shrink-0 text-right tabular-nums opacity-70">{index + 1}.</span>
                      <span className="min-w-0 break-words">{section.title}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        </details>

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:gap-12">
          {/* ------------------------------------------- Desktop sticky table of contents */}
          <aside className="hidden lg:block">
            <nav
              aria-label="Table of contents"
              className="sticky top-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto pb-4 pr-1"
            >
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-500">
                On this page
              </p>
              <ol className="space-y-0.5 border-l border-slate-200 dark:border-neutral-800">
                {sections.map((section, index) => {
                  const isActive = section.id === activeId;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(e) => handleTocClick(e, section.id)}
                        aria-current={isActive ? 'location' : undefined}
                        className={`-ml-px flex gap-2 border-l-2 py-1.5 pl-3 pr-2 text-[13px] leading-snug transition-colors ${
                          isActive
                            ? 'border-amber-500 bg-amber-50/70 font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-900'
                        }`}
                      >
                        <span className="w-5 shrink-0 tabular-nums opacity-70">{index + 1}.</span>
                        <span className="min-w-0">{section.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          {/* ------------------------------------------------------------- Content */}
          <div className="min-w-0 space-y-4 sm:space-y-5">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-heading`}
                className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 sm:p-7"
              >
                <h2
                  id={`${section.id}-heading`}
                  tabIndex={-1}
                  className="flex scroll-mt-24 items-start gap-3 text-lg font-bold leading-snug text-slate-900 focus:outline-none dark:text-white sm:text-xl"
                >
                  <span
                    className="mt-px inline-flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-lg bg-amber-50 px-1.5 text-xs font-bold tabular-nums text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 break-words pt-0.5">{section.title}</span>
                </h2>
                <div className="mt-4 space-y-3 break-words text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
                  {section.content}
                </div>
              </section>
            ))}

            {/* ----------------------------------------------------------- Cross-link */}
            <Link
              to={crossLink.to}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-amber-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-amber-500/40 sm:p-6"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Also read
                </span>
                <span className="mt-1 block break-words text-base font-bold text-slate-900 dark:text-white">
                  {crossLink.title}
                </span>
                <span className="mt-1 block break-words text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
                  {crossLink.description}
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-amber-600 transition-transform group-hover:translate-x-1 dark:text-amber-400"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
