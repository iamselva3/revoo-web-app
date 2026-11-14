import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Zap, Lock, BadgeIndianRupee, Mail, Phone, MapPin } from 'lucide-react';
import { GenieLogo } from '../brand/GenieLogo';

const PILLARS = [
  { icon: Zap, title: 'Instant valuation', text: 'Your exact price in under 60 seconds.' },
  { icon: Truck, title: 'Free doorstep pickup', text: 'Verified agents come to your home or office.' },
  { icon: Lock, title: 'Certified data wipe', text: 'Your data is securely erased on every device.' },
  { icon: BadgeIndianRupee, title: 'Paid before we leave', text: 'UPI, bank transfer or cash at handover.' },
];

const SELL_LINKS = [
  { label: 'Sell Apple iPhone', to: '/sell?brand=apple' },
  { label: 'Sell Samsung Galaxy', to: '/sell?brand=samsung' },
  { label: 'Sell OnePlus', to: '/sell?brand=oneplus' },
  { label: 'Sell Google Pixel', to: '/sell?brand=google' },
  { label: 'Sell Laptop', to: '/sell?category=laptop' },
];

const HELP_LINKS = [
  { label: 'Track your pickup', to: '/track' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Cancellation Policy', to: '/terms#cancellation' },
];

const CITIES = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'];

const linkClass =
  'text-[13px] text-slate-600 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-white';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white pb-24 pt-12 dark:border-neutral-900 dark:bg-neutral-950 lg:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Promise strip */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-[#faf9fd] p-4 dark:border-neutral-800 dark:bg-black"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-ink dark:text-white">{title}</h4>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-neutral-400">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          <div className="col-span-2 space-y-4 md:col-span-1">
            <GenieLogo size="sm" />
            <p className="max-w-xs text-[13px] leading-relaxed text-slate-600 dark:text-neutral-400">
              Sell your old phone for the best price, picked up free from your door and paid before our agent leaves.
            </p>
            <div className="space-y-2 text-[13px] text-slate-600 dark:text-neutral-400">
              <a href="tel:+919363859553" className="flex items-center gap-2 hover:text-ink dark:hover:text-white">
                <Phone className="h-4 w-4 text-amber-500" /> +91 93638 59553 <span className="text-xs">(9 AM – 9 PM)</span>
              </a>
              <a href="mailto:genietnsupport@gmail.com" className="flex items-center gap-2 hover:text-ink dark:hover:text-white">
                <Mail className="h-4 w-4 text-amber-500" /> genietnsupport@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink dark:text-white">Sell devices</h4>
            <ul className="space-y-2.5">
              {SELL_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink dark:text-white">Help & policies</h4>
            <ul className="space-y-2.5">
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink dark:text-white">Pickup cities</h4>
            <ul className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-neutral-800 dark:text-neutral-400"
                >
                  <MapPin className="h-3 w-3 text-amber-500" /> {c}
                </li>
              ))}
              <li className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 dark:border-neutral-700 dark:text-neutral-500">
                + all of Tamil Nadu
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-neutral-900 dark:text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Genie. All rights reserved.</p>
          <p>Prices shown are for devices in top condition.</p>
        </div>
      </div>
    </footer>
  );
};
