import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../context/LocationContext';
import {
  Smartphone,
  Truck,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { GenieLogo } from '../brand/GenieLogo';

const INTRO_KEY = 'genie_logo_intro_played';

// Evaluated once per page load: the reveal plays on the first visit of a browser session
const PLAY_INTRO_ON_LOAD = (() => {
  try {
    if (sessionStorage.getItem(INTRO_KEY)) return false;
    sessionStorage.setItem(INTRO_KEY, '1');
    return true;
  } catch {
    return false;
  }
})();

const NAV_LINKS = [
  { to: '/sell', label: 'Sell Phone', icon: Smartphone },
  { to: '/track', label: 'Track Order', icon: Truck },
];

export const Navbar: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();
  const { location: savedLocation, openPicker } = useUserLocation();
  const routerLocation = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [logoPlayKey, setLogoPlayKey] = useState(0);
  const previousUserId = useRef<string | null | undefined>(undefined);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Replay the logo reveal right after the customer signs in
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (previousUserId.current === null && currentId) {
      setLogoPlayKey((k) => k + 1);
    }
    previousUserId.current = currentId;
  }, [user?.id]);

  // Close menus on navigation
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsUserMenuOpen(false);
  }, [routerLocation.pathname]);

  // Close the account menu when clicking outside it
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isUserMenuOpen]);

  const locationLabel = savedLocation
    ? `${savedLocation.area || savedLocation.city || savedLocation.district}, ${savedLocation.pincode}`
    : null;

  const initial = (user?.fullName || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-900 dark:bg-black/85">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:h-[76px]">
          {/* Logo + location */}
          <div className="flex min-w-0 items-center gap-5">
            <Link
              to="/"
              onClick={() => setLogoPlayKey((k) => k + 1)}
              className="shrink-0 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40"
              aria-label="Genie home"
            >
              <GenieLogo playKey={logoPlayKey} animateOnMount={PLAY_INTRO_ON_LOAD} />
            </Link>

            <button
              type="button"
              onClick={openPicker}
              className="hidden md:flex min-w-0 items-center gap-2 rounded-2xl px-3 py-1.5 text-left transition hover:bg-slate-100 dark:hover:bg-neutral-900"
            >
              <MapPin className="h-[18px] w-[18px] shrink-0 text-amber-500" />
              <span className="min-w-0">
                <span className="block text-[11px] font-medium leading-tight text-slate-500 dark:text-neutral-400">
                  {locationLabel ? 'Pickup location' : 'Select your location'}
                </span>
                <span className="flex items-center gap-1 text-[13px] font-semibold leading-tight text-ink dark:text-white">
                  <span className="max-w-[180px] truncate">{locationLabel || 'Tap to choose your area'}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-neutral-500" />
                </span>
              </span>
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-ink dark:text-white'
                      : 'text-slate-600 hover:text-ink hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-amber-500' : ''}`} strokeWidth={2} />
                    <span>{label}</span>
                    {isActive && (
                      <span className="absolute inset-x-4 -bottom-[17px] h-[3px] rounded-full bg-amber-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((o) => !o)}
                  className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-2.5 transition hover:border-slate-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-xs font-extrabold text-white">
                    {initial}
                  </span>
                  <span className="hidden max-w-[110px] truncate text-[13px] font-semibold text-ink dark:text-neutral-100 sm:block">
                    {user.fullName || 'My account'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-slide-up dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-bold text-ink dark:text-white">{user.fullName || 'My account'}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-neutral-400">
                        {user.email || user.phone || 'Verified member'}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-slate-100 dark:bg-neutral-900" />
                    <Link
                      to="/profile"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
                    >
                      <User className="h-4 w-4 text-slate-400 dark:text-neutral-500" /> My profile
                    </Link>
                    <Link
                      to="/track"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
                    >
                      <Truck className="h-4 w-4 text-slate-400 dark:text-neutral-500" /> My pickup requests
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-semibold text-white transition hover:bg-ink-soft dark:bg-neutral-50 dark:text-black dark:hover:bg-neutral-200"
              >
                <User className="h-4 w-4" />
                <span>Log in</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-slate-100 dark:text-neutral-100 dark:hover:bg-neutral-900 lg:hidden"
              aria-label={isMobileDrawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileDrawerOpen}
            >
              {isMobileDrawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile location bar (turncash-style "Select your location") */}
      <button
        type="button"
        onClick={openPicker}
        className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2 text-left md:hidden dark:border-neutral-900"
      >
        <MapPin className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="min-w-0 flex-1 truncate text-xs text-slate-600 dark:text-neutral-300">
          {locationLabel ? (
            <>
              Pickup at <strong className="font-semibold text-ink dark:text-white">{locationLabel}</strong>
            </>
          ) : (
            <>
              <strong className="font-semibold text-ink dark:text-white">Select your location</strong> · Tap to choose your area
            </>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
      </button>

      {/* Mobile drawer */}
      {isMobileDrawerOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 animate-slide-up dark:border-neutral-900 dark:bg-black lg:hidden">
          <nav className="space-y-1" aria-label="Mobile">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold transition ${
                    isActive
                      ? 'bg-amber-50 text-ink dark:bg-amber-400/10 dark:text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 text-amber-500" />
                {label}
              </NavLink>
            ))}
            <Link
              to="/terms"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              <FileText className="h-5 w-5 text-slate-400 dark:text-neutral-500" /> Terms & Conditions
            </Link>
            <Link
              to="/privacy"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              <ShieldCheck className="h-5 w-5 text-slate-400 dark:text-neutral-500" /> Privacy Policy
            </Link>
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 px-1 pt-3 dark:border-neutral-900">
            <span className="text-sm font-semibold text-slate-600 dark:text-neutral-300">Appearance</span>
            <ThemeToggle showLabel />
          </div>
        </div>
      )}
    </header>
  );
};
