import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Smartphone,
  Truck,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & City Chip */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/genie_logo_light.png"
                alt="Genie"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 animate-genie-logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/genie_logo_transparent.png';
                }}
              />
            </Link>

            {/* Service Location Pill (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50/80 text-rose-800 text-xs font-bold border border-rose-200/60 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Doorstep Pickup Across Tamil Nadu</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
            <Link
              to="/sell"
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/sell')
                  ? 'bg-gradient-to-r from-rose-600 to-violet-600 text-white shadow-brand-sm'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-white/80'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Sell Used Phone</span>
            </Link>

            <Link
              to="/track"
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                isActive('/track')
                  ? 'bg-gradient-to-r from-rose-600 to-violet-600 text-white shadow-brand-sm'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-white/80'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Track Order</span>
            </Link>
          </nav>

          {/* Actions: Profile / Login */}
          <div className="flex items-center gap-2.5">
            {/* Auth Button or User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 py-1.5 pl-2 pr-3 rounded-2xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden sm:block">
                    {user.fullName || 'My Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-slide-up">
                    <div className="p-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.fullName || 'My Account'}
                      </p>
                      {user.phone ? (
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone}`}
                        </p>
                      ) : user.email ? (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5" title={user.email}>
                          {user.email}
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                          Verified Member
                        </p>
                      )}
                    </div>

                    <Link
                      to="/track"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition"
                    >
                      <Truck className="w-4 h-4 text-rose-600" />
                      <span>My Pickup Requests</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="py-2 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-violet-600 hover:from-rose-700 hover:to-violet-700 text-white text-xs font-bold shadow-brand-sm transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation"
            >
              {isMobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-slide-up">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200/60 mb-2">
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Doorstep Pickup Across Tamil Nadu</span>
          </div>

          <Link
            to="/sell"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 text-rose-900 font-bold text-sm border border-rose-200"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-rose-700" />
              <span>Sell Used Phone</span>
            </div>
            <span className="text-[11px] bg-gradient-to-r from-rose-600 to-violet-600 text-white px-2 py-0.5 rounded-full shadow-2xs font-bold">
              Instant Price
            </span>
          </Link>

          <Link
            to="/track"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200"
          >
            <Truck className="w-5 h-5 text-slate-700" />
            <span>Track Pickup Request</span>
          </Link>
        </div>
      )}
    </header>
  );
};
